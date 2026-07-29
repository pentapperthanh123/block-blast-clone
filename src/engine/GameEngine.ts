/**
 * GameEngine - Main game logic orchestrator
 * Business Logic Layer - Clean Architecture
 * 
 * This is the core of the game. It orchestrates all other modules:
 * - GridManager for grid operations
 * - LineDetector for line clearing
 * - BlockGenerator for new blocks
 * - ScoreCalculator for scoring
 */

import { GameState, BlockShape, Position, Grid, MoveResult, CellState } from '../types';
import { BlockGenSettings } from '../constants/blockGenSettings';
import { GridManager } from './GridManager';
import { LineDetector } from './LineDetector';
import { BlockGenerator } from './BlockGenerator';
import { ScoreCalculator, type ScoreBreakdown, type ComboMode } from './ScoreCalculator';

export class GameEngine {
  constructor(
    private gridManager: GridManager,
    private lineDetector: LineDetector,
    private blockGenerator: BlockGenerator,
    private scoreCalculator: ScoreCalculator
  ) { }

  /**
   * Initialize a new game
   */
  initializeGame(): GameState {
    this.blockGenerator.resetSpawnState();
    return {
      grid: this.gridManager.createEmptyGrid(),
      score: 0,
      highScore: 0,
      currentPieces: this.blockGenerator.generateBlockSet(3),
      isGameOver: false,
      combo: 0,
      movesWithoutClear: 0,
      perfectClears: 0,
      reviveCount: 0,
    };
  }

  /**
   * Place a block and return full move data (for UI FX).
   */
  executeMove(
    state: GameState,
    block: BlockShape,
    position: Position,
    options?: { comboMode?: ComboMode; blockGenSettings?: BlockGenSettings },
  ): MoveResult {
    if (!this.gridManager.canPlaceBlock(state.grid, block, position)) {
      throw new Error('Invalid block placement');
    }

    const comboMode = options?.comboMode ?? 'reset';
    const gridAfterPlace = this.gridManager.placeBlock(state.grid, block, position);
    const placedPositions = this.getPlacedPositions(block, position);
    const placementPoints = this.scoreCalculator.calculateBlockPlacementPoints(block);

    // Targeted Scan: Only check rows/cols where the block was just placed
    const detectedLines = this.lineDetector.detectLines(gridAfterPlace, placedPositions);
    const hasLines = this.lineDetector.hasLines(detectedLines);

    let finalGrid = gridAfterPlace;
    let lineClearPoints = 0;
    let newCombo = state.combo;
    let scoreBreakdown: ScoreBreakdown | undefined;

    if (hasLines) {
      finalGrid = this.lineDetector.clearLines(gridAfterPlace, detectedLines);
      const linesCount = this.lineDetector.countLines(detectedLines);
      scoreBreakdown = this.scoreCalculator.calculateLineClearPoints(linesCount, newCombo);
      lineClearPoints = scoreBreakdown.finalPoints;
      newCombo = this.scoreCalculator.updateCombo(newCombo, linesCount, comboMode);
    } else {
      newCombo = this.scoreCalculator.updateCombo(newCombo, 0, comboMode);
    }

    const newMovesWithoutClear = hasLines ? 0 : state.movesWithoutClear + 1;

    let newPerfectClears = state.perfectClears || 0;
    const isEmptyGrid = finalGrid.every((row) =>
      row.every((cell) => cell === CellState.Empty),
    );

    let isPerfectClear = false;
    if (isEmptyGrid && hasLines) {
      newPerfectClears += 1;
      isPerfectClear = true;
      // Bonus points for perfect clear
      lineClearPoints += 1000 * newPerfectClears;
    }

    const newScore = state.score + placementPoints + lineClearPoints;
    const newHighScore = this.scoreCalculator.isHighScore(newScore, state.highScore)
      ? newScore
      : state.highScore;

    const newCurrentPieces = state.currentPieces.map((p) =>
      p && p.id === block.id ? null : p
    );
    const allSlotsEmpty = newCurrentPieces.every((p) => p === null);
    const finalCurrentPieces = allSlotsEmpty
      ? this.blockGenerator.generateBlockSet(3, finalGrid, {
        afterFullClear: isEmptyGrid,
        afterLineClear: hasLines,
        movesWithoutClear: newMovesWithoutClear,
        settings: options?.blockGenSettings,
      })
      : newCurrentPieces;

    // Game-over detection is deferred to the store layer (confirmGameOverIfDeadlocked)
    // to keep executeMove off the critical render path.

    return {
      state: {
        ...state,
        grid: finalGrid,
        score: newScore,
        highScore: newHighScore,
        currentPieces: finalCurrentPieces,
        isGameOver: false,
        combo: newCombo,
        movesWithoutClear: newMovesWithoutClear,
        perfectClears: newPerfectClears,
      },
      gridAfterPlace: finalGrid,
      placedPositions,
      clearedRows: hasLines ? detectedLines.rows : [],
      clearedColumns: hasLines ? detectedLines.columns : [],
      pointsFromPlacement: placementPoints,
      pointsFromClear: lineClearPoints,
      scoreBreakdown,
      isPerfectClear,
      isFullClear: isEmptyGrid,
    };
  }

  /**
   * Place a block on the grid and process the move
   *
   * @returns New game state after placement and line clearing
   */
  placeBlock(state: GameState, block: BlockShape, position: Position): GameState {
    return this.executeMove(state, block, position).state;
  }

  canPlaceBlock(grid: Grid, block: BlockShape, position: Position): boolean {
    return this.gridManager.canPlaceBlock(grid, block, position);
  }

  private getPlacedPositions(block: BlockShape, position: Position): Position[] {
    const positions: Position[] = [];
    for (let r = 0; r < block.shape.length; r++) {
      for (let c = 0; c < block.shape[r].length; c++) {
        if (block.shape[r][c] === CellState.Filled || block.shape[r][c] === 1) {
          positions.push({ row: position.row + r, col: position.col + c });
        }
      }
    }
    return positions;
  }

  /**
   * Check if game is over (no valid moves for any available block)
   */
  checkGameOver(grid: Grid, availableBlocks: BlockShape[]): boolean {
    if (availableBlocks.length === 0) {
      return false; // No blocks to check, not game over yet
    }

    // Try every position on the grid for each block
    for (const block of availableBlocks) {
      for (let row = 0; row < grid.length; row++) {
        for (let col = 0; col < grid[row].length; col++) {
          if (this.gridManager.canPlaceBlock(grid, block, { row, col })) {
            return false; // Found at least one valid placement
          }
        }
      }
    }

    return true; // No valid placements for any block
  }

  /**
   * Reset game with new high score
   */
  resetGame(highScore: number): GameState {
    const newState = this.initializeGame();
    return {
      ...newState,
      highScore,
    };
  }

  /**
   * Get possible placements for a block (for AI or hints)
   */
  getPossiblePlacements(grid: Grid, block: BlockShape): Position[] {
    const positions: Position[] = [];

    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        if (this.gridManager.canPlaceBlock(grid, block, { row, col })) {
          positions.push({ row, col });
        }
      }
    }

    return positions;
  }

  /**
   * Simulate a move without mutating state (for AI or preview)
   */
  simulateMove(state: GameState, block: BlockShape, position: Position): GameState | null {
    try {
      return this.placeBlock(state, block, position);
    } catch {
      return null; // Invalid move
    }
  }
}

// Export singleton instance
export const gameEngine = new GameEngine(
  new GridManager(),
  new LineDetector(),
  new BlockGenerator(),
  new ScoreCalculator()
);
