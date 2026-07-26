/**
 * GameEngine Tests (Integration)
 */

import { GameEngine } from '../GameEngine';
import { GridManager } from '../GridManager';
import { LineDetector } from '../LineDetector';
import { BlockGenerator } from '../BlockGenerator';
import { ScoreCalculator } from '../ScoreCalculator';
import { BlockShape, CellState } from '../../types';

describe('GameEngine', () => {
  let gameEngine: GameEngine;
  let gridManager: GridManager;
  let lineDetector: LineDetector;
  let blockGenerator: BlockGenerator;
  let scoreCalculator: ScoreCalculator;

  beforeEach(() => {
    gridManager = new GridManager();
    lineDetector = new LineDetector();
    blockGenerator = new BlockGenerator();
    scoreCalculator = new ScoreCalculator();
    gameEngine = new GameEngine(
      gridManager,
      lineDetector,
      blockGenerator,
      scoreCalculator
    );
  });

  describe('initializeGame', () => {
    it('should create initial game state', () => {
      const state = gameEngine.initializeGame();

      expect(state.grid).toBeDefined();
      expect(state.grid).toHaveLength(8);
      expect(state.score).toBe(0);
      expect(state.highScore).toBe(0);
      expect(state.currentPieces).toHaveLength(3);
      expect(state.isGameOver).toBe(false);
      expect(state.combo).toBe(0);
      expect(state.movesWithoutClear).toBe(0);
    });

    it('should create empty grid', () => {
      const state = gameEngine.initializeGame();
      expect(gridManager.isEmpty(state.grid)).toBe(true);
    });

    it('should generate 3 unique blocks', () => {
      const state = gameEngine.initializeGame();
      const ids = state.currentPieces.map((b) => b!.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('placeBlock', () => {
    it('should place a block and add placement points', () => {
      const state = gameEngine.initializeGame();
      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };

      const newState = gameEngine.placeBlock(state, block, { row: 0, col: 0 });

      expect(newState.grid[0][0]).toBe(CellState.Filled);
      expect(newState.score).toBe(10); // 1 cell * 10 points (no lines cleared)
    });

    it('should throw error for invalid placement', () => {
      const state = gameEngine.initializeGame();
      const block: BlockShape = {
        id: 'test',
        shape: [[1, 1]],
        color: '#FF0000',
      };

      // Out of bounds
      expect(() => {
        gameEngine.placeBlock(state, block, { row: 0, col: 7 });
      }).toThrow('Invalid block placement');
    });

    it('should clear lines and add line clear points', () => {
      const state = gameEngine.initializeGame();

      // Fill row 0 except last cell
      for (let col = 0; col < 7; col++) {
        state.grid[0][col] = CellState.Filled;
      }
      state.grid[1][0] = CellState.Filled;

      // Place block to complete row 0
      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };

      const newState = gameEngine.placeBlock(state, block, { row: 0, col: 7 });

      // Row 0 should be cleared
      expect(newState.grid[0][7]).toBe(CellState.Empty);
      // Score: 10 (placement) + 100 (1 line) = 110
      expect(newState.score).toBe(110);
      // Combo should be 1
      expect(newState.combo).toBe(1);
    });

    it('should apply combo multiplier', () => {
      let state = gameEngine.initializeGame();
      state.combo = 2; // Already have combo of 2

      // Fill row 0 except last cell, and fill (1,0) to prevent perfect clear
      for (let col = 0; col < 7; col++) {
        state.grid[0][col] = CellState.Filled;
      }
      state.grid[1][0] = CellState.Filled;

      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };

      const newState = gameEngine.placeBlock(state, block, { row: 0, col: 7 });

      // Score: 10 (placement) + 200 (1 line * combo 2 = 2.0x) = 210
      expect(newState.score).toBe(210);
      // Combo should increment to 3
      expect(newState.combo).toBe(3);
    });

    it('should reset combo when no lines cleared', () => {
      let state = gameEngine.initializeGame();
      state.combo = 5; // High combo

      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };

      const newState = gameEngine.placeBlock(state, block, { row: 0, col: 0 });

      // No lines cleared, combo resets
      expect(newState.combo).toBe(0);
    });

    it('should remove used block from currentPieces', () => {
      const state = gameEngine.initializeGame();
      const block = state.currentPieces[0]!;

      const newState = gameEngine.placeBlock(state, block, { row: 0, col: 0 });

      // Fixed 3 slots: used slot becomes null (no re-order)
      expect(newState.currentPieces).toHaveLength(3);
      expect(newState.currentPieces[0]).toBeNull();
      expect(newState.currentPieces.filter(Boolean)).toHaveLength(2);
      expect(newState.currentPieces.find((b) => b?.id === block.id)).toBeUndefined();
    });

    it('should generate new blocks when all used', () => {
      const state = gameEngine.initializeGame();
      // Force three 1x1 pieces so placements never collide / go OOB
      state.currentPieces = [
        { id: 'a', shape: [[1]], color: '#FF0000' },
        { id: 'b', shape: [[1]], color: '#00FF00' },
        { id: 'c', shape: [[1]], color: '#0000FF' },
      ];
      let currentState = state;

      for (let i = 0; i < 3; i++) {
        const block = currentState.currentPieces.find((p) => p !== null)!;
        currentState = gameEngine.placeBlock(currentState, block, {
          row: 0,
          col: i,
        });
      }

      expect(currentState.currentPieces).toHaveLength(3);
      expect(currentState.currentPieces.every((p) => p !== null)).toBe(true);
      expect(currentState.currentPieces.map((p) => p!.id)).not.toEqual([
        'a',
        'b',
        'c',
      ]);
    });

    it('should update high score', () => {
      let state = gameEngine.initializeGame();
      state.highScore = 50;

      // Place a 4-cell block (40 points)
      const block: BlockShape = {
        id: 'test',
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FF0000',
      };

      const newState = gameEngine.placeBlock(state, block, { row: 0, col: 0 });

      expect(newState.score).toBe(40);
      expect(newState.highScore).toBe(50); // Not updated yet

      // Add more points to beat high score
      // Fill row 2 except last cell
      let state2 = { ...newState };
      for (let col = 0; col < 7; col++) {
        state2.grid[2][col] = CellState.Filled;
      }

      const block2: BlockShape = {
        id: 'test2',
        shape: [[1]],
        color: '#FF0000',
      };

      const newState2 = gameEngine.placeBlock(state2, block2, { row: 2, col: 7 });

      // 40 (previous) + 10 (placement) + 100 (line clear) = 150
      expect(newState2.score).toBe(150);
      expect(newState2.highScore).toBe(150); // Updated!
    });
  });

  describe('checkGameOver', () => {
    it('should return false when grid is empty', () => {
      const grid = gridManager.createEmptyGrid();
      const blocks = blockGenerator.generateBlockSet(3);

      expect(gameEngine.checkGameOver(grid, blocks)).toBe(false);
    });

    it('should return false when at least one placement is valid', () => {
      const grid = gridManager.createEmptyGrid();

      // Fill most of the grid, leave one spot
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if (!(row === 7 && col === 7)) {
            grid[row][col] = CellState.Filled;
          }
        }
      }

      const blocks: BlockShape[] = [
        {
          id: 'test',
          shape: [[1]],
          color: '#FF0000',
        },
      ];

      expect(gameEngine.checkGameOver(grid, blocks)).toBe(false);
    });

    it('should return true when no valid placements exist', () => {
      const grid = gridManager.createEmptyGrid();

      // Fill entire grid
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          grid[row][col] = CellState.Filled;
        }
      }

      const blocks = blockGenerator.generateBlockSet(3);

      expect(gameEngine.checkGameOver(grid, blocks)).toBe(true);
    });

    it('should return true when block too big for empty spaces', () => {
      const grid = gridManager.createEmptyGrid();

      // Create a checkerboard pattern
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          if ((row + col) % 2 === 0) {
            grid[row][col] = CellState.Filled;
          }
        }
      }

      // Only have 2x2 blocks
      const blocks: BlockShape[] = [
        {
          id: 'test',
          shape: [
            [1, 1],
            [1, 1],
          ],
          color: '#FF0000',
        },
      ];

      expect(gameEngine.checkGameOver(grid, blocks)).toBe(true);
    });

    it('should return false when no blocks available', () => {
      const grid = gridManager.createEmptyGrid();
      expect(gameEngine.checkGameOver(grid, [])).toBe(false);
    });
  });

  describe('resetGame', () => {
    it('should reset game with preserved high score', () => {
      const newState = gameEngine.resetGame(1000);

      expect(newState.score).toBe(0);
      expect(newState.highScore).toBe(1000);
      expect(newState.combo).toBe(0);
      expect(newState.isGameOver).toBe(false);
      expect(gridManager.isEmpty(newState.grid)).toBe(true);
      expect(newState.currentPieces).toHaveLength(3);
    });
  });

  describe('getPossiblePlacements', () => {
    it('should return all positions for empty grid', () => {
      const grid = gridManager.createEmptyGrid();
      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };

      const positions = gameEngine.getPossiblePlacements(grid, block);

      expect(positions).toHaveLength(64); // 8x8 = 64 positions
    });

    it('should return fewer positions when grid is partially filled', () => {
      const grid = gridManager.createEmptyGrid();
      grid[0][0] = CellState.Filled;

      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };

      const positions = gameEngine.getPossiblePlacements(grid, block);

      expect(positions).toHaveLength(63); // One less
    });

    it('should return no positions for full grid', () => {
      const grid = gridManager.createEmptyGrid();

      // Fill entire grid
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          grid[row][col] = CellState.Filled;
        }
      }

      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };

      const positions = gameEngine.getPossiblePlacements(grid, block);

      expect(positions).toHaveLength(0);
    });
  });

  describe('simulateMove', () => {
    it('should return new state for valid move', () => {
      const state = gameEngine.initializeGame();
      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };

      const simulatedState = gameEngine.simulateMove(state, block, { row: 0, col: 0 });

      expect(simulatedState).not.toBeNull();
      expect(simulatedState!.grid[0][0]).toBe(CellState.Filled);
      // Original state unchanged
      expect(state.grid[0][0]).toBe(CellState.Empty);
    });

    it('should return null for invalid move', () => {
      const state = gameEngine.initializeGame();
      const block: BlockShape = {
        id: 'test',
        shape: [[1, 1]],
        color: '#FF0000',
      };

      const simulatedState = gameEngine.simulateMove(state, block, { row: 0, col: 7 });

      expect(simulatedState).toBeNull();
    });
  });
});
