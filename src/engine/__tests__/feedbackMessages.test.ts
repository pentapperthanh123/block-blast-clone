/**
 * Unit tests: feedback overlay store wiring on clear
 */

import { scoreCalculator } from '../ScoreCalculator';

describe('Feedback messages on clear', () => {
  it('returns Good for 1 line', () => {
    const result = scoreCalculator.calculateLineClearPoints(1, 0);
    expect(result.feedbackTier).toBe('Good');
    expect(result.finalPoints).toBeGreaterThan(0);
  });

  it('returns Perfect for 2 lines', () => {
    expect(scoreCalculator.getFeedbackTier(2)).toBe('Perfect');
  });

  it('returns Awesome for 3 lines', () => {
    expect(scoreCalculator.getFeedbackTier(3)).toBe('Awesome');
  });

  it('returns Unbelievable for 4+ lines', () => {
    expect(scoreCalculator.getFeedbackTier(4)).toBe('Unbelievable');
    expect(scoreCalculator.getFeedbackTier(5)).toBe('Unbelievable');
  });
});
