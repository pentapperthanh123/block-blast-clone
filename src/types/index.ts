/**
 * Core Type Definitions
 * Clean Architecture - Domain Layer
 */

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
