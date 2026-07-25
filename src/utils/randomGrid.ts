/**
 * Random initial board generation
 * Creates a partially filled board with random cells for new rounds
 */

import { GRID_SIZE } from '../constants';
import { ColorGrid } from '../types';
import { ThemeConfig } from '../constants/themes';

/**
 * Generate a random initial grid with 10-20% cells filled
 * Ensures no full rows or columns exist
 */
export function createRandomInitialGrid(theme: ThemeConfig): {
  grid: number[][];
  colors: ColorGrid;
} {
  const grid: number[][] = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0),
  );
  const colors: ColorGrid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null),
  );

  const totalCells = GRID_SIZE * GRID_SIZE;
  const minCells = Math.floor(totalCells * 0.1);
  const maxCells = Math.floor(totalCells * 0.2);
  const targetCells =
    Math.floor(Math.random() * (maxCells - minCells + 1)) + minCells;

  const rowCounts = Array(GRID_SIZE).fill(0);
  const colCounts = Array(GRID_SIZE).fill(0);

  const availableColors =
    theme.clearFx?.colors?.length > 0
      ? theme.clearFx.colors
      : ['#3B82F6', '#60A5FA', '#FFFFFF'];
  const locked = theme.lockedBaseColor;

  let filledCells = 0;
  const maxAttempts = targetCells * 3;
  let attempts = 0;

  while (filledCells < targetCells && attempts < maxAttempts) {
    attempts++;

    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);

    if (grid[row][col] === 1) continue;
    if (rowCounts[row] >= GRID_SIZE - 2) continue;
    if (colCounts[col] >= GRID_SIZE - 2) continue;

    grid[row][col] = 1;
    rowCounts[row]++;
    colCounts[col]++;

    colors[row][col] = locked
      ? locked
      : availableColors[Math.floor(Math.random() * availableColors.length)];

    filledCells++;
  }

  return { grid, colors };
}

/**
 * Board at round start — respects Settings → clear board on new round.
 */
export function createRoundStartBoard(
  theme: ThemeConfig,
  clearBoardOnNewRound: boolean,
): {
  grid: number[][];
  colors: ColorGrid;
} {
  return clearBoardOnNewRound
    ? createEmptyGrid()
    : createRandomInitialGrid(theme);
}

/**
 * Create an empty grid (classic mode / clear-board-on-new-round)
 */
export function createEmptyGrid(): {
  grid: number[][];
  colors: ColorGrid;
} {
  return {
    grid: Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0)),
    colors: Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null)),
  };
}
