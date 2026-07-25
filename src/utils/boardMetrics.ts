/**
 * Board metrics — responsive cell size for phone preview
 * All layout values are snapped to whole pixels to avoid sub-pixel seam lines.
 */

import { Dimensions } from 'react-native';
import { BOARD_CONSTANTS, GRID_SIZE } from '../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/** Uniform gap between board cells (px) — 0 = các ô sát nhau */
export const CELL_GAP = 0;

/** Snap outer board extent to a whole grid multiple (eliminates 1px edge seams) */
function snapBoardExtent(raw: number): number {
  const floored = Math.floor(raw);
  return Math.floor(floored / GRID_SIZE) * GRID_SIZE;
}

export function getBoardMetrics() {
  const rawMax = Math.min(SCREEN_WIDTH - 32, SCREEN_HEIGHT * 0.42, 360);
  const boardSize = snapBoardExtent(rawMax);
  const cellGap = CELL_GAP;
  const cellVisual = Math.floor((boardSize - (GRID_SIZE - 1) * cellGap) / GRID_SIZE);
  const cellStep = cellVisual + cellGap;
  const innerGridSize = GRID_SIZE * cellVisual + (GRID_SIZE - 1) * cellGap;

  const pad = BOARD_CONSTANTS.BORDER_PAD;
  const frameSize = innerGridSize + pad * 2;

  const trayCellSize = Math.floor(cellVisual * 0.58);
  const traySlotSize = trayCellSize * 3.5;

  return {
    cellSize: cellStep,
    cellStep,
    cellVisual,
    cellGap,
    boardSize: innerGridSize,
    frameSize,
    traySlotSize,
    cellVisualSize: cellVisual,
    trayCellSize,
    trayCellVisualSize: trayCellSize,
    screenWidth: SCREEN_WIDTH,
    screenHeight: SCREEN_HEIGHT,
  };
}
