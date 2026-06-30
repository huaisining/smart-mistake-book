import { calculateNextReview, formatInterval } from '../src/lib/spaced-repetition';

describe('SM-2 Spaced Repetition Algorithm', () => {
  const baseMistake = {
    id: 'test',
    content: 'Test question',
    mistakeType: 'concept' as const,
    difficulty: 3,
    masteryLevel: 0,
    nextReviewDate: new Date(),
    interval: 1,
    repetitions: 0,
    elapsed: 2.5,
    timesReviewed: 0,
    notebookId: 'nb1',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  describe('calculateNextReview', () => {
    test('should reset on "again" rating', () => {
      const result = calculateNextReview(baseMistake, 'again');
      
      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.masteryLevel).toBe(0);
    });

    test('should increase interval on "good" rating', () => {
      const updatedMistake = {
        ...baseMistake,
        repetitions: 1,
        interval: 6,
        elapsed: 2.5
      };
      
      const result = calculateNextReview(updatedMistake, 'good');
      
      expect(result.interval).toBeGreaterThan(6);
      expect(result.repetitions).toBeGreaterThan(0);
      expect(result.masteryLevel).toBeGreaterThan(0);
    });

    test('should give smallest interval increase on "hard" rating', () => {
      const updatedMistake = {
        ...baseMistake,
        repetitions: 2,
        interval: 10,
        elapsed: 2.5
      };
      
      const result = calculateNextReview(updatedMistake, 'hard');
      
      expect(result.interval).toBeGreaterThan(10);
      expect(result.interval).toBeLessThan(
        calculateNextReview(updatedMistake, 'good').interval
      );
    });

    test('should give largest interval increase on "easy" rating', () => {
      const updatedMistake = {
        ...baseMistake,
        repetitions: 2,
        interval: 10,
        elapsed: 2.5
      };
      
      const result = calculateNextReview(updatedMistake, 'easy');
      
      expect(result.interval).toBeGreaterThan(
        calculateNextReview(updatedMistake, 'good').interval
      );
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    test('should cap ease factor at minimum 1.3', () => {
      const result = calculateNextReview(
        { ...baseMistake, elapsed: 1.4 },
        'again'
      );
      
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    test('should cap mastery level at 5', () => {
      const maxMistake = {
        ...baseMistake,
        masteryLevel: 5,
        repetitions: 10,
        interval: 30,
        elapsed: 3.0
      };
      
      const result = calculateNextReview(maxMistake, 'easy');
      
      expect(result.masteryLevel).toBe(5);
    });
  });

  describe('formatInterval', () => {
    test('should format 0 days as today', () => {
      expect(formatInterval(0)).toBe('今天');
    });

    test('should format 1 day as tomorrow', () => {
      expect(formatInterval(1)).toBe('明天');
    });

    test('should format days correctly', () => {
      expect(formatInterval(3)).toBe('3 天后');
    });

    test('should format weeks correctly', () => {
      expect(formatInterval(14)).toBe('2 周后');
    });

    test('should format months correctly', () => {
      expect(formatInterval(60)).toBe('2 个月后');
    });

    test('should format years correctly', () => {
      expect(formatInterval(730)).toBe('2.0 年后');
    });
  });
});
