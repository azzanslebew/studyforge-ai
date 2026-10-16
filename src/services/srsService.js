/**
 * Spaced Repetition System (SRS) using SuperMemo SM-2 Algorithm variant
 * Ratings:
 * 1 = 'again' (Ulangi - Lupa total)
 * 2 = 'hard' (Sulit - Mengingat dengan susah payah)
 * 3 = 'good' (Bagus - Mengingat tepat waktu)
 * 4 = 'easy' (Mudah - Mengingat seketika tanpa usaha)
 */

export function calculateNextReview(card, rating) {
  // Normalize existing properties
  let repetitions = card.repetitions || 0;
  let easeFactor = card.easeFactor || 2.5;
  let interval = card.interval || 1;

  let quality = 3;
  if (rating === 'again') quality = 1;
  else if (rating === 'hard') quality = 2;
  else if (rating === 'good') quality = 4;
  else if (rating === 'easy') quality = 5;

  if (quality < 3) {
    // Reset repetitions if forgotten
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update Ease Factor (SM-2 formula)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (easeFactor > 2.8) easeFactor = 2.8;

  // Bonus for 'easy'
  if (rating === 'easy') {
    interval = Math.round(interval * 1.3);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + interval);
  const nextReviewDate = nextDate.toISOString().split('T')[0];

  const status = quality < 3 ? 'learning' : 'learned';

  return {
    repetitions,
    easeFactor: parseFloat(easeFactor.toFixed(2)),
    interval,
    nextReviewDate,
    status,
    lastReviewed: new Date().toISOString()
  };
}
