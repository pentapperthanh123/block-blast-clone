/**
 * Enhanced ScoreCalculator Tests - Updated for exponential scoring system
 */

import { ScoreCalculator } from '../ScoreCalculator';
import { BlockShape } from '../../types';

describe('ScoreCalculator - Enhanced Scoring System', () => {
  let scoreCalculator: ScoreCalculator;

  beforeEach(() => {
    scoreCalculator = new ScoreCalculator();
  });

  describe('calculateBlockPlacementPoints', () => {
    it('should calculate 10 points per cell', () => {
      const singleBlock: BlockShape = {
        id: 'test', shape: [[1]], color: '#FF0000'
      };
      expect(scoreCalculator.calculateBlockPlacementPoints(singleBlock)).toBe(10);

      const lBlock: BlockShape = {
        id: 'test',
        shape: [[1, 0], [1, 0], [1, 1]],
        color: '#FF0000'
      };
      expect(scoreCalculator.calculateBlockPlacementPoints(lBlock)).toBe(40);
    });
  });

  describe('Exponential Line Clear Scoring', () => {
    it('should use exponential base scores', () => {
      // Test the exponential progression
      const result1 = scoreCalculator.calculateLineClearPoints(1, 0);
      expect(result1.basePoints).toBe(100);  // 1 line = 100

      const result2 = scoreCalculator.calculateLineClearPoints(2, 0);
      expect(result2.basePoints).toBe(300);  // 2 lines = 3x base (not 2x!)

      const result3 = scoreCalculator.calculateLineClearPoints(3, 0);
      expect(result3.basePoints).toBe(800);  // 3 lines = 8x base

      const result4 = scoreCalculator.calculateLineClearPoints(4, 0);
      expect(result4.basePoints).toBe(1500); // 4 lines = 15x base
    });
  });

  describe('Progressive Combo Multiplier', () => {
    it('should calculate progressive combo multipliers', () => {
      expect(scoreCalculator.getComboMultiplier(0)).toBe(1.0);   // No combo
      expect(scoreCalculator.getComboMultiplier(1)).toBe(1.2);   // 1.0 + 0.2
      expect(scoreCalculator.getComboMultiplier(2)).toBe(1.4);   // 1.0 + 0.4
      expect(scoreCalculator.getComboMultiplier(5)).toBe(2.0);   // 1.0 + 1.0
      expect(scoreCalculator.getComboMultiplier(15)).toBe(4.0);  // Capped at 4.0x
    });

    it('should apply progressive combo to scoring', () => {
      const result = scoreCalculator.calculateLineClearPoints(1, 3); // Combo 3 = 1.6x
      expect(result.comboMultiplier).toBe(1.6);
      expect(result.finalPoints).toBe(160); // 100 * 1.6
    });
  });

  describe('Feedback Tier System', () => {
    it('should classify feedback tiers correctly', () => {
      expect(scoreCalculator.getFeedbackTier(1)).toBe('Good');
      expect(scoreCalculator.getFeedbackTier(2)).toBe('Perfect');
      expect(scoreCalculator.getFeedbackTier(3)).toBe('Awesome');
      expect(scoreCalculator.getFeedbackTier(4)).toBe('Unbelievable');
      expect(scoreCalculator.getFeedbackTier(5)).toBe('Unbelievable');
    });
  });

  describe('Complete Scoring Examples', () => {
    const singleBlock: BlockShape = { id: 'test', shape: [[1]], color: '#FF0000' };
    
    it('should handle simple single-line clear with combo', () => {
      // 1 block (10) + 1 line with combo 2 (100 * 1.4) = 150
      expect(scoreCalculator.calculateMovePoints(singleBlock, 1, 2)).toBe(150);
    });

    it('should handle explosive multi-line clear', () => {
      const lBlock: BlockShape = {
        id: 'test',
        shape: [[1, 0], [1, 0], [1, 1]],
        color: '#FF0000'
      };
      // L-block (40) + 2 lines (300 base * 1.6x combo 3) = 40 + 480 = 520
      expect(scoreCalculator.calculateMovePoints(lBlock, 2, 3)).toBe(520);
    });

    it('should handle massive 4-line combo clear', () => {
      const bigBlock: BlockShape = {
        id: 'test', 
        shape: [[1, 1, 1, 1]],
        color: '#FF0000'
      };
      // 4-cell block (40) + 4 lines (1500 base * 2.4x combo 7) = 40 + 3600 = 3640
      expect(scoreCalculator.calculateMovePoints(bigBlock, 4, 7)).toBe(3640);
    });
  });

  describe('updateCombo', () => {
    it('should increment combo on clear, reset on miss', () => {
      expect(scoreCalculator.updateCombo(0, 1)).toBe(1);
      expect(scoreCalculator.updateCombo(5, 2)).toBe(6);
      expect(scoreCalculator.updateCombo(10, 0)).toBe(0);
    });

    it('should keep combo on miss when persist mode', () => {
      expect(scoreCalculator.updateCombo(10, 0, 'persist')).toBe(10);
      expect(scoreCalculator.updateCombo(10, 1, 'persist')).toBe(11);
    });
  });

  describe('Utility Methods', () => {
    it('should detect high scores', () => {
      expect(scoreCalculator.isHighScore(1000, 500)).toBe(true);
      expect(scoreCalculator.isHighScore(300, 500)).toBe(false);
    });

    it('should format scores', () => {
      expect(scoreCalculator.formatScore(12345)).toBe('12345');
    });
  });
});