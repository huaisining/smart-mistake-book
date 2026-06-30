import { Mistake } from '@/types';

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the algorithm used by Anki and SuperMemo
 */

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

export interface SM2Result {
  interval: number; // days until next review
  repetitions: number;
  easeFactor: number;
  masteryLevel: number;
}

export function calculateNextReview(
  mistake: Mistake,
  rating: ReviewRating
): SM2Result {
  const { interval, repetitions, elapsed: easeFactor } = mistake;
  
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  let newRepetitions = repetitions;
  let masteryLevel = mistake.masteryLevel;

  // Adjust ease factor based on rating
  switch (rating) {
    case 'again':
      newRepetitions = 0;
      newInterval = 1;
      newEaseFactor = Math.max(1.3, easeFactor - 0.2);
      masteryLevel = 0;
      break;
      
    case 'hard':
      newInterval = Math.max(1, Math.round(interval * 1.2));
      newEaseFactor = Math.max(1.3, easeFactor - 0.15);
      masteryLevel = Math.min(5, masteryLevel + 1);
      break;
      
    case 'good':
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * easeFactor);
      }
      masteryLevel = Math.min(5, masteryLevel + 1);
      break;
      
    case 'easy':
      if (repetitions === 0) {
        newInterval = 4;
      } else if (repetitions === 1) {
        newInterval = 9;
      } else {
        newInterval = Math.round(interval * easeFactor * 1.3);
      }
      newEaseFactor += 0.15;
      masteryLevel = 5;
      break;
  }

  // Calculate mastery level (0-5)
  if (rating === 'again') {
    masteryLevel = Math.max(0, masteryLevel - 1);
  }

  return {
    interval: newInterval,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    masteryLevel,
  };
}

/**
 * Get review due dates based on SM-2 algorithm
 */
export function getDueDates(): { [key: string]: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return {
    'again': new Date(today.getTime() + 15 * 60 * 1000), // 15 minutes
    'hard': new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 day
    'good': new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
    'easy': new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
  };
}

/**
 * Format interval for display
 */
export function formatInterval(days: number): string {
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days < 7) return `${days} 天后`;
  if (days < 30) return `${Math.floor(days / 7)} 周后`;
  if (days < 365) return `${Math.floor(days / 30)} 个月后`;
  return `${(days / 365).toFixed(1)} 年后`;
}
