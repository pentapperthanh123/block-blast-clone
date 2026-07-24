/**
 * LineDetector Tests
 */

import { LineDetector } from '../LineDetector';
import { GridManager } from '../GridManager';
import { CellState } from '../../types';
import { GRID_SIZE } from '../../constants';

describe('LineDetector', () => {
  let lineDetector: LineDetector;
  let gridManager: GridManager;

  beforeEach(() => {
    lineDetector = new LineDetector();
    gridManager = new GridManager();
  });

  describe('detectLines', () => {
    it('should return empty arrays for empty grid', () => {
      const grid = gridManager.createEmptyGrid();
      const lines = lineDetector.detectLines(grid);

      expect(lines.rows).toHaveLength(0);
      expect(lines.columns).toHaveLength(0);
    });

    it('should detect a completed row', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill row 0
      for (let col = 0; col < GRID_SIZE; col++) {
        grid[0][col] = CellState.Filled;
      }

      const lines = lineDetector.detectLines(grid);

      expect(lines.rows).toEqual([0]);
      expect(lines.columns).toHaveLength(0);
    });

    it('should detect a completed column', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill column 0
      for (let row = 0; row < GRID_SIZE; row++) {
        grid[row][0] = CellState.Filled;
      }

      const lines = lineDetector.detectLines(grid);

      expect(lines.rows).toHaveLength(0);
      expect(lines.columns).toEqual([0]);
    });

    it('should detect multiple rows', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill rows 0 and 2
      for (let col = 0; col < GRID_SIZE; col++) {
        grid[0][col] = CellState.Filled;
        grid[2][col] = CellState.Filled;
      }

      const lines = lineDetector.detectLines(grid);

      expect(lines.rows).toEqual([0, 2]);
      expect(lines.columns).toHaveLength(0);
    });

    it('should detect multiple columns', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill columns 1 and 3
      for (let row = 0; row < GRID_SIZE; row++) {
        grid[row][1] = CellState.Filled;
        grid[row][3] = CellState.Filled;
      }

      const lines = lineDetector.detectLines(grid);

      expect(lines.rows).toHaveLength(0);
      expect(lines.columns).toEqual([1, 3]);
    });

    it('should detect both rows and columns', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill row 0
      for (let col = 0; col < GRID_SIZE; col++) {
        grid[0][col] = CellState.Filled;
      }
      // Fill column 3
      for (let row = 0; row < GRID_SIZE; row++) {
        grid[row][3] = CellState.Filled;
      }

      const lines = lineDetector.detectLines(grid);

      expect(lines.rows).toEqual([0]);
      expect(lines.columns).toEqual([3]);
    });

    it('should not detect incomplete row', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill row 0 except last cell
      for (let col = 0; col < GRID_SIZE - 1; col++) {
        grid[0][col] = CellState.Filled;
      }

      const lines = lineDetector.detectLines(grid);

      expect(lines.rows).toHaveLength(0);
      expect(lines.columns).toHaveLength(0);
    });

    it('should detect all rows when grid is full', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill entire grid
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          grid[row][col] = CellState.Filled;
        }
      }

      const lines = lineDetector.detectLines(grid);

      expect(lines.rows).toHaveLength(GRID_SIZE);
      expect(lines.columns).toHaveLength(GRID_SIZE);
      expect(lines.rows).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
      expect(lines.columns).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
    });
  });

  describe('clearLines', () => {
    it('should return same grid when no lines to clear', () => {
      const grid = gridManager.createEmptyGrid();
      const lines = { rows: [], columns: [] };

      const newGrid = lineDetector.clearLines(grid, lines);

      expect(newGrid).toBe(grid); // Same reference
    });

    it('should clear a completed row', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill row 0
      for (let col = 0; col < GRID_SIZE; col++) {
        grid[0][col] = CellState.Filled;
      }

      const lines = { rows: [0], columns: [] };
      const newGrid = lineDetector.clearLines(grid, lines);

      // Row 0 should be empty
      for (let col = 0; col < GRID_SIZE; col++) {
        expect(newGrid[0][col]).toBe(CellState.Empty);
      }
    });

    it('should clear a completed column', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill column 3
      for (let row = 0; row < GRID_SIZE; row++) {
        grid[row][3] = CellState.Filled;
      }

      const lines = { rows: [], columns: [3] };
      const newGrid = lineDetector.clearLines(grid, lines);

      // Column 3 should be empty
      for (let row = 0; row < GRID_SIZE; row++) {
        expect(newGrid[row][3]).toBe(CellState.Empty);
      }
    });

    it('should clear multiple rows and columns', () => {
      const grid = gridManager.createEmptyGrid();
      // Fill rows 0, 2
      for (let col = 0; col < GRID_SIZE; col++) {
        grid[0][col] = CellState.Filled;
        grid[2][col] = CellState.Filled;
      }
      // Fill columns 1, 4
      for (let row = 0; row < GRID_SIZE; row++) {
        grid[row][1] = CellState.Filled;
        grid[row][4] = CellState.Filled;
      }

      const lines = { rows: [0, 2], columns: [1, 4] };
      const newGrid = lineDetector.clearLines(grid, lines);

      // Rows 0, 2 should be empty
      for (let col = 0; col < GRID_SIZE; col++) {
        expect(newGrid[0][col]).toBe(CellState.Empty);
        expect(newGrid[2][col]).toBe(CellState.Empty);
      }
      // Columns 1, 4 should be empty
      for (let row = 0; row < GRID_SIZE; row++) {
        expect(newGrid[row][1]).toBe(CellState.Empty);
        expect(newGrid[row][4]).toBe(CellState.Empty);
      }
    });

    it('should return a new grid (immutability)', () => {
      const grid = gridManager.createEmptyGrid();
      grid[0][0] = CellState.Filled;

      const lines = { rows: [0], columns: [] };
      const newGrid = lineDetector.clearLines(grid, lines);

      expect(newGrid).not.toBe(grid);
    });
  });

  describe('countClearedCells', () => {
    it('should return 0 for no lines', () => {
      const lines = { rows: [], columns: [] };
      expect(lineDetector.countClearedCells(lines)).toBe(0);
    });

    it('should count cells for one row', () => {
      const lines = { rows: [0], columns: [] };
      expect(lineDetector.countClearedCells(lines)).toBe(8);
    });

    it('should count cells for one column', () => {
      const lines = { rows: [], columns: [0] };
      expect(lineDetector.countClearedCells(lines)).toBe(8);
    });

    it('should count cells for one row and one column (with intersection)', () => {
      // 1 row (8 cells) + 1 column (8 cells) - 1 intersection = 15 cells
      const lines = { rows: [0], columns: [3] };
      expect(lineDetector.countClearedCells(lines)).toBe(15);
    });

    it('should count cells for multiple rows', () => {
      const lines = { rows: [0, 2, 5], columns: [] };
      expect(lineDetector.countClearedCells(lines)).toBe(24); // 3 * 8
    });

    it('should count cells for multiple columns', () => {
      const lines = { rows: [], columns: [1, 4] };
      expect(lineDetector.countClearedCells(lines)).toBe(16); // 2 * 8
    });

    it('should count cells for multiple rows and columns', () => {
      // 2 rows (16 cells) + 2 columns (16 cells) - 4 intersections = 28 cells
      const lines = { rows: [0, 3], columns: [1, 5] };
      expect(lineDetector.countClearedCells(lines)).toBe(28);
    });
  });

  describe('hasLines', () => {
    it('should return false for no lines', () => {
      const lines = { rows: [], columns: [] };
      expect(lineDetector.hasLines(lines)).toBe(false);
    });

    it('should return true when has rows', () => {
      const lines = { rows: [0], columns: [] };
      expect(lineDetector.hasLines(lines)).toBe(true);
    });

    it('should return true when has columns', () => {
      const lines = { rows: [], columns: [3] };
      expect(lineDetector.hasLines(lines)).toBe(true);
    });
  });

  describe('countLines', () => {
    it('should return 0 for no lines', () => {
      const lines = { rows: [], columns: [] };
      expect(lineDetector.countLines(lines)).toBe(0);
    });

    it('should count total lines', () => {
      const lines = { rows: [0, 2], columns: [1, 3, 5] };
      expect(lineDetector.countLines(lines)).toBe(5); // 2 + 3
    });
  });
});
