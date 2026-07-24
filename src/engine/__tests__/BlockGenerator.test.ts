/**
 * BlockGenerator Tests
 */

import { BlockGenerator } from '../BlockGenerator';
import { BLOCK_COLORS_ARRAY } from '../../constants';

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
