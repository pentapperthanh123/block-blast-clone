/**
 * Enhanced ScoreCalculator - Dynamic scoring with exponential multi-line bonus
 * and progressive combo multipliers following the 4-algorithm spec
 */

import { BlockShape } from '../types';

export type FeedbackTier = 'Good' | 'Perfect' | 'Awesome' | 'Unbelievable';

/** reset = miss breaks combo; persist = keep stacking until game over */
export type ComboMode = 'reset' | 'persist';

export interface ScoreBreakdown {
  basePoints: number;
  comboMultiplier: number;
  finalPoints: number;
  feedbackTier: FeedbackTier;
}

import { formatScore } from '../utils/formatScore';

export class ScoreCalculator {
  private readonly CELL_PLACEMENT_POINTS = 10;

  private readonly LINE_CLEAR_BASES = {
    1: 100,
    2: 400,
    3: 1200,
    4: 3000,
    5: 5000,
  };

  calculateBaseClearScore(linesCleared: number): number {
    if (linesCleared === 0) return 0;
    if (linesCleared === 1) return this.LINE_CLEAR_BASES[1];
    if (linesCleared === 2) return this.LINE_CLEAR_BASES[2];
    if (linesCleared === 3) return this.LINE_CLEAR_BASES[3];
    if (linesCleared === 4) return this.LINE_CLEAR_BASES[4];
    return this.LINE_CLEAR_BASES[5];
  }

  getComboMultiplier(currentCombo: number): number {
    if (currentCombo <= 0) return 1.0;
    // Multiplier scales faster (0.5 per combo, cap at 10x)
    return Math.min(1.0 + currentCombo * 0.5, 10.0);
  }

  getFeedbackTier(linesCleared: number): FeedbackTier {
    if (linesCleared >= 4) return 'Unbelievable';
    if (linesCleared >= 3) return 'Awesome';
    if (linesCleared >= 2) return 'Perfect';
    return 'Good';
  }

  calculateBlockPlacementPoints(block: BlockShape): number {
    let cellCount = 0;
    for (const row of block.shape) {
      for (const cell of row) {
        if (cell === 1) cellCount++;
      }
    }
    return cellCount * this.CELL_PLACEMENT_POINTS;
  }

  calculateLineClearPoints(
    linesCleared: number,
    currentCombo: number = 0,
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

  updateCombo(
    currentCombo: number,
    linesCleared: number,
    mode: ComboMode = 'reset',
  ): number {
    if (linesCleared > 0) return currentCombo + 1;
    return mode === 'persist' ? currentCombo : 0;
  }

  calculateLineClearPointsSimple(
    linesCleared: number,
    currentCombo: number = 0,
  ): number {
    return this.calculateLineClearPoints(linesCleared, currentCombo).finalPoints;
  }

  calculateMovePoints(
    block: BlockShape,
    linesCleared: number,
    currentCombo: number = 0,
  ): number {
    const placementPoints = this.calculateBlockPlacementPoints(block);
    const clearPoints = this.calculateLineClearPointsSimple(
      linesCleared,
      currentCombo,
    );
    return placementPoints + clearPoints;
  }

  isHighScore(currentScore: number, previousHighScore: number): boolean {
    return currentScore > previousHighScore;
  }

  formatScore(score: number): string {
    return formatScore(score);
  }
}

export const scoreCalculator = new ScoreCalculator();
