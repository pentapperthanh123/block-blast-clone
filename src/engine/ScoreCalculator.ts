/**
 * ScoreCalculator - Calculate points and combos
 * Business Logic Layer - Clean Architecture
 */

import { BlockShape } from '../types';
import { POINTS_PER_BLOCK } from '../constants';

export class ScoreCalculator {
  // Scoring constants
  private readonly BLOCK_PLACEMENT_BASE = POINTS_PER_BLOCK; // 10 points per cell
  private readonly LINE_CLEAR_BASE = 100; // 100 points per line
  private readonly COMBO_MULTIPLIERS = [1, 1.5, 2, 2.5, 3]; // Combo multipliers

  /**
   * Calculate points for placing a block
   * Base: 10 points per cell
   */
  calculateBlockPlacementPoints(block: BlockShape): number {
    let cellCount = 0;

    for (const row of block.shape) {
      for (const cell of row) {
        if (cell === 1) {
          cellCount++;
        }
      }
    }

    return cellCount * this.BLOCK_PLACEMENT_BASE;
  }

  /**
   * Calculate points for clearing lines
   * 
   * @param linesCleared - Number of lines cleared (rows + columns)
   * @param currentCombo - Current combo count (0-indexed)
   * @returns Points earned
   */
  calculateLineClearPoints(linesCleared: number, currentCombo: number = 0): number {
    if (linesCleared === 0) {
      return 0;
    }

    const basePoints = linesCleared * this.LINE_CLEAR_BASE;
    const multiplier = this.getComboMultiplier(currentCombo);

    return Math.floor(basePoints * multiplier);
  }

  /**
   * Get combo multiplier based on consecutive clears
   * 
   * @param consecutiveClears - Number of consecutive line clears (0-indexed)
   * @returns Multiplier (1x, 1.5x, 2x, 2.5x, 3x)
   */
  getComboMultiplier(consecutiveClears: number): number {
    if (consecutiveClears < 0) {
      return 1;
    }

    // Cap at max multiplier
    const index = Math.min(consecutiveClears, this.COMBO_MULTIPLIERS.length - 1);
    return this.COMBO_MULTIPLIERS[index];
  }

  /**
   * Calculate total points for a move
   * 
   * @param block - Block being placed
   * @param linesCleared - Number of lines cleared
   * @param currentCombo - Current combo count
   * @returns Total points
   */
  calculateMovePoints(
    block: BlockShape,
    linesCleared: number,
    currentCombo: number = 0
  ): number {
    const placementPoints = this.calculateBlockPlacementPoints(block);
    const lineClearPoints = this.calculateLineClearPoints(linesCleared, currentCombo);

    return placementPoints + lineClearPoints;
  }

  /**
   * Update combo count after a move
   * 
   * @param currentCombo - Current combo count
   * @param linesCleared - Number of lines cleared
   * @returns New combo count (increments if lines cleared, resets if not)
   */
  updateCombo(currentCombo: number, linesCleared: number): number {
    if (linesCleared > 0) {
      return currentCombo + 1; // Increment combo
    }
    return 0; // Reset combo
  }

  /**
   * Check if new score is a high score
   */
  isHighScore(currentScore: number, previousHighScore: number): boolean {
    return currentScore > previousHighScore;
  }

  /**
   * Format score with commas (for display)
   */
  formatScore(score: number): string {
    return score.toLocaleString();
  }
}

// Export singleton instance
export const scoreCalculator = new ScoreCalculator();
