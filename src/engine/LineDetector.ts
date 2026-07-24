/**
 * LineDetector - Detect and clear completed rows/columns
 * Business Logic Layer - Clean Architecture
 */

import { Grid, CellState } from '../types';
import { GRID_SIZE } from '../constants';

export interface DetectedLines {
  rows: number[];
  columns: number[];
}

export class LineDetector {
  /**
   * Detect all completed rows and columns
   */
  detectLines(grid: Grid): DetectedLines {
    const completedRows: number[] = [];
    const completedColumns: number[] = [];

    // Check rows
    for (let row = 0; row < GRID_SIZE; row++) {
      if (this.isRowComplete(grid, row)) {
        completedRows.push(row);
      }
    }

    // Check columns
    for (let col = 0; col < GRID_SIZE; col++) {
      if (this.isColumnComplete(grid, col)) {
        completedColumns.push(col);
      }
    }

    return {
      rows: completedRows,
      columns: completedColumns,
    };
  }

  /**
   * Check if a row is completely filled
   */
  private isRowComplete(grid: Grid, row: number): boolean {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === CellState.Empty) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if a column is completely filled
   */
  private isColumnComplete(grid: Grid, col: number): boolean {
    for (let row = 0; row < GRID_SIZE; row++) {
      if (grid[row][col] === CellState.Empty) {
        return false;
      }
    }
    return true;
  }

  /**
   * Clear detected lines from the grid (returns new grid, immutable)
   */
  clearLines(grid: Grid, lines: DetectedLines): Grid {
    if (lines.rows.length === 0 && lines.columns.length === 0) {
      return grid; // No lines to clear
    }

    // Create a deep copy
    const newGrid: Grid = grid.map((row) => [...row]);

    // Clear completed rows
    for (const row of lines.rows) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newGrid[row][col] = CellState.Empty;
      }
    }

    // Clear completed columns
    for (const col of lines.columns) {
      for (let row = 0; row < GRID_SIZE; row++) {
        newGrid[row][col] = CellState.Empty;
      }
    }

    return newGrid;
  }

  /**
   * Count total cells cleared by the lines
   * Note: Intersections (cells in both row and column) are counted once
   */
  countClearedCells(lines: DetectedLines): number {
    const { rows, columns } = lines;

    // Each row clears 8 cells
    const rowCells = rows.length * GRID_SIZE;

    // Each column clears 8 cells
    const columnCells = columns.length * GRID_SIZE;

    // But intersections are counted twice, so subtract them
    const intersections = rows.length * columns.length;

    return rowCells + columnCells - intersections;
  }

  /**
   * Check if there are any lines to clear
   */
  hasLines(lines: DetectedLines): boolean {
    return lines.rows.length > 0 || lines.columns.length > 0;
  }

  /**
   * Count total lines (rows + columns)
   */
  countLines(lines: DetectedLines): number {
    return lines.rows.length + lines.columns.length;
  }
}

// Export singleton instance
export const lineDetector = new LineDetector();
