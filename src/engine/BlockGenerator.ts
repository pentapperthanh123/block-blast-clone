/**
 * BlockGenerator - Generate block shapes for the tray
 * Classic-style weighted spawn: small pieces common, 3×3 rare, boost after line clear, pity after hard trays.
 */

import { BlockShape, Grid, CellState } from '../types';
import { BLOCK_COLORS_ARRAY, GRID_SIZE } from '../constants';
import {
  BlockGenSettings,
  DEFAULT_BLOCK_GEN_SETTINGS,
} from '../constants/blockGenSettings';
import { GridManager } from './GridManager';
import { LineDetector } from './LineDetector';

// Predefined block shapes (Tetromino-inspired)
const BLOCK_SHAPES: number[][][] = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ],
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

/** Index-aligned weights — smaller shapes common, 3×3 (~index 8) rare */
const NORMAL_SPAWN_WEIGHTS: readonly number[] = [
  14, 12, 12, 11, 11, 10, 10, 9, 4,
  7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
];

const SHAPE_3X3_INDEX = 8;
const SHAPE_2X2_INDEX = 7;
const LINE_BUILDER_INDICES = [3, 4, 5, 6] as const;
const SMALL_SHAPE_INDICES = [0, 1, 2] as const;

const MAX_PLACEABLE_RETRIES = 48;
const PITY_HARD_TRAY_STREAK = 2;
const DRY_SPELL_MOVE_THRESHOLD = 15;
const AFTER_LINE_CLEAR_LARGE_SLOT_CHANCE = 0.65;
const AFTER_LINE_CLEAR_3X3_MULTIPLIER = 5;
const AFTER_LINE_CLEAR_2X2_MULTIPLIER = 1.6;
const PITY_SMALL_MULTIPLIER = 2.2;
const PITY_3X3_MULTIPLIER = 0.35;
const DRY_SPELL_LINE_MULTIPLIER = 1.35;

/** Shapes that build toward line clears on a fresh board (I, triple, double, 2x2) */
const COMBO_STARTER_SHAPES: number[][][] = [
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1]],
  [[1], [1]],
  [
    [1, 1],
    [1, 1],
  ],
];

export interface GenerateBlockOptions {
  /** Board was just fully cleared — optional assisted combo tray */
  afterFullClear?: boolean;
  /** Player just cleared at least one row or column */
  afterLineClear?: boolean;
  /** Consecutive placements without a line clear */
  movesWithoutClear?: number;
  settings?: BlockGenSettings;
}

interface SpawnContext {
  afterLineClear: boolean;
  movesWithoutClear: number;
  pityActive: boolean;
}

export class BlockGenerator {
  private readonly gridManager = new GridManager();
  private readonly lineDetector = new LineDetector();
  private idCounter = 0;
  /** Consecutive trays that were all large / included 3×3 */
  private hardTrayStreak = 0;

  resetSpawnState(): void {
    this.hardTrayStreak = 0;
  }

  /**
   * Generate a single random block (weighted toward smaller shapes)
   */
  generateBlock(): BlockShape {
    return this.shapeToBlock(this.sampleWeightedShape(NORMAL_SPAWN_WEIGHTS));
  }

  /**
   * Generate a set of blocks. When grid is provided, uses classic weighted spawn
   * with optional clear-helper and full-clear boost (settings).
   */
  generateBlockSet(
    count: number = 3,
    grid?: Grid,
    options?: GenerateBlockOptions,
  ): BlockShape[] {
    const settings = options?.settings ?? DEFAULT_BLOCK_GEN_SETTINGS;

    if (!grid) {
      return Array.from({ length: count }, () => this.generateBlock());
    }

    const useFullClearBoost =
      settings.fullClearBoostEnabled &&
      (options?.afterFullClear || this.isGridEmpty(grid));

    if (useFullClearBoost) {
      return this.generateFullClearBoostSet(count, settings);
    }

    return this.generateClassicBlockSet(count, grid, options, settings);
  }

