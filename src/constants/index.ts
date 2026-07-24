/**
 * Updated constants for enhanced scoring system
 */

export const GRID_SIZE = 8;
export const CELL_SIZE = 40;

// Updated scoring constants for exponential system
export const POINTS_PER_BLOCK = 10;
export const BASE_LINE_POINTS = 100;

// Feedback tier thresholds
export const SCORE_TIERS = {
  GOOD: 1,        // 1 line cleared
  AWESOME: 2,     // 2+ lines cleared  
  UNBELIEVABLE: 4 // 4+ lines cleared
} as const;

export const BLOCK_COLORS = {
  PURPLE: '#A855F7', // Vivid Purple
  CYAN: '#06B6D4',   // Bright Cyan
  ORANGE: '#F97316', // Electric Orange
  YELLOW: '#EAB308', // Vivid Gold
  GREEN: '#22C55E',  // Fresh Emerald
  RED: '#EF4444',    // Bright Ruby
  BLUE: '#3B82F6',   // Electric Blue
} as const;

export const BLOCK_COLORS_ARRAY = Object.values(BLOCK_COLORS);

export const UI_COLORS = {
  BACKGROUND: '#2563EB',
  BACKGROUND_DEEP: '#1E40AF',
  GRID_BACKGROUND: '#101B4B',
  GRID_CELL: '#1B2B6B',
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SCORE: '#FACC15',
  GHOST: 'rgba(255,255,255,0.85)',
  ADVENTURE: '#F97316',
  CLASSIC: '#10B981',
  MORE_GAMES: '#EC4899',
} as const;

export const ANIMATION = {
  BLOCK_PLACE: 220,
  LINE_CLEAR: 420,
  COMBO_TEXT: 800,
  SCORE_POPUP: 1100,
  LOADING_MS: 1800,
} as const;

export const MAX_ACTIVE_PIECES = 3;

export const MOOD_TEXTS = ['Interesting!', 'Relaxing!', 'Addictive!'] as const;

export const HOME_TITLE = {
  LINE1: 'BLOCK BLAST',
  LINE2: 'ADVENTURE MASTER',
} as const;