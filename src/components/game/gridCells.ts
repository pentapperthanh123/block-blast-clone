/**
 * Shared grid cell layout data for native Skia and web View renderers.
 */

import { GRID_SIZE, CELL_SIZE, UI_COLORS, BLOCK_COLORS_ARRAY } from '../../constants';
import { CellState, type Grid } from '../../types';

const GRID_PADDING = 2;
export const CELL_RADIUS = 4;
export const GRID_WIDTH = GRID_SIZE * CELL_SIZE;
export const GRID_HEIGHT = GRID_SIZE * CELL_SIZE;

export interface GridCellView {
  key: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
}

export function buildGridCells(grid: Grid): GridCellView[] {
  const cells: GridCellView[] = [];

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const isFilled = grid[row][col] === CellState.Filled;

      cells.push({
        key: `${row}-${col}`,
        x: col * CELL_SIZE + GRID_PADDING,
        y: row * CELL_SIZE + GRID_PADDING,
        size: CELL_SIZE - GRID_PADDING * 2,
        color: isFilled
          ? BLOCK_COLORS_ARRAY[row % BLOCK_COLORS_ARRAY.length]
          : UI_COLORS.GRID_BACKGROUND,
        opacity: isFilled ? 1 : 0.3,
      });
    }
  }

  return cells;
}
