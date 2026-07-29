/**
 * Core Type Definitions
 * Clean Architecture - Domain Layer
 */

import type { ThemeName } from '../constants/themes';

// Cell State Enum
export enum CellState {
  Empty = 0,
  Filled = 1,
}

// Grid Type
export type Grid = CellState[][];

// Position (row, col for grid-based positioning)
export interface Position {
  row: number;
  col: number;
}

export interface BlockShape {
  id: string;
  shape: CellState[][];
  color: string;
}

export interface PlacedBlock {
  shape: CellState[][];
  position: Position;
  color: string;
}

// Game State
export interface GameState {
  grid: Grid;
  score: number;
  highScore: number;
  currentPieces: (BlockShape | null)[];
  isGameOver: boolean;
  combo: number;
  /** Placements since last line clear — drives dry-spell spawn relief */
  movesWithoutClear: number;
  /** Number of times the entire board was cleared in the current round */
  perfectClears: number;
  /** Number of times revived in the current game session */
  reviveCount: number;
}

/** Parallel color map for filled cells (null = empty) */
export type ColorGrid = (string | null)[][];

export type AppRoute = 'loading' | 'home' | 'classic';

export type NewRoundPhase = 'idle' | 'recap' | 'falling' | 'revealing';

export interface LastGameOverResult {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  /** Losing board so recap/fall can replay even after leaving Classic */
  grid: Grid;
  cellColors: ColorGrid;
  currentPieces: (BlockShape | null)[];
  /** Theme at loss — keeps old skins during recap/fall after theme already changed */
  theme?: ThemeName;
}

// Action Types
export interface PlaceBlockAction {
  block: BlockShape;
  position: Position;
}

export interface ClearLinesResult {
  clearedRows: number[];
  clearedColumns: number[];
  pointsEarned: number;
  newCombo: number;
}

/** Floating FX on placed cells (+N or like icons) */
export interface PlacedCellFx {
  position: Position;
  points: number;
  kind?: 'score' | 'like';
}

/** Full move payload for UI animations */
export interface MoveResult {
  state: GameState;
  gridAfterPlace: Grid;
  placedPositions: Position[];
  clearedRows: number[];
  clearedColumns: number[];
  pointsFromPlacement: number;
  pointsFromClear: number;
  scoreBreakdown?: {
    basePoints: number;
    comboMultiplier: number;
    finalPoints: number;
    feedbackTier: 'Good' | 'Perfect' | 'Awesome' | 'Unbelievable';
  };
  /** Indicates a perfect clear happened in this move */
  isPerfectClear?: boolean;
  isFullClear?: boolean;
}