  private isGridEmpty(grid: Grid): boolean {
    return grid.every((row) => row.every((cell) => cell === CellState.Empty));
  }

  private generateClassicBlockSet(
    count: number,
    grid: Grid,
    options: GenerateBlockOptions | undefined,
    settings: BlockGenSettings,
  ): BlockShape[] {
    const ctx: SpawnContext = {
      afterLineClear: options?.afterLineClear ?? false,
      movesWithoutClear: options?.movesWithoutClear ?? 0,
      pityActive: this.hardTrayStreak >= PITY_HARD_TRAY_STREAK,
    };

    const blocks: BlockShape[] = [];

    if (Math.random() < settings.clearHelperChance) {
      const clearable = this.findClearableBlock(grid);
      if (clearable) {
        blocks.push(clearable);
      }
    }

    if (
      ctx.afterLineClear &&
      blocks.length < count &&
      Math.random() < AFTER_LINE_CLEAR_LARGE_SLOT_CHANCE
    ) {
      const largeShape = this.pickPlaceableWeightedShape(
        grid,
        this.resolveWeights(ctx),
      );
      if (largeShape) {
        blocks.push(this.shapeToBlock(largeShape));
      }
    }

    while (blocks.length < count) {
      const weights = this.resolveWeights(ctx);
      const shape =
        this.pickPlaceableWeightedShape(grid, weights) ??
        this.pickAnyPlaceableShape(grid) ??
        BLOCK_SHAPES[0];
      blocks.push(this.shapeToBlock(shape));
    }

    this.updateHardTrayStreak(blocks.slice(0, count));
    return this.shuffleBlocks(blocks.slice(0, count));
  }

  private resolveWeights(ctx: SpawnContext): number[] {
    const weights = [...NORMAL_SPAWN_WEIGHTS];

    if (ctx.afterLineClear) {
      weights[SHAPE_3X3_INDEX] *= AFTER_LINE_CLEAR_3X3_MULTIPLIER;
      weights[SHAPE_2X2_INDEX] *= AFTER_LINE_CLEAR_2X2_MULTIPLIER;
    }

    if (ctx.movesWithoutClear >= DRY_SPELL_MOVE_THRESHOLD) {
      for (const index of LINE_BUILDER_INDICES) {
        weights[index] *= DRY_SPELL_LINE_MULTIPLIER;
      }
    }

    if (ctx.pityActive) {
      for (const index of SMALL_SHAPE_INDICES) {
        weights[index] *= PITY_SMALL_MULTIPLIER;
      }
      weights[SHAPE_3X3_INDEX] *= PITY_3X3_MULTIPLIER;
    }

    return weights;
  }

  private sampleWeightedShape(weights: readonly number[]): number[][] {
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    let roll = Math.random() * total;

    for (let index = 0; index < BLOCK_SHAPES.length; index++) {
      roll -= weights[index] ?? 0;
      if (roll <= 0) {
        return BLOCK_SHAPES[index];
      }
    }

    return BLOCK_SHAPES[BLOCK_SHAPES.length - 1];
  }

  private pickPlaceableWeightedShape(
    grid: Grid,
    weights: readonly number[],
  ): number[][] | null {
    for (let attempt = 0; attempt < MAX_PLACEABLE_RETRIES; attempt++) {
      const shape = this.sampleWeightedShape(weights);
      if (this.isShapePlaceable(grid, shape)) {
        return shape;
      }
    }
    return null;
  }

  private pickAnyPlaceableShape(grid: Grid): number[][] | null {
    for (const shape of this.shuffledShapes()) {
      if (this.isShapePlaceable(grid, shape)) {
        return shape;
      }
    }
    return null;
  }

