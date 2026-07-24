/**
 * ScoreCalculator Tests
 */

import { ScoreCalculator } from '../ScoreCalculator';
import { BlockShape } from '../../types';

describe('ScoreCalculator', () => {
  let scoreCalculator: ScoreCalculator;

  beforeEach(() => {
    scoreCalculator = new ScoreCalculator();
  });

  describe('calculateBlockPlacementPoints', () => {
    it('should calculate 10 points for 1-cell block', () => {
      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };
      expect(scoreCalculator.calculateBlockPlacementPoints(block)).toBe(10);
    });

    it('should calculate 20 points for 2-cell block', () => {
      const block: BlockShape = {
        id: 'test',
        shape: [[1, 1]],
        color: '#FF0000',
      };
      expect(scoreCalculator.calculateBlockPlacementPoints(block)).toBe(20);
    });

    it('should calculate 40 points for 2x2 block', () => {
      const block: BlockShape = {
        id: 'test',
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FF0000',
      };
      expect(scoreCalculator.calculateBlockPlacementPoints(block)).toBe(40);
    });

    it('should calculate 40 points for L-shape (4 cells)', () => {
      const block: BlockShape = {
        id: 'test',
        shape: [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
        color: '#FF0000',
      };
      expect(scoreCalculator.calculateBlockPlacementPoints(block)).toBe(40);
    });

    it('should calculate 40 points for I-piece (4 cells)', () => {
      const block: BlockShape = {
        id: 'test',
        shape: [[1, 1, 1, 1]],
        color: '#FF0000',
      };
      expect(scoreCalculator.calculateBlockPlacementPoints(block)).toBe(40);
    });
  });

  describe('calculateLineClearPoints', () => {
    it('should return 0 for no lines cleared', () => {
      expect(scoreCalculator.calculateLineClearPoints(0, 0)).toBe(0);
    });

    it('should return 100 for 1 line cleared (no combo)', () => {
      expect(scoreCalculator.calculateLineClearPoints(1, 0)).toBe(100);
    });

    it('should return 200 for 2 lines cleared (no combo)', () => {
      expect(scoreCalculator.calculateLineClearPoints(2, 0)).toBe(200);
    });

    it('should apply 1.5x multiplier for combo 1', () => {
      // 1 line * 100 * 1.5x = 150
      expect(scoreCalculator.calculateLineClearPoints(1, 1)).toBe(150);
    });

    it('should apply 2x multiplier for combo 2', () => {
      // 1 line * 100 * 2x = 200
      expect(scoreCalculator.calculateLineClearPoints(1, 2)).toBe(200);
    });

    it('should apply 2.5x multiplier for combo 3', () => {
      // 1 line * 100 * 2.5x = 250
      expect(scoreCalculator.calculateLineClearPoints(1, 3)).toBe(250);
    });

    it('should apply 3x multiplier for combo 4+', () => {
      // 1 line * 100 * 3x = 300
      expect(scoreCalculator.calculateLineClearPoints(1, 4)).toBe(300);
      expect(scoreCalculator.calculateLineClearPoints(1, 5)).toBe(300);
      expect(scoreCalculator.calculateLineClearPoints(1, 10)).toBe(300);
    });

    it('should handle multiple lines with combo', () => {
      // 3 lines * 100 * 2x (combo 2) = 600
      expect(scoreCalculator.calculateLineClearPoints(3, 2)).toBe(600);
    });
  });

  describe('getComboMultiplier', () => {
    it('should return 1 for no combo', () => {
      expect(scoreCalculator.getComboMultiplier(0)).toBe(1);
    });

    it('should return 1.5 for combo 1', () => {
      expect(scoreCalculator.getComboMultiplier(1)).toBe(1.5);
    });

    it('should return 2 for combo 2', () => {
      expect(scoreCalculator.getComboMultiplier(2)).toBe(2);
    });

    it('should return 2.5 for combo 3', () => {
      expect(scoreCalculator.getComboMultiplier(3)).toBe(2.5);
    });

    it('should return 3 for combo 4+', () => {
      expect(scoreCalculator.getComboMultiplier(4)).toBe(3);
      expect(scoreCalculator.getComboMultiplier(5)).toBe(3);
      expect(scoreCalculator.getComboMultiplier(100)).toBe(3);
    });

    it('should return 1 for negative combo', () => {
      expect(scoreCalculator.getComboMultiplier(-1)).toBe(1);
    });
  });

  describe('calculateMovePoints', () => {
    const singleBlock: BlockShape = {
      id: 'test',
      shape: [[1]],
      color: '#FF0000',
    };

    it('should calculate placement points only (no lines cleared)', () => {
      // 10 points (placement) + 0 (no lines) = 10
      expect(scoreCalculator.calculateMovePoints(singleBlock, 0, 0)).toBe(10);
    });

    it('should calculate placement + line clear points', () => {
      // 10 points (placement) + 100 (1 line) = 110
      expect(scoreCalculator.calculateMovePoints(singleBlock, 1, 0)).toBe(110);
    });

    it('should calculate placement + line clear + combo', () => {
      // 10 points (placement) + 200 (1 line * 2x combo) = 210
      expect(scoreCalculator.calculateMovePoints(singleBlock, 1, 2)).toBe(210);
    });

    it('should calculate 4-cell block + 2 lines + combo', () => {
      const lBlock: BlockShape = {
        id: 'test',
        shape: [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
        color: '#FF0000',
      };
      // 40 points (4 cells) + 450 (2 lines * 100 * 2.25x... wait, let me recalculate)
      // Actually: 40 + (2 * 100 * 2.5x) = 40 + 500 = 540
      expect(scoreCalculator.calculateMovePoints(lBlock, 2, 3)).toBe(540);
    });
  });

  describe('updateCombo', () => {
    it('should reset combo to 0 if no lines cleared', () => {
      expect(scoreCalculator.updateCombo(0, 0)).toBe(0);
      expect(scoreCalculator.updateCombo(5, 0)).toBe(0);
    });

    it('should increment combo if lines cleared', () => {
      expect(scoreCalculator.updateCombo(0, 1)).toBe(1);
      expect(scoreCalculator.updateCombo(1, 1)).toBe(2);
      expect(scoreCalculator.updateCombo(5, 2)).toBe(6);
    });
  });

  describe('isHighScore', () => {
    it('should return true when current > previous', () => {
      expect(scoreCalculator.isHighScore(1000, 500)).toBe(true);
    });

    it('should return false when current <= previous', () => {
      expect(scoreCalculator.isHighScore(500, 1000)).toBe(false);
      expect(scoreCalculator.isHighScore(500, 500)).toBe(false);
    });

    it('should return true when current > 0 and previous is 0', () => {
      expect(scoreCalculator.isHighScore(10, 0)).toBe(true);
    });
  });

  describe('formatScore', () => {
    it('should format small scores without commas', () => {
      expect(scoreCalculator.formatScore(0)).toBe('0');
      expect(scoreCalculator.formatScore(100)).toBe('100');
      expect(scoreCalculator.formatScore(999)).toBe('999');
    });

    it('should format scores with commas', () => {
      expect(scoreCalculator.formatScore(1000)).toMatch(/1[,\s]000/);
      expect(scoreCalculator.formatScore(12345)).toMatch(/12[,\s]345/);
      expect(scoreCalculator.formatScore(1000000)).toMatch(/1[,\s]000[,\s]000/);
    });
  });
});
