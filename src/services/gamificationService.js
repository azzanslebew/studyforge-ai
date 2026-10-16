import confetti from 'canvas-confetti';
import { db } from './db.js';

export const LEVEL_TITLES = {
  1: 'Mahasiswa Baru',
  2: 'Penjelajah Ilmu',
  3: 'Peneliti Muda',
  4: 'Cendekiawan Kampus',
  5: 'Master Akademisi',
  6: 'Profesor Cilik',
  7: 'Begawan Studi'
};

export function calculateLevel(xp = 0) {
  // Level threshold: Level 1 (0-99), Level 2 (100-249), Level 3 (250-499), etc.
  const level = Math.max(1, Math.floor(Math.sqrt(xp / 40)) + 1);
  const currentLevelMinXp = Math.round(Math.pow(level - 1, 2) * 40);
  const nextLevelXp = Math.round(Math.pow(level, 2) * 40);
  const progressInLevel = Math.max(0, xp - currentLevelMinXp);
  const xpNeeded = Math.max(1, nextLevelXp - currentLevelMinXp);
  const percentage = Math.min(100, Math.round((progressInLevel / xpNeeded) * 100));

  return {
    level,
    title: LEVEL_TITLES[level] || 'Begawan Studi',
    currentXp: xp,
    currentLevelMinXp,
    nextLevelXp,
    progressPercentage: percentage,
    xpToNext: Math.max(0, nextLevelXp - xp)
  };
}

export function fireConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  } catch (e) {
    // Graceful silent fallback if confetti canvas is not supported
  }
}

export async function awardXp(amount, reason = '') {
  try {
    const profile = await db.userProfile.get('current_user');
    if (!profile) return null;

    const oldLevel = calculateLevel(profile.xp || 0).level;
    const newXp = (profile.xp || 0) + amount;
    const newLevelInfo = calculateLevel(newXp);

    let leveledUp = false;
    if (newLevelInfo.level > oldLevel) {
      leveledUp = true;
      fireConfetti();
    }

    // Update streak if studying today
    const today = new Date().toISOString().split('T')[0];
    let newStreak = profile.streak || 1;

    if (profile.lastStudyDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (profile.lastStudyDate === yesterday) {
        newStreak += 1;
      } else if (!profile.lastStudyDate) {
        newStreak = 1;
      } else {
        newStreak = 1; // streak reset if skipped more than 1 day
      }
    }

    await db.userProfile.update('current_user', {
      xp: newXp,
      level: newLevelInfo.level,
      streak: newStreak,
      lastStudyDate: today,
    });

    // Check achievements
    await checkAchievements(newXp, newStreak);

    return {
      awarded: amount,
      reason,
      totalXp: newXp,
      leveledUp,
      levelInfo: newLevelInfo,
      streak: newStreak
    };
  } catch (err) {
    console.error('Error awarding XP:', err);
    return null;
  }
}

export async function checkAchievements(currentXp, currentStreak) {
  try {
    const achievements = await db.achievements.toArray();
    const now = new Date().toISOString();

    for (const ach of achievements) {
      if (ach.unlockedAt) continue; // Already unlocked

      let shouldUnlock = false;

      if (ach.code === 'STREAK_3' && currentStreak >= 3) {
        shouldUnlock = true;
      } else if (ach.code === 'FLASHCARD_10') {
        const count = await db.flashcards.where('repetitions').above(0).count();
        if (count >= 10) shouldUnlock = true;
        await db.achievements.update(ach.id, { progress: Math.min(10, count) });
      }

      if (shouldUnlock) {
        await db.achievements.update(ach.id, {
          unlockedAt: now,
          progress: ach.maxProgress
        });
        fireConfetti();
      }
    }
  } catch (err) {
    console.error('Achievement check error:', err);
  }
}
