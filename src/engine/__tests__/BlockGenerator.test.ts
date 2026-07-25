/**
 * BlockGenerator Tests
 */

import { BlockGenerator } from '../BlockGenerator';
import { GridManager } from '../GridManager';
import { BLOCK_COLORS_ARRAY } from '../../constants';
import { CellState } from '../../types';

describe('BlockGenerator', () => {
  let blockGenerator: BlockGenerator;

  beforeEach(() => {
    blockGenerator = new BlockGenerator();
  });

  describe('generateBlock', () => {
    it('should generate a valid block', () => {
      const block = blockGenerator.generateBlock();

      expect(block).toHaveProperty('id');
      expect(block).toHaveProperty('shape');
      expect(block).toHaveProperty('color');
      expect(typeof block.id).toBe('string');
      expect(Array.isArray(block.shape)).toBe(true);
      expect(typeof block.color).toBe('string');
    });

    it('should generate block with valid color', () => {
      const block = blockGenerator.generateBlock();
      expect(BLOCK_COLORS_ARRAY).toContain(block.color);
    });

    it('should generate block with unique ID', () => {
      const block1 = blockGenerator.generateBlock();
      const block2 = blockGenerator.generateBlock();
      expect(block1.id).not.toBe(block2.id);
    });

    it('should generate block that passes validation', () => {
      const block = blockGenerator.generateBlock();
      expect(blockGenerator.validateBlockShape(block)).toBe(true);
    });

    it('should generate blocks with different shapes (randomness check)', () => {
      const shapes = new Set<string>();

      // Generate 20 blocks, expect some variety
      for (let i = 0; i < 20; i++) {
        const block = blockGenerator.generateBlock();
        const shapeString = JSON.stringify(block.shape);
        shapes.add(shapeString);
      }

      // Should have at least 3 different shapes in 20 tries
      expect(shapes.size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('generateBlockSet', () => {
    it('should generate 3 blocks by default', () => {
      const blocks = blockGenerator.generateBlockSet();
      expect(blocks).toHaveLength(3);
    });

    it('should generate specified number of blocks', () => {
      const blocks = blockGenerator.generateBlockSet(5);
      expect(blocks).toHaveLength(5);
    });

    it('should generate blocks with unique IDs', () => {
      const blocks = blockGenerator.generateBlockSet(5);
      const ids = blocks.map((b) => b.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should generate all valid blocks', () => {
      const blocks = blockGenerator.generateBlockSet(10);
      blocks.forEach((block) => {
        expect(blockGenerator.validateBlockShape(block)).toBe(true);
      });
    });

    it('should include a clearable block when grid has a one-gap row', () => {
      const gridManager = new GridManager();
      const grid = gridManager.createEmptyGrid();
      for (let col = 0; col < 7; col++) {
        grid[0][col] = CellState.Filled;
      }

      let foundClearable = false;
      for (let i = 0; i < 30; i++) {
        const blocks = blockGenerator.generateBlockSet(3, grid, {
          settings: {
            clearHelperChance: 1,
            fullClearBoostEnabled: false,
            fullClearLineBuilderCount: 2,
            fullClearLineBuilderChance: 0.75,
          },
        });
        const hasSingle = blocks.some(
          (b) => JSON.stringify(b.shape) === JSON.stringify([[1]]),
        );
        if (hasSingle) {
          foundClearable = true;
          break;
        }
      }
      expect(foundClearable).toBe(true);
    });

    it('should favor line-builders after a full board clear when boost enabled', () => {
      const gridManager = new GridManager();
      const grid = gridManager.createEmptyGrid();
      const isLineBuilder = (shape: number[][]) => {
        const s = JSON.stringify(shape);
        return (
          s === JSON.stringify([[1, 1, 1, 1]]) ||
          s === JSON.stringify([[1], [1], [1], [1]]) ||
          s === JSON.stringify([[1, 1, 1]]) ||
          s === JSON.stringify([[1], [1], [1]])
        );
      };

      let boostedCount = 0;
      const trials = 40;
      for (let i = 0; i < trials; i++) {
        const blocks = blockGenerator.generateBlockSet(3, grid, {
          afterFullClear: true,
          settings: {
            clearHelperChance: 0.48,
            fullClearBoostEnabled: true,
            fullClearLineBuilderCount: 2,
            fullClearLineBuilderChance: 0.75,
          },
        });
        const lineBuilders = blocks.filter((b) => isLineBuilder(b.shape)).length;
        if (lineBuilders >= 2) boostedCount++;
      }
      expect(boostedCount).toBeGreaterThan(trials * 0.85);
    });

    it('should boost 3×3 spawn rate after a line clear', () => {
      const gridManager = new GridManager();
      const grid = gridManager.createEmptyGrid();
      const shape3x3 = JSON.stringify([
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1],
      ]);

      let with3x3AfterClear = 0;
      let with3x3Normal = 0;
      const trials = 200;

      for (let i = 0; i < trials; i++) {
        const afterClear = blockGenerator.generateBlockSet(3, grid, {
          afterLineClear: true,
          settings: {
            clearHelperChance: 0,
            fullClearBoostEnabled: false,
            fullClearLineBuilderCount: 2,
            fullClearLineBuilderChance: 0.75,
          },
        });
        if (afterClear.some((b) => JSON.stringify(b.shape) === shape3x3)) {
          with3x3AfterClear++;
        }

        const normal = blockGenerator.generateBlockSet(3, grid, {
          afterLineClear: false,
          settings: {
            clearHelperChance: 0,
            fullClearBoostEnabled: false,
            fullClearLineBuilderCount: 2,
            fullClearLineBuilderChance: 0.75,
          },
        });
        if (normal.some((b) => JSON.stringify(b.shape) === shape3x3)) {
          with3x3Normal++;
        }
      }

      expect(with3x3AfterClear).toBeGreaterThan(with3x3Normal);
    });

    it('should apply pity and favor small pieces after consecutive hard trays', () => {
      const gridManager = new GridManager();
      const grid = gridManager.createEmptyGrid();
      const settings = {
        clearHelperChance: 0,
        fullClearBoostEnabled: false,
        fullClearLineBuilderCount: 2,
        fullClearLineBuilderChance: 0.75,
      };

      (blockGenerator as unknown as { hardTrayStreak: number }).hardTrayStreak = 2;

      let smallCount = 0;
      const trials = 120;
      for (let i = 0; i < trials; i++) {
        const blocks = blockGenerator.generateBlockSet(3, grid, { settings });
        const hasSmall = blocks.some((b) => blockGenerator.countBlockCells(b) <= 2);
        if (hasSmall) smallCount++;
      }

      expect(smallCount).toBeGreaterThan(trials * 0.45);
    });
  });

  describe('validateBlockShape', () => {
    it('should return true for valid single cell', () => {
      const block = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };
      expect(blockGenerator.validateBlockShape(block)).toBe(true);
    });

    it('should return true for valid 2x2 block', () => {
      const block = {
        id: 'test',
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FF0000',
      };
      expect(blockGenerator.validateBlockShape(block)).toBe(true);
    });

    it('should return true for valid L-shape', () => {
      const block = {
        id: 'test',
        shape: [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
        color: '#FF0000',
      };
      expect(blockGenerator.validateBlockShape(block)).toBe(true);
    });

    it('should return false for empty shape', () => {
      const block = {
        id: 'test',
        shape: [],
        color: '#FF0000',
      };
      expect(blockGenerator.validateBlockShape(block)).toBe(false);
    });

    it('should return false for all-empty cells', () => {
      const block = {
        id: 'test',
        shape: [
          [0, 0],
          [0, 0],
        ],
        color: '#FF0000',
      };
      expect(blockGenerator.validateBlockShape(block)).toBe(false);
    });

    it('should return false for jagged array (different row lengths)', () => {
      const block = {
        id: 'test',
        shape: [
          [1, 1],
          [1], // Wrong length!
        ],
        color: '#FF0000',
      };
      expect(blockGenerator.validateBlockShape(block)).toBe(false);
    });
  });

  describe('countBlockCells', () => {
    it('should count 1 for single cell', () => {
      const block = {
        id: 'test',
        shape: [[1]],
        color: '#FF0000',
      };
      expect(blockGenerator.countBlockCells(block)).toBe(1);
    });

    it('should count 4 for 2x2 square', () => {
      const block = {
        id: 'test',
        shape: [
          [1, 1],
          [1, 1],
        ],
        color: '#FF0000',
      };
      expect(blockGenerator.countBlockCells(block)).toBe(4);
    });

    it('should count 4 for L-shape', () => {
      const block = {
        id: 'test',
        shape: [
          [1, 0],
          [1, 0],
          [1, 1],
        ],
        color: '#FF0000',
      };
      expect(blockGenerator.countBlockCells(block)).toBe(4);
    });

    it('should count 4 for I-piece (horizontal)', () => {
      const block = {
        id: 'test',
        shape: [[1, 1, 1, 1]],
        color: '#FF0000',
      };
      expect(blockGenerator.countBlockCells(block)).toBe(4);
    });

    it('should count 0 for empty block', () => {
      const block = {
        id: 'test',
        shape: [
          [0, 0],
          [0, 0],
        ],
        color: '#FF0000',
      };
      expect(blockGenerator.countBlockCells(block)).toBe(0);
    });
  });

  describe('getAllShapes', () => {
    it('should return array of shapes', () => {
      const shapes = blockGenerator.getAllShapes();
      expect(Array.isArray(shapes)).toBe(true);
      expect(shapes.length).toBeGreaterThan(0);
    });

    it('should return a copy (not reference)', () => {
      const shapes1 = blockGenerator.getAllShapes();
      const shapes2 = blockGenerator.getAllShapes();
      expect(shapes1).not.toBe(shapes2); // Different references
      expect(shapes1).toEqual(shapes2); // But same content
    });

    it('should have at least 10 shapes', () => {
      const shapes = blockGenerator.getAllShapes();
      expect(shapes.length).toBeGreaterThanOrEqual(10);
    });
  });
});
