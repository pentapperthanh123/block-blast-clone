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

import { GameState, BlockShape, Position, Grid } from '../types';
import { GridManager } from './GridManager';
import { LineDetector } from './LineDetector';
import { BlockGenerator } from './BlockGenerator';
import { ScoreCalculator } from './ScoreCalculator';

export class GameEngine {
  constructor(
    private gridManager: GridManager,
    private lineDetector: LineDetector,
    private blockGenerator: BlockGenerator,
    private scoreCalculator: ScoreCalculator
  ) {}

  /**
   * Initialize a new game
   */
  initializeGame(): GameState {
    return {
      grid: this.gridManager.createEmptyGrid(),
      score: 0,
      highScore: 0,
      currentPieces: this.blockGenerator.generateBlockSet(3),
      isGameOver: false,
      combo: 0,
    };
  }

  /**
   * Place a block on the grid and process the move
   * 
   * @returns New game state after placement and line clearing
   */
  placeBlock(state: GameState, block: BlockShape, position: Position): GameState {
    // 1. Check if placement is valid
    if (!this.gridManager.canPlaceBlock(state.grid, block, position)) {
      throw new Error('Invalid block placement');
    }

    // 2. Place the block
    let newGrid = this.gridManager.placeBlock(state.grid, block, position);

    // 3. Calculate placement points
    const placementPoints = this.scoreCalculator.calculateBlockPlacementPoints(block);

    // 4. Detect and clear lines
    const detectedLines = this.lineDetector.detectLines(newGrid);
    const hasLines = this.lineDetector.hasLines(detectedLines);

    let lineClearPoints = 0;
    let newCombo = state.combo;

    if (hasLines) {
      // Clear the lines
      newGrid = this.lineDetector.clearLines(newGrid, detectedLines);

      // Calculate line clear points with combo
      const linesCount = this.lineDetector.countLines(detectedLines);
      lineClearPoints = this.scoreCalculator.calculateLineClearPoints(
        linesCount,
        newCombo
      );

      // Update combo
      newCombo = this.scoreCalculator.updateCombo(newCombo, linesCount);
    } else {
      // No lines cleared, reset combo
      newCombo = 0;
    }

    // 5. Calculate total score
    const totalPoints = placementPoints + lineClearPoints;
    const newScore = state.score + totalPoints;

    // 6. Update high score if needed
    const newHighScore = this.scoreCalculator.isHighScore(newScore, state.highScore)
      ? newScore
      : state.highScore;

    // 7. Remove used block from current pieces
    const newCurrentPieces = state.currentPieces.filter((p) => p.id !== block.id);

    // 8. Generate new blocks if all used
    const finalCurrentPieces =
      newCurrentPieces.length === 0
        ? this.blockGenerator.generateBlockSet(3)
        : newCurrentPieces;

    // 9. Check for game over
    const isGameOver = this.checkGameOver(newGrid, finalCurrentPieces);

    return {
      grid: newGrid,
      score: newScore,
      highScore: newHighScore,
      currentPieces: finalCurrentPieces,
      isGameOver,
      combo: newCombo,
    };
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
