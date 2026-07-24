/**
 * Color grid helpers — visual layer parallel to CellState grid
 */

import { ColorGrid, Grid, Position, BlockShape, CellState } from '../types';
import { GRID_SIZE } from '../constants';

export function createEmptyColorGrid(): ColorGrid {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
}

export function applyBlockColors(
  colors: ColorGrid,
  block: BlockShape,
  position: Position
): ColorGrid {
  const next = colors.map((row) => [...row]);
  for (let r = 0; r < block.shape.length; r++) {
    for (let c = 0; c < block.shape[r].length; c++) {
      if (block.shape[r][c] === CellState.Filled || block.shape[r][c] === 1) {
        next[position.row + r][position.col + c] = block.color;
      }
    }
  }
  return next;
}

export function clearColorLines(
  colors: ColorGrid,
  rows: number[],
  columns: number[]
): ColorGrid {
  const next = colors.map((row) => [...row]);
  for (const row of rows) {
    for (let col = 0; col < GRID_SIZE; col++) {
      next[row][col] = null;
    }
  }
  for (const col of columns) {
    for (let row = 0; row < GRID_SIZE; row++) {
      next[row][col] = null;
    }
  }
  return next;
}

export function syncColorsToGrid(grid: Grid, colors: ColorGrid): ColorGrid {
  return grid.map((row, r) =>
    row.map((cell, c) => (cell === CellState.Filled ? colors[r][c] ?? '#5B7CFF' : null))
  );
}
