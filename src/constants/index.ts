/**
 * Game Constants
 * Clean Architecture - Configuration Layer
 */

// Grid Configuration
export const GRID_SIZE = 8;
export const CELL_SIZE = 40; // pixels per cell

// Scoring
export const POINTS_PER_BLOCK = 5;
export const POINTS_PER_LINE = 100;
export const COMBO_MULTIPLIER = 1.5;

// Colors (từ reference images)
export const BLOCK_COLORS = {
  PURPLE: '#B565D8',
  CYAN: '#4DD3E8',
  ORANGE: '#FF8C42',
  YELLOW: '#FFD93D',
  GREEN: '#6BCF7F',
  RED: '#FF6B6B',
  BLUE: '#5B7CFF',
} as const;

// UI Colors
export const UI_COLORS = {
  BACKGROUND: '#2E3C8F',
  GRID_BACKGROUND: '#1E2870',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SCORE: '#FFD93D',
} as const;

// Animation Durations (ms)
export const ANIMATION = {
  BLOCK_PLACE: 200,
  LINE_CLEAR: 400,
  COMBO_TEXT: 800,
} as const;

// Piece Configuration
export const MAX_ACTIVE_PIECES = 3;
