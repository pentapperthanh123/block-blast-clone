/**
 * BlockGenerator - Generate random block shapes
 * Business Logic Layer - Clean Architecture
 */

import { BlockShape } from '../types';
import { BLOCK_COLORS_ARRAY } from '../constants';

// Predefined block shapes (Tetromino-inspired)
const BLOCK_SHAPES: number[][][] = [
  // Single cell
  [[1]],

  // 2x1 horizontal
  [[1, 1]],

  // 2x1 vertical
  [[1], [1]],

  // 3x1 horizontal
  [[1, 1, 1]],

  // 3x1 vertical
  [[1], [1], [1]],

  // 4x1 horizontal (I-piece)
  [[1, 1, 1, 1]],

  // 4x1 vertical
  [[1], [1], [1], [1]],

  // 2x2 square
  [
    [1, 1],
    [1, 1],
  ],

  // 3x3 square
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],

  // L-shape (4 rotations)
  [
    [1, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 1],
    [0, 1],
    [0, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],

  // T-shape (4 rotations)
  [
    [1, 1, 1],
    [0, 1, 0],
  ],
  [
    [0, 1],
    [1, 1],
    [0, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0],
    [1, 1],
    [1, 0],
  ],

  // Z-shape (2 rotations)
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
  [
    [0, 1],
    [1, 1],
    [1, 0],
  ],
];

export class BlockGenerator {
  /**
   * Generate a single random block
   */
  generateBlock(): BlockShape {
    const shapeIndex = Math.floor(Math.random() * BLOCK_SHAPES.length);
    const colorIndex = Math.floor(Math.random() * BLOCK_COLORS_ARRAY.length);

    return {
      id: `block-${Date.now()}-${Math.random()}`,
      shape: BLOCK_SHAPES[shapeIndex],
      color: BLOCK_COLORS_ARRAY[colorIndex],
    };
  }

  /**
   * Generate a set of blocks (typically 3 for the game)
   */
  generateBlockSet(count: number = 3): BlockShape[] {
    const blocks: BlockShape[] = [];

    for (let i = 0; i < count; i++) {
      blocks.push(this.generateBlock());
    }

    return blocks;
  }

  /**
   * Validate that a block shape is well-formed
   */
  validateBlockShape(shape: BlockShape): boolean {
    if (!shape.shape || shape.shape.length === 0) {
      return false;
    }

    // Check all rows have same length
    const rowLength = shape.shape[0].length;
    for (const row of shape.shape) {
      if (row.length !== rowLength) {
        return false;
      }
    }

    // Check at least one cell is filled
    let hasFilledCell = false;
    for (const row of shape.shape) {
      for (const cell of row) {
        if (cell === 1) {
          hasFilledCell = true;
          break;
        }
      }
      if (hasFilledCell) break;
    }

    return hasFilledCell;
  }

  /**
   * Get number of filled cells in a block
   */
  countBlockCells(block: BlockShape): number {
    let count = 0;
    for (const row of block.shape) {
      for (const cell of row) {
        if (cell === 1) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Get all available block shapes (for testing/preview)
   */
  getAllShapes(): number[][][] {
    return [...BLOCK_SHAPES]; // Return a copy
  }
}

// Export singleton instance
export const blockGenerator = new BlockGenerator();
