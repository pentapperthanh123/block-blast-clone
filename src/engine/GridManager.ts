/**
 * GridManager - Pure functions for grid operations
 * Business Logic Layer - Clean Architecture
 */

import { Grid, BlockShape, Position, CellState } from '../types';
import { GRID_SIZE } from '../constants';

export class GridManager {
  /**
   * Create an empty 8x8 grid
   */
  createEmptyGrid(): Grid {
    return Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => CellState.Empty)
    );
  }

  /**
   * Check if a block can be placed at the given position
   */
  canPlaceBlock(grid: Grid, block: BlockShape, position: Position): boolean {
    const { row, col } = position;

    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1) {
          const targetRow = row + r;
          const targetCol = col + c;

          // Check bounds
          if (
            targetRow < 0 ||
            targetRow >= GRID_SIZE ||
            targetCol < 0 ||
            targetCol >= GRID_SIZE
          ) {
            return false;
          }

          // Check if cell is already occupied
          if (grid[targetRow][targetCol] !== CellState.Empty) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Place a block on the grid (returns new grid, immutable)
   */
  placeBlock(grid: Grid, block: BlockShape, position: Position): Grid {
    if (!this.canPlaceBlock(grid, block, position)) {
      throw new Error('Cannot place block at this position');
    }

    // Create a deep copy of the grid
    const newGrid: Grid = grid.map((row) => [...row]);
    const { row, col } = position;

    // Place the block
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === 1) {
          newGrid[row + r][col + c] = CellState.Filled;
        }
      }
    }

    return newGrid;
  }

  /**
   * Get all filled positions in the grid
   */
  getFilledPositions(grid: Grid): Position[] {
    const positions: Position[] = [];

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (grid[row][col] === CellState.Filled) {
          positions.push({ row, col });
        }
      }
    }

    return positions;
  }

  /**
   * Count total filled cells
   */
  countFilledCells(grid: Grid): number {
    return this.getFilledPositions(grid).length;
  }

  /**
   * Check if grid is empty
   */
  isEmpty(grid: Grid): boolean {
    return this.countFilledCells(grid) === 0;
  }

  /**
   * Check if grid is full
   */
  isFull(grid: Grid): boolean {
    return this.countFilledCells(grid) === GRID_SIZE * GRID_SIZE;
  }
}

// Export singleton instance
export const gridManager = new GridManager();
