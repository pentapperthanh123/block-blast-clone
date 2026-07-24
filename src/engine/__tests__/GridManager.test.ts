/**
 * GridManager Tests
 */

import { GridManager } from '../GridManager';
import { CellState, BlockShape } from '../../types';
import { GRID_SIZE } from '../../constants';

describe('GridManager', () => {
  let gridManager: GridManager;

  beforeEach(() => {
    gridManager = new GridManager();
  });

  describe('createEmptyGrid', () => {
    it('should create an 8x8 grid', () => {
      const grid = gridManager.createEmptyGrid();
      expect(grid).toHaveLength(GRID_SIZE);
      expect(grid[0]).toHaveLength(GRID_SIZE);
    });

    it('should initialize all cells as empty', () => {
      const grid = gridManager.createEmptyGrid();
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          expect(grid[row][col]).toBe(CellState.Empty);
        }
      }
    });
  });

  describe('canPlaceBlock', () => {
    it('should return true for valid placement', () => {
      const grid = gridManager.createEmptyGrid();
      const block: BlockShape = {
        id: 'test',
        shape: [[1, 1]],
        color: '#FF0000',
      };
      const position = { row: 0, col: 0 };

      expect(gridManager.canPlaceBlock(grid, block, position)).toBe(true);
    });

    it('should return false when out of bounds (right)', () => {
      const grid = gridManager.createEmptyGrid();
      const block: BlockShape = {
        id: 'test',
        shape: [[1, 1]],
        color: '#FF0000',
      };
      const position = { row: 0, col: 7 }; // Would go to col 8

      expect(gridManager.canPlaceBlock(grid, block, position)).toBe(false);
    });

    it('should return false when out of bounds (bottom)', () => {
      const grid = gridManager.createEmptyGrid();
      const block: BlockShape = {
        id: 'test',
        shape: [[1], [1]],
        color: '#FF0000',
      };
      const position = { row: 7, col: 0 }; // Would go to row 8

      expect(gridManager.canPlaceBlock(grid, block, position)).toBe(false);
    });

    it('should return false when cell is occupied', () => {
      const grid = gridManager.createEmptyGrid();
      grid[0][0] = CellState.Filled;

      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };
      const position = { row: 0, col: 0 };

      expect(gridManager.canPlaceBlock(grid, block, position)).toBe(false);
    });

    it('should handle complex block shapes', () => {
      const grid = gridManager.createEmptyGrid();
      const lShape: BlockShape = {
        id: 'L',
        shape: [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
        color: '#FF0000',
      };
      const position = { row: 0, col: 0 };

      expect(gridManager.canPlaceBlock(grid, lShape, position)).toBe(true);
    });
  });

  describe('placeBlock', () => {
    it('should place a block on the grid', () => {
      const grid = gridManager.createEmptyGrid();
      const block: BlockShape = {
        id: 'test',
        shape: [[1, 1]],
        color: '#FF0000',
      };
      const position = { row: 0, col: 0 };

      const newGrid = gridManager.placeBlock(grid, block, position);

      expect(newGrid[0][0]).toBe(CellState.Filled);
      expect(newGrid[0][1]).toBe(CellState.Filled);
      expect(newGrid[0][2]).toBe(CellState.Empty);
    });

    it('should return a new grid (immutability)', () => {
      const grid = gridManager.createEmptyGrid();
      const block: BlockShape = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };
      const position = { row: 0, col: 0 };

      const newGrid = gridManager.placeBlock(grid, block, position);

      expect(newGrid).not.toBe(grid);
      expect(grid[0][0]).toBe(CellState.Empty); // Original unchanged
      expect(newGrid[0][0]).toBe(CellState.Filled); // New grid modified
    });

    it('should throw error for invalid placement', () => {
      const grid = gridManager.createEmptyGrid();
      const block: BlockShape = {
        id: 'test',
        shape: [[1, 1]],
        color: '#FF0000',
      };
      const position = { row: 0, col: 7 }; // Invalid

      expect(() => {
        gridManager.placeBlock(grid, block, position);
      }).toThrow('Cannot place block at this position');
    });

    it('should handle L-shaped block', () => {
      const grid = gridManager.createEmptyGrid();
      const lShape: BlockShape = {
        id: 'L',
        shape: [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
        color: '#FF0000',
      };
      const position = { row: 0, col: 0 };

      const newGrid = gridManager.placeBlock(grid, lShape, position);

      expect(newGrid[0][0]).toBe(CellState.Filled);
      expect(newGrid[0][1]).toBe(CellState.Empty);
      expect(newGrid[1][0]).toBe(CellState.Filled);
      expect(newGrid[2][0]).toBe(CellState.Filled);
      expect(newGrid[2][1]).toBe(CellState.Filled);
    });
  });

  describe('getFilledPositions', () => {
    it('should return empty array for empty grid', () => {
      const grid = gridManager.createEmptyGrid();
      const positions = gridManager.getFilledPositions(grid);
      expect(positions).toHaveLength(0);
    });

    it('should return all filled positions', () => {
      const grid = gridManager.createEmptyGrid();
      grid[0][0] = CellState.Filled;
      grid[1][1] = CellState.Filled;
      grid[2][2] = CellState.Filled;

      const positions = gridManager.getFilledPositions(grid);

      expect(positions).toHaveLength(3);
      expect(positions).toContainEqual({ row: 0, col: 0 });
      expect(positions).toContainEqual({ row: 1, col: 1 });
      expect(positions).toContainEqual({ row: 2, col: 2 });
    });
  });

  describe('countFilledCells', () => {
    it('should return 0 for empty grid', () => {
      const grid = gridManager.createEmptyGrid();
      expect(gridManager.countFilledCells(grid)).toBe(0);
    });

    it('should count filled cells correctly', () => {
      const grid = gridManager.createEmptyGrid();
      grid[0][0] = CellState.Filled;
      grid[1][1] = CellState.Filled;
      grid[2][2] = CellState.Filled;

      expect(gridManager.countFilledCells(grid)).toBe(3);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty grid', () => {
      const grid = gridManager.createEmptyGrid();
      expect(gridManager.isEmpty(grid)).toBe(true);
    });

    it('should return false for non-empty grid', () => {
      const grid = gridManager.createEmptyGrid();
      grid[0][0] = CellState.Filled;
      expect(gridManager.isEmpty(grid)).toBe(false);
    });
  });

  describe('isFull', () => {
    it('should return false for empty grid', () => {
      const grid = gridManager.createEmptyGrid();
      expect(gridManager.isFull(grid)).toBe(false);
    });

    it('should return true for full grid', () => {
      const grid = gridManager.createEmptyGrid();
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          grid[row][col] = CellState.Filled;
        }
      }
      expect(gridManager.isFull(grid)).toBe(true);
    });
  });
});
