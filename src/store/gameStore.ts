/**
 * Game Store - Zustand State Management
 * Interface Adapters Layer - Clean Architecture
 */

import { create } from 'zustand';
import {
  GameState,
  BlockShape,
  Position,
  ColorGrid,
  MoveResult,
} from '../types';
import { gameEngine } from '../engine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  applyBlockColors,
  clearColorLines,
  createEmptyColorGrid,
} from '../utils/colorGrid';
import { ANIMATION } from '../constants';

interface GhostPreview {
  positions: Position[];
  valid: boolean;
  color: string;
}

interface GameStore extends GameState {
  cellColors: ColorGrid;
  ghost: GhostPreview | null;
  clearingRows: number[];
  clearingColumns: number[];
  justPlaced: Position[];
  isAnimatingClear: boolean;
  lastMoodIndex: number;
  moodVisible: boolean;
  lastScoreBreakdown: {
    points: number;
    feedbackTier: 'Good' | 'Awesome' | 'Unbelievable';
    comboMultiplier: number;
  } | null;

  initGame: () => void;
  placeBlock: (block: BlockShape, position: Position) => boolean;
  canPlace: (block: BlockShape, position: Position) => boolean;
  setGhost: (ghost: GhostPreview | null) => void;
  commitPendingClear: () => void;
  resetGame: () => void;
  loadHighScore: () => Promise<void>;
  saveHighScore: (score: number) => Promise<void>;
  hideMood: () => void;
}

const HIGH_SCORE_KEY = '@block-blast:high-score';

let clearTimer: ReturnType<typeof setTimeout> | null = null;
let moodTimer: ReturnType<typeof setTimeout> | null = null;
let pendingMove: MoveResult | null = null;
let pendingColors: ColorGrid | null = null;

function triggerMood(set: (partial: Partial<GameStore>) => void, get: () => GameStore) {
  if (moodTimer) clearTimeout(moodTimer);
  set({
    moodVisible: true,
    lastMoodIndex: get().lastMoodIndex + 1,
  });
  moodTimer = setTimeout(() => {
    get().hideMood();
  }, ANIMATION.COMBO_TEXT);
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...gameEngine.initializeGame(),
  cellColors: createEmptyColorGrid(),
  ghost: null,
  clearingRows: [],
  clearingColumns: [],
  justPlaced: [],
  isAnimatingClear: false,
  lastMoodIndex: 0,
  moodVisible: false,
  lastScoreBreakdown: null,

  initGame: () => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    if (moodTimer) {
      clearTimeout(moodTimer);
      moodTimer = null;
    }
    pendingMove = null;
    pendingColors = null;
    const newState = gameEngine.initializeGame();
    set({
      ...newState,
      highScore: get().highScore,
      cellColors: createEmptyColorGrid(),
      ghost: null,
      clearingRows: [],
      clearingColumns: [],
      justPlaced: [],
      isAnimatingClear: false,
      moodVisible: false,
    });
  },

  canPlace: (block, position) => {
    const { grid, isAnimatingClear } = get();
    if (isAnimatingClear) return false;
    return gameEngine.canPlaceBlock(grid, block, position);
  },

  setGhost: (ghost) => set({ ghost }),

  placeBlock: (block, position) => {
    const current = get();
    if (current.isAnimatingClear) return false;

    try {
      const result = gameEngine.executeMove(current, block, position);
      const colorsAfterPlace = applyBlockColors(
        current.cellColors,
        block,
        position
      );

      const hasClear =
        result.clearedRows.length > 0 || result.clearedColumns.length > 0;

      if (hasClear) {
        pendingMove = result;
        pendingColors = clearColorLines(
          colorsAfterPlace,
          result.clearedRows,
          result.clearedColumns
        );

        set({
          grid: result.gridAfterPlace,
          currentPieces: result.state.currentPieces,
          cellColors: colorsAfterPlace,
          clearingRows: result.clearedRows,
          clearingColumns: result.clearedColumns,
          justPlaced: result.placedPositions,
          isAnimatingClear: true,
          ghost: null,
          score: result.state.score,
          highScore: result.state.highScore,
          combo: result.state.combo,
        });

        if (result.state.highScore > current.highScore) {
          get().saveHighScore(result.state.highScore);
        }

        // Store score breakdown for popup
        if (result.scoreBreakdown) {
          set({
            lastScoreBreakdown: {
              points: result.scoreBreakdown.finalPoints,
              feedbackTier: result.scoreBreakdown.feedbackTier,
              comboMultiplier: result.scoreBreakdown.comboMultiplier,
            },
          });
        }

        triggerMood(set, get);

        if (clearTimer) clearTimeout(clearTimer);
        clearTimer = setTimeout(() => {
          get().commitPendingClear();
        }, ANIMATION.LINE_CLEAR);

        return true;
      }

      set({
        ...result.state,
        cellColors: colorsAfterPlace,
        justPlaced: result.placedPositions,
        clearingRows: [],
        clearingColumns: [],
        ghost: null,
        isAnimatingClear: false,
      });

      if (result.state.highScore > current.highScore) {
        get().saveHighScore(result.state.highScore);
      }

      setTimeout(() => {
        set({ justPlaced: [] });
      }, ANIMATION.BLOCK_PLACE);

      return true;
    } catch {
      return false;
    }
  },

  commitPendingClear: () => {
    if (!pendingMove || !pendingColors) {
      set({
        isAnimatingClear: false,
        clearingRows: [],
        clearingColumns: [],
        justPlaced: [],
      });
      return;
    }

    const move = pendingMove;
    const colors = pendingColors;
    pendingMove = null;
    pendingColors = null;
    clearTimer = null;

    set({
      ...move.state,
      cellColors: colors,
      clearingRows: [],
      clearingColumns: [],
      justPlaced: [],
      isAnimatingClear: false,
      ghost: null,
    });
  },

  resetGame: () => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    if (moodTimer) {
      clearTimeout(moodTimer);
      moodTimer = null;
    }
    pendingMove = null;
    pendingColors = null;
    const highScore = get().highScore;
    const newState = gameEngine.resetGame(highScore);
    set({
      ...newState,
      cellColors: createEmptyColorGrid(),
      ghost: null,
      clearingRows: [],
      clearingColumns: [],
      justPlaced: [],
      isAnimatingClear: false,
      moodVisible: false,
    });
  },

  loadHighScore: async () => {
    try {
      const storedScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      if (storedScore !== null) {
        set({ highScore: parseInt(storedScore, 10) });
      }
    } catch (error) {
      console.error('Failed to load high score:', error);
    }
  },

  saveHighScore: async (score: number) => {
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  },

  hideMood: () => set({ moodVisible: false }),
}));

useGameStore.getState().loadHighScore();
