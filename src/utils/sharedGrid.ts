import { makeMutable } from 'react-native-reanimated';
import { Grid, CellState } from '../types';
import { GRID_SIZE } from '../constants';

/**
 * A copy of the grid synchronized to the UI thread (Reanimated).
 * Allows Worklets to compute drag & drop collision synchronously at 120fps.
 */
export const sharedGrid = makeMutable<number[][]>(
  Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0))
);

export const sharedClearMask = makeMutable<number>(0);

export function syncSharedGrid(grid: Grid) {
  // Convert enum CellState to plain numbers for Worklet safety
  const newSharedGrid = grid.map(row => 
    row.map(cell => (cell === CellState.Filled ? 1 : 0))
  );
  sharedGrid.value = newSharedGrid;
}
