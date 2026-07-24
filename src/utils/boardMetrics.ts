/**
 * Board metrics — responsive cell size for phone preview
 */

import { Dimensions } from 'react-native';
import { GRID_SIZE } from '../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CELL_PAD = 0.5;

export function getBoardMetrics() {
  const maxBoard = Math.min(SCREEN_WIDTH - 32, SCREEN_HEIGHT * 0.42, 360);
  const cellSize = Math.floor(maxBoard / GRID_SIZE);
  const boardSize = cellSize * GRID_SIZE;
  
  // Tray blocks nhỏ hơn board cells (scale ~0.65)
  const trayCellSize = Math.floor(cellSize * 0.65);
  /** Max piece footprint in tray */
  const traySlotSize = trayCellSize * 3.8 + CELL_PAD * 2;

  return {
    cellSize,
    boardSize,
    traySlotSize,
    cellVisualSize: cellSize - CELL_PAD * 2,
    trayCellSize,
    trayCellVisualSize: trayCellSize - CELL_PAD * 2,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
  };
}
