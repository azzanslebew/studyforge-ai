import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, seedInitialDataIfEmpty, clearAllData } from '../services/db.js';
import { calculateLevel, awardXp as serviceAwardXp } from '../services/gamificationService.js';
import { checkBackendHealth } from '../services/aiService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState({
    checked: false,
    hasKey: false,
    status: 'checking',
    model: 'gemini-1.5-flash',
  });
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const refreshProfile = async () => {
    try {
      await seedInitialDataIfEmpty();
      let current = await db.userProfile.get('current_user');
      if (!current) {
        current = {
          id: 'current_user',
          displayName: 'Pelajar Cerdas',
          educationLevel: 'Universitas (S1)',
          university: '',
          subjects: ['Umum'],
          weeklyGoalMinutes: 240,
          explanationStyle: 'Lengkap & Akademis',
          xp: 100,
          level: 1,
          streak: 1,
          lastStudyDate: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString()
        };
        await db.userProfile.put(current);
      }
      setProfile(current);
    } catch (err) {
      console.error('Failed to load user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAI = async () => {
    try {
      const health = await checkBackendHealth();
      setAiStatus({
        checked: true,
        hasKey: health?.aiConfig?.hasKey || false,
        status: health?.aiConfig?.status || 'demo_mode',
        model: health?.aiConfig?.model || 'gemini-1.5-flash'
      });
    } catch (e) {
      setAiStatus({
        checked: true,
        hasKey: false,
        status: 'demo_mode',
        model: 'gemini-1.5-flash'
      });
    }
  };

  useEffect(() => {
    refreshProfile();
    checkAI();
  }, []);

  const updateProfile = async (updates) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    await db.userProfile.put(updated);
    setProfile(updated);
  };

  const handleAwardXp = async (amount, reason) => {
    const result = await serviceAwardXp(amount, reason);
    if (result) {
      setProfile(prev => ({
        ...prev,
        xp: result.totalXp,
        level: result.levelInfo.level,
        streak: result.streak
      }));
    }
    return result;
  };

  const resetToEmpty = async () => {
    await clearAllData(true);
    await refreshProfile();
  };

  const resetToDemo = async () => {
    await clearAllData(false);
    await refreshProfile();
  };

  const resetAllData = resetToDemo;

  const levelInfo = profile ? calculateLevel(profile.xp || 0) : calculateLevel(0);

  return (
    <AuthContext.Provider
      value={{
        profile,
        loading,
        aiStatus,
        checkAI,
        levelInfo,
        updateProfile,
        awardXp: handleAwardXp,
        resetAllData,
        resetToEmpty,
        resetToDemo,
        onboardingOpen,
        setOnboardingOpen
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
