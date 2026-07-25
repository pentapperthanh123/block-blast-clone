/**
 * DangerDetector — Algorithm 7: Danger State Detection
 * Pure TypeScript engine, no UI dependencies.
 *
 * Detects when the board is close to losing and returns a 4-level danger rating.
 */

import { Grid, BlockShape, CellState } from '../types';
import { GRID_SIZE } from '../constants';

export interface DangerResult {
  /** Overall danger level: 0=safe, 1=caution(yellow), 2=danger(orange), 3=critical(red) */
  dangerLevel: 0 | 1 | 2 | 3;
  /** true when dangerLevel >= 2 (keeps backward compat) */
  isDanger: boolean;
  /** Ratio of filled cells (0.0–1.0) */
  fillRatio: number;
  /** IDs of pieces that have very few valid placements */
  criticalPieces: string[];
  /** Minimum valid placements across all active pieces */
  minPlacements: number;
}

// Fill ratio thresholds
const FILL_CAUTION = 0.52;   // Level 1 — yellow
const FILL_DANGER  = 0.70;   // Level 2 — orange
const FILL_CRITICAL = 0.84;  // Level 3 — red flash

// Minimum placements per level
const PLACE_DANGER   = 4;  // ≤ 4 positions → level 2
const PLACE_CRITICAL = 1;  // ≤ 1 position  → level 3

export class DangerDetector {
  private countFilled(grid: Grid): number {
    let count = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c] !== CellState.Empty) count++;
      }
    }
    return count;
  }

  private countValidPlacements(grid: Grid, block: BlockShape): number {
    let count = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (this.canPlace(grid, block, row, col)) count++;
      }
    }
    return count;
  }

  private canPlace(grid: Grid, block: BlockShape, startRow: number, startCol: number): boolean {
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1 || block.shape[r][c] === CellState.Filled) {
          const tr = startRow + r;
          const tc = startCol + c;
          if (tr < 0 || tr >= GRID_SIZE || tc < 0 || tc >= GRID_SIZE) return false;
          if (grid[tr][tc] !== CellState.Empty) return false;
        }
      }
    }
    return true;
  }

  /**
   * Full danger check — returns 4-level danger result.
   * Always runs placement scan (64 * pieces ≈ 192 checks — negligible).
   */
  checkDanger(grid: Grid, pieces: (BlockShape | null)[]): DangerResult {
    const totalCells = GRID_SIZE * GRID_SIZE;
    const fillRatio = this.countFilled(grid) / totalCells;

    const activePieces = pieces.filter((p): p is BlockShape => p !== null);
    const criticalPieces: string[] = [];
    let minPlacements = Infinity;

    for (const piece of activePieces) {
      const count = this.countValidPlacements(grid, piece);
      if (count < minPlacements) minPlacements = count;
      if (count <= PLACE_DANGER) criticalPieces.push(piece.id);
    }

    if (activePieces.length === 0) minPlacements = 0;

    let dangerLevel: 0 | 1 | 2 | 3 = 0;

    if (activePieces.length === 0) {
      dangerLevel = 0;
    } else if (minPlacements === 0) {
      // No valid moves left — critical
      dangerLevel = 3;
    } else if (
      minPlacements <= PLACE_CRITICAL ||
      (fillRatio >= FILL_CRITICAL && minPlacements <= PLACE_DANGER)
    ) {
      dangerLevel = 3;
    } else if (
      minPlacements <= 2 ||
      (fillRatio >= FILL_DANGER && minPlacements <= PLACE_DANGER)
    ) {
      dangerLevel = 2;
    } else if (fillRatio >= FILL_CAUTION || minPlacements <= 6) {
      dangerLevel = 1;
    }

    return {
      dangerLevel,
      isDanger: dangerLevel >= 2,
      fillRatio,
      criticalPieces,
      minPlacements: activePieces.length === 0 ? 0 : minPlacements,
    };
  }
}

export const dangerDetector = new DangerDetector();
