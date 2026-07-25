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
  GOOD: 1, // 1 line
  PERFECT: 2, // 2 lines
  AWESOME: 3, // 3 lines
  UNBELIEVABLE: 4, // 4+ lines
} as const;

export type FeedbackTier = 'Good' | 'Perfect' | 'Awesome' | 'Unbelievable';

export const FEEDBACK_TIER_LABEL: Record<FeedbackTier, string> = {
  Good: 'Good!',
  Perfect: 'Perfect!',
  Awesome: 'Awesome!',
  Unbelievable: 'Unbelievable!',
};

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
  /** Line clear FX duration — keep short so input unlocks sooner */
  LINE_CLEAR: 360,
  COMBO_TEXT: 800,
  SCORE_POPUP: 1400,
  /** Floating +N lifetime after place */
  FLOATING_SCORE_MS: 700,
  /** Defer heavy UI (feedback / particles follow-up) after board paints */
  PLACE_FX_DEFER_MS: 32,
  LOADING_MS: 1800,
  NEW_ROUND_RECAP_MS: 1100,
  /** Hide losing board one frame before swapping grid */
  NEW_ROUND_REVEAL_BUFFER_MS: 48,
  /** Fade-in for the fresh grid after swap */
  NEW_ROUND_REVEAL_FADE_MS: 420,
  /** Cascade fall — synced via getMaxBoardFallMs() */
  NEW_ROUND_FALL_MS: 1520,
  /** Legacy alias — fall replaced wipe */
  NEW_ROUND_WIPE_MS: 1500,
} as const;

export const BOARD_CONSTANTS = {
  BORDER_PAD: 4,
  BORDER_WIDTH: 2,
  BOARD_RADIUS: 10,
  /** 1px grid lines on the board */
  GRID_LINE_WIDTH: 1,
  GRID_LINE_OPACITY: 0.14,
  CHECKER_OVERLAY_OPACITY: 0.07,
  CELL_RADIUS_RATIO: 0.04,
  MIN_RADIUS: 1,
  /** Skins render inside the cell — no bleed (keeps grid even) */
  SKIN_BLEED: 1,
  GHOST_OPACITY: 0.4,
  FALL_ROW_STAGGER_MS: 55,
  FALL_COL_STAGGER_MS: 22,
  FALL_DURATION_MS: 620,
  FALL_FADE_LEAD_MS: 420,
  FALL_FADE_DURATION_MS: 360,
  FALL_OPACITY_DELAY_MS: 300,
  FALL_OPACITY_DURATION_MS: 280,
  FALL_DRIFT_COL_SPREAD_PX: 14,
  FALL_DRIFT_ROW_PARITY_PX: 10,
  FALL_ROW_DISTANCE_BONUS_PX: 22,
  CLEAR_FLASH_DURATION_MS: 90,
} as const;

/** Longest board-cell fall animation (stagger + travel + fade buffer) */
export function getMaxBoardFallMs(): number {
  const maxDelay =
    (GRID_SIZE - 1) * BOARD_CONSTANTS.FALL_ROW_STAGGER_MS +
    (GRID_SIZE - 1) * BOARD_CONSTANTS.FALL_COL_STAGGER_MS;
  return (
    maxDelay +
    BOARD_CONSTANTS.FALL_DURATION_MS +
    BOARD_CONSTANTS.FALL_FADE_LEAD_MS +
    BOARD_CONSTANTS.FALL_FADE_DURATION_MS
  );
}

export const CLEAR_PARTICLE_CAP = 8;

export const DRAG = {
  LIFT_RATIO: 1.2,
  PLACE_VOLUME: 0.5,
  MISS_VOLUME: 0.4,
  CLEAR_VOLUME: 0.8,
  /** Extra touch padding around tray piece (Block Blast–style generous grab) */
  TRAY_HIT_SLOP: 28,
  /** Extra grab zone upward toward the board */
  TRAY_HIT_SLOP_TOP: 44,
  /** Snap floating piece to grid on release (UI thread) */
  DROP_SNAP_MS: 0,
  DROP_FADE_MS: 50,
} as const;

export const MAX_ACTIVE_PIECES = 3;

export const MOOD_TEXTS = [
  'Good!',
  'Perfect!',
  'Awesome!',
  'Unbelievable!',
] as const;

export const HOME_TITLE = {
  LINE1: 'BLOCK BLAST',
  LINE2: 'ADVENTURE MASTER',
} as const;

/** Multicolor candy letters for Home / Loading titles */
export const TITLE_LETTER_COLORS = [
  '#FFD93D',
  '#4DD3E8',
  '#FF6B9D',
  '#C084FC',
  '#6BCF7F',
  '#FB923C',
  '#60A5FA',
  '#FACC15',
  '#F472B6',
  '#34D399',
  '#FBBF24',
] as const;

export * from './themes';