  private updateHardTrayStreak(blocks: BlockShape[]): void {
    const hasSmallPiece = blocks.some(
      (block) => this.countCellsInShape(block.shape) <= 2,
    );
    if (hasSmallPiece) {
      this.hardTrayStreak = 0;
      return;
    }

    const allLarge = blocks.every(
      (block) => this.countCellsInShape(block.shape) >= 4,
    );
    const has3x3 = blocks.some((block) => this.is3x3Shape(block.shape));

    if (allLarge || has3x3) {
      this.hardTrayStreak += 1;
    }
  }

  private countCellsInShape(shape: number[][]): number {
    let count = 0;
    for (const row of shape) {
      for (const cell of row) {
        if (cell === 1) count++;
      }
    }
    return count;
  }

  private is3x3Shape(shape: number[][]): boolean {
    return (
      shape.length === 3 &&
      shape.every((row) => row.length === 3 && row.every((cell) => cell === 1))
    );
  }

  /**
   * Optional assisted mode after a full board clear (Settings → fullClearBoostEnabled).
   */
  private generateFullClearBoostSet(
    count: number,
    settings: BlockGenSettings,
  ): BlockShape[] {
    const blocks: BlockShape[] = [];
    const guaranteed = Math.min(count, settings.fullClearLineBuilderCount);

    for (let i = 0; i < guaranteed; i++) {
      blocks.push(this.shapeToBlock(this.randomComboShape(true)));
    }

    while (blocks.length < count) {
      const preferLine = Math.random() < settings.fullClearLineBuilderChance;
      blocks.push(this.shapeToBlock(this.randomComboShape(preferLine)));
    }

    return this.shuffleBlocks(blocks.slice(0, count));
  }

  private randomComboShape(preferLineBuilder: boolean): number[][] {
    const lineBuilders = COMBO_STARTER_SHAPES.slice(0, 4);
    const pool = preferLineBuilder ? lineBuilders : COMBO_STARTER_SHAPES;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  private shuffleBlocks(blocks: BlockShape[]): BlockShape[] {
    const result = [...blocks];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private findClearableBlock(grid: Grid): BlockShape | null {
    for (const shape of this.shuffledShapes()) {
      const stub = this.shapeToBlock(shape);
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          const position = { row, col };
          if (!this.gridManager.canPlaceBlock(grid, stub, position)) continue;

          const placed = this.gridManager.placeBlock(grid, stub, position);
          const lines = this.lineDetector.detectLines(placed);
          if (lines.rows.length + lines.columns.length > 0) {
            return this.shapeToBlock(shape);
          }
        }
      }
    }
    return null;
  }

  private isShapePlaceable(grid: Grid, shape: number[][]): boolean {
    const stub = this.shapeToBlock(shape);
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (this.gridManager.canPlaceBlock(grid, stub, { row, col })) {
          return true;
        }
      }
    }
    return false;
  }

  private shuffledShapes(): number[][][] {
    const shapes = [...BLOCK_SHAPES];
    for (let i = shapes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shapes[i], shapes[j]] = [shapes[j], shapes[i]];
    }
    return shapes;
  }

  private shapeToBlock(shape: number[][]): BlockShape {
    this.idCounter += 1;
    const colorIndex = Math.floor(Math.random() * BLOCK_COLORS_ARRAY.length);
    return {
      id: `block-${Date.now()}-${this.idCounter}-${Math.random().toString(36).slice(2, 7)}`,
      shape,
      color: BLOCK_COLORS_ARRAY[colorIndex],
    };
  }

  /**
   * Validate that a block shape is well-formed
   */
  validateBlockShape(shape: BlockShape): boolean {
    if (!shape.shape || shape.shape.length === 0) {
      return false;
    }

    const rowLength = shape.shape[0].length;
    for (const row of shape.shape) {
      if (row.length !== rowLength) {
        return false;
      }
    }

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
    return this.countCellsInShape(block.shape);
  }

  /**
   * Get all available block shapes (for testing/preview)
   */
  getAllShapes(): number[][][] {
    return [...BLOCK_SHAPES];
  }
}

export const blockGenerator = new BlockGenerator();
