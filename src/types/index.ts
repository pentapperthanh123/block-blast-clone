/**
 * Core Type Definitions
 * Clean Architecture - Domain Layer
 */

// Game State Types
export type CellState = 0 | 1; // 0 = empty, 1 = filled
export type Grid = CellState[][];

export interface Position {
  x: number;
  y: number;
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
  currentPieces: BlockShape[];
  isGameOver: boolean;
  combo: number;
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
