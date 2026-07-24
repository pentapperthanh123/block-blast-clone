/**
 * Enhanced ScoreCalculator - Dynamic scoring with exponential multi-line bonus
 * and progressive combo multipliers following the 4-algorithm spec
 */

import { BlockShape } from '../types';

export interface ScoreBreakdown {
  basePoints: number;
  comboMultiplier: number;
  finalPoints: number;
  feedbackTier: 'Good' | 'Awesome' | 'Unbelievable';
}

export class ScoreCalculator {
  // Algorithm 4: Dynamic Scoring Constants
  private readonly CELL_PLACEMENT_POINTS = 10;
  
  // Exponential line clear base scores (not linear!)
  private readonly LINE_CLEAR_BASES = {
    1: 100,    // 1 line = 100 base
    2: 300,    // 2 lines = 3x base (not 2x)
    3: 800,    // 3 lines = 8x base 
    4: 1500,   // 4 lines = 15x base
    5: 2500,   // 5+ lines = 25x base
  };

  /**
   * Algorithm 4: Calculate base score with exponential multi-line bonus
   */
  calculateBaseClearScore(linesCleared: number): number {
    if (linesCleared === 0) return 0;
    if (linesCleared === 1) return this.LINE_CLEAR_BASES[1];
    if (linesCleared === 2) return this.LINE_CLEAR_BASES[2];
    if (linesCleared === 3) return this.LINE_CLEAR_BASES[3]; 
    if (linesCleared === 4) return this.LINE_CLEAR_BASES[4];
    return this.LINE_CLEAR_BASES[5]; // 5+ lines
  }

  /**
   * Algorithm 4: Dynamic combo multiplier (progressive, not fixed tiers)
   * Formula: 1.0 + (combo * 0.2) up to 4.0x max
   */
  getComboMultiplier(currentCombo: number): number {
    if (currentCombo <= 0) return 1.0;
    const multiplier = 1.0 + (currentCombo * 0.2);
    return Math.min(multiplier, 4.0); // Cap at 4x
  }

  /**
   * Algorithm 3: Feedback tier based on simultaneous lines cleared
   */
  getFeedbackTier(linesCleared: number): 'Good' | 'Awesome' | 'Unbelievable' {
    if (linesCleared >= 4) return 'Unbelievable';
    if (linesCleared >= 2) return 'Awesome'; 
    return 'Good';
  }

  /**
   * Calculate points for placing a block (unchanged)
   */
  calculateBlockPlacementPoints(block: BlockShape): number {
    let cellCount = 0;
    for (const row of block.shape) {
      for (const cell of row) {
        if (cell === 1) cellCount++;
      }
    }
    return cellCount * this.CELL_PLACEMENT_POINTS;
  }

  /**
   * Algorithm 4: Complete scoring with breakdown
   */
  calculateLineClearPoints(
    linesCleared: number, 
    currentCombo: number = 0
  ): ScoreBreakdown {
    const basePoints = this.calculateBaseClearScore(linesCleared);
    const comboMultiplier = this.getComboMultiplier(currentCombo);
    const finalPoints = Math.floor(basePoints * comboMultiplier);
    const feedbackTier = this.getFeedbackTier(linesCleared);

    return {
      basePoints,
      comboMultiplier,
      finalPoints,
      feedbackTier,
    };
  }

  /**
   * Algorithm 3: Update combo (increment on clear, reset on miss)
   */
  updateCombo(currentCombo: number, linesCleared: number): number {
    return linesCleared > 0 ? currentCombo + 1 : 0;
  }

  /**
   * Legacy method for simple points (backward compatibility)
   */
  calculateLineClearPointsSimple(linesCleared: number, currentCombo: number = 0): number {
    return this.calculateLineClearPoints(linesCleared, currentCombo).finalPoints;
  }

  /**
   * Legacy method for tests (backward compatibility)
   */
  calculateMovePoints(
    block: BlockShape,
    linesCleared: number,
    currentCombo: number = 0
  ): number {
    const placementPoints = this.calculateBlockPlacementPoints(block);
    const clearPoints = this.calculateLineClearPointsSimple(linesCleared, currentCombo);
    return placementPoints + clearPoints;
  }

  isHighScore(currentScore: number, previousHighScore: number): boolean {
    return currentScore > previousHighScore;
  }

  formatScore(score: number): string {
    return score.toLocaleString();
  }
}

export const scoreCalculator = new ScoreCalculator();