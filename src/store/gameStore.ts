/**
 * Game Store - Zustand State Management
 * Interface Adapters Layer - Clean Architecture
 */

import { createWithEqualityFn } from 'zustand/traditional';
import {
  GameState,
  BlockShape,
  Position,
  ColorGrid,
  MoveResult,
  PlacedCellFx,
  LastGameOverResult,
  NewRoundPhase,
} from '../types';
import { ThemeName, pickRandomTheme, resolveTheme, getThemePaintColor } from '../constants/themes';
import { playThemeSound, preloadThemeSounds, playGlobalSound, NEW_RECORD_SOUND } from '../constants/themeSounds';
import { playVoiceFeedback, getVoiceVolume, preloadAllVoiceFeedback } from '../constants/voiceFeedback';
import { playWarningSound, stopWarningSound } from '../constants/themeSounds';
import { gameEngine } from '../engine';
import type { ComboMode } from '../engine/ScoreCalculator';
import { dangerDetector, DangerResult } from '../engine/DangerDetector';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { applyBlockColors, clearColorLines, createEmptyColorGrid } from '../utils/colorGrid';
import { createRoundStartBoard } from '../utils/randomGrid';
import { syncSharedGrid } from '../utils/sharedGrid';
import { Question } from '../utils/spacedRepetition';
import { generateOpenRouterQuestion } from '../utils/openrouter';
import { ANIMATION, DRAG, getMaxBoardFallMs } from '../constants';
import {
  BlockGenSettings,
  DEFAULT_BLOCK_GEN_SETTINGS,
  normalizeBlockGenSettings,
} from '../constants/blockGenSettings';
import {
  GameplaySettings,
  DEFAULT_GAMEPLAY_SETTINGS,
  normalizeGameplaySettings,
} from '../constants/gameplaySettings';

interface GhostPreview {
  positions: Position[];
  /** Top-left origin of the shape on the grid (snap target) */
  origin: Position;
  valid: boolean;
  color: string;
  /** Thuật toán 5: rows that will clear if block is placed here */
  willClearRows: number[];
  /** Thuật toán 5: columns that will clear if block is placed here */
  willClearCols: number[];
  /** Thuật toán 6: all cell positions that belong to clearing rows/cols */
  predictedPositions: Position[];
}

export interface ActiveSessionSnapshot {
  grid: number[][];
  cellColors: ColorGrid;
  currentPieces: (BlockShape | null)[];
  score: number;
  combo: number;
  currentTheme: ThemeName;
  boardEpoch: number;
  reviveCount: number;
}

export interface DragOverlayState {
  block: BlockShape;
  pageX: number;
  pageY: number;
}

interface GameStore extends GameState {
  cellColors: ColorGrid;
  ghost: GhostPreview | null;
  dragOverlay: DragOverlayState | null;
  clearingRows: number[];
  clearingColumns: number[];
  justPlaced: Position[];
  placedCellScores: PlacedCellFx[];
  isAnimatingClear: boolean;
  isAnimatingPerfectClear: boolean;
  lastMoodIndex: number;
  moodVisible: boolean;
  /** Keeps Good/Perfect popup alive after clear rows reset */
  feedbackVisible: boolean;
  /** Increments each clear — remounts feedback UI reliably */
  feedbackNonce: number;
  lastScoreBreakdown: {
    points: number;
    feedbackTier: 'Good' | 'Perfect' | 'Awesome' | 'Unbelievable';
    comboMultiplier: number;
    linesCleared: number;
  } | null;
  currentTheme: ThemeName;
  /** Combo: reset on miss, or keep stacking across non-clear moves */
  comboMode: ComboMode;
  blockGenSettings: BlockGenSettings;
  gameplaySettings: GameplaySettings;
  /** Thuật toán 7: Danger state */
  dangerState: DangerResult | null;
  lastGameOver: LastGameOverResult | null;
  newRoundPhase: NewRoundPhase;
  /** Bumps on fresh grid — remounts board cells so fall anim never leaks into new round */
  boardEpoch: number;
  /** New high score celebration */
  newHighScore: number | null;
  showHighScoreCelebration: boolean;
  /** Only celebrate the first time this round beats the record */
  highScoreCelebratedThisRound: boolean;
  /** True for a brief moment when player clears lines and escapes danger */
  savedMoment: boolean;

  initGame: () => void;
  beginClassicSession: () => void;
  beginNewRound: () => void;
  finishNewRoundTransition: () => void;
  persistGameOverIfNeeded: () => void;
  /** Trigger Game Over immediately (e.g. invalid drop on grid) */
  triggerImmediateGameOver: () => void;
  /** Confirm loss only after a failed board drop while deadlocked */
  confirmGameOverIfDeadlocked: () => void;
  placeBlock: (block: BlockShape, position: Position, onPlaced?: (success: boolean) => void) => boolean;
  canPlace: (block: BlockShape, position: Position) => boolean;
  setGhost: (ghost: GhostPreview | null) => void;
  setDragOverlay: (overlay: DragOverlayState | null) => void;
  /** Thuật toán 5: Smart ghost with predictive line detection */
  setSmartGhost: (block: BlockShape, position: Position, positions: Position[]) => void;
  commitPendingClear: () => void;
  resetGame: () => void;
  loadHighScore: () => Promise<void>;
  loadLastGameOver: () => Promise<void>;
  loadComboMode: () => Promise<void>;
  saveHighScore: (score: number) => Promise<void>;
  resetHighScore: () => Promise<void>;
  hideMood: () => void;
  hideHighScoreCelebration: () => void;
  changeTheme: (theme: ThemeName) => void;
  cycleRandomTheme: () => void;
  setComboMode: (mode: ComboMode) => void;
  setBlockGenSettings: (settings: BlockGenSettings) => void;
  activeSession: ActiveSessionSnapshot | null;
  saveActiveSessionIfNeeded: () => void;
  clearActiveSession: () => void;
  loadActiveSession: () => Promise<void>;
  loadBlockGenSettings: () => Promise<void>;
  setGameplaySettings: (settings: GameplaySettings) => void;
  loadGameplaySettings: () => Promise<void>;
  quizActive: boolean;
  setQuizActive: (active: boolean) => void;
  reviveGame: () => void;
  cachedQuizQuestion: Question | null;
  usedQuizHistory: string[];
  preFetchQuizQuestion: () => Promise<void>;
  registerUsedQuestion: (questionText: string) => void;
}

const HIGH_SCORE_KEY = '@block-blast:high-score';
const LAST_GAME_OVER_KEY = '@block-blast:last-game-over';
const ACTIVE_SESSION_KEY = '@block-blast:active-session';
const COMBO_MODE_KEY = '@block-blast:combo-mode';
const BLOCK_GEN_SETTINGS_KEY = '@block-blast:block-gen-settings';
const GAMEPLAY_SETTINGS_KEY = '@block-blast:gameplay-settings';

let clearTimer: ReturnType<typeof setTimeout> | null = null;
let moodTimer: ReturnType<typeof setTimeout> | null = null;
let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
let perfectClearTimer: ReturnType<typeof setTimeout> | null = null;
let newRoundRecapTimer: ReturnType<typeof setTimeout> | null = null;
let newRoundFallTimer: ReturnType<typeof setTimeout> | null = null;
let newRoundRevealTimer: ReturnType<typeof setTimeout> | null = null;
let pendingMove: MoveResult | null = null;
let pendingColors: ColorGrid | null = null;
/** Defer theme swap until clear FX finishes so old skins stay during burst */
let pendingThemeCycle = false;
/** Cancels stale deferred danger / warning callbacks after newer moves or game over */
let dangerFeedbackSeq = 0;
const EMPTY_ARRAY: unknown[] = [];

function invalidateDangerFeedback() {
  dangerFeedbackSeq += 1;
  void stopWarningSound();
}

function syncDangerAudio(get: () => GameStore) {
  if (!get().gameplaySettings.dangerWarningEnabled) {
    void stopWarningSound();
    return;
  }
  if (get().isGameOver) {
    void stopWarningSound();
    return;
  }
  const level = get().dangerState?.dangerLevel ?? 0;
  if (level < 2) {
    void stopWarningSound();
    return;
  }
  void playWarningSound(level);
}

function activePiecesFrom(state: GameStore): BlockShape[] {
  return state.currentPieces.filter((piece): piece is BlockShape => piece !== null);
}

function scheduleDangerFeedback(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  placedScores: PlacedCellFx[],
  playPlaceSound: boolean,
) {
  dangerFeedbackSeq += 1;
  const seq = dangerFeedbackSeq;
  setTimeout(() => {
    if (seq !== dangerFeedbackSeq) return;
    const state = get();
    if (state.isGameOver) {
      void stopWarningSound();
      return;
    }
    if (playPlaceSound) {
      playThemeSound(state.currentTheme, 'place', DRAG.PLACE_VOLUME);
    }
    const dangerResult = dangerDetector.checkDanger(state.grid, activePiecesFrom(state));
    set({ dangerState: dangerResult, placedCellScores: placedScores });
    syncDangerAudio(get);
    get().confirmGameOverIfDeadlocked();
  }, ANIMATION.PLACE_FX_DEFER_MS);
}

function clearNewRoundTimers() {
  if (newRoundRecapTimer) {
    clearTimeout(newRoundRecapTimer);
    newRoundRecapTimer = null;
  }
  if (newRoundFallTimer) {
    clearTimeout(newRoundFallTimer);
    newRoundFallTimer = null;
  }
  if (newRoundRevealTimer) {
    clearTimeout(newRoundRevealTimer);
    newRoundRevealTimer = null;
  }
}

/**
 * Drive recap → falling → fresh round from the store so React unmount
 * (leave Classic mid-transition) cannot cancel the phase machine.
 */
function scheduleNewRoundTransition(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
) {
  clearNewRoundTimers();
  newRoundRecapTimer = setTimeout(() => {
    newRoundRecapTimer = null;
    if (get().newRoundPhase !== 'recap') return;
    set({ newRoundPhase: 'falling', currentPieces: [null, null, null] });
    newRoundFallTimer = setTimeout(() => {
      newRoundFallTimer = null;
      if (get().newRoundPhase !== 'falling') return;
      set({ newRoundPhase: 'revealing' });
      newRoundRevealTimer = setTimeout(() => {
        newRoundRevealTimer = null;
        if (get().newRoundPhase !== 'revealing') return;
        get().finishNewRoundTransition();
      }, ANIMATION.NEW_ROUND_REVEAL_BUFFER_MS);
    }, getMaxBoardFallMs());
  }, ANIMATION.NEW_ROUND_RECAP_MS);
}

function cloneGrid(grid: GameStore['grid']): GameStore['grid'] {
  return grid.map(row => [...row]);
}

function cloneColorGrid(colors: ColorGrid): ColorGrid {
  return colors.map(row => [...row]);
}

function buildGameOverSnapshot(state: GameStore): LastGameOverResult {
  return {
    score: state.score,
    highScore: state.highScore,
    isNewHighScore: state.score === state.highScore && state.score > 0,
    grid: cloneGrid(state.grid),
    cellColors: cloneColorGrid(state.cellColors),
    currentPieces: state.currentPieces.map(piece =>
      piece ? { ...piece, shape: piece.shape.map(row => [...row]) } : null,
    ),
    theme: state.currentTheme,
  };
}

function restoreLosingBoard(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
  snapshot: LastGameOverResult,
) {
  if (snapshot.theme) {
    preloadThemeSounds(snapshot.theme);
  }
  clearNewRoundTimers();
  set({
    isGameOver: false,
    newRoundPhase: 'recap',
    // Restore loss theme so falling blocks keep old skins (not new-screen placeholders)
    ...(snapshot.theme ? { currentTheme: snapshot.theme } : {}),
    grid: cloneGrid(snapshot.grid),
    cellColors: cloneColorGrid(snapshot.cellColors),
    currentPieces: [null, null, null],
    score: snapshot.score,
    ghost: null,
    dragOverlay: null,
    clearingRows: [],
    clearingColumns: [],
    justPlaced: [],
    placedCellScores: [], // Ensure cleared
    isAnimatingClear: false,
    moodVisible: false,
    feedbackVisible: false,
    lastScoreBreakdown: null,
    dangerState: null,
  });
  invalidateDangerFeedback();
  scheduleNewRoundTransition(set, get);
}

function applyFreshRoundState(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
  highScore: number,
  themeId: ThemeName,
  boardEpoch: number,
) {
  const newState = gameEngine.resetGame(highScore);
  const theme = resolveTheme(themeId);
  const { grid: nextGrid, colors: nextColors } = createRoundStartBoard(
    theme,
    get().gameplaySettings.clearBoardOnNewRound,
    get().gameplaySettings.randomFillRatio,
  );
  syncSharedGrid(nextGrid);

  set({
    ...newState,
    currentTheme: themeId,
    grid: nextGrid,
    cellColors: nextColors,
    ghost: null,
    clearingRows: [],
    clearingColumns: [],
    justPlaced: [],
    placedCellScores: [], // Ensure cleared
    isAnimatingClear: false,
    moodVisible: false,
    feedbackVisible: false,
    lastScoreBreakdown: null,
    dangerState: null,
    isGameOver: false,
    newRoundPhase: 'idle',
    lastGameOver: null,
    dragOverlay: null,
    highScoreCelebratedThisRound: false,
    showHighScoreCelebration: false,
    newHighScore: null,
    savedMoment: false,
    boardEpoch,
  });
}

/** Persist high score; celebrate only the first crossing this round */
function noteHighScoreIfNeeded(
  set: (partial: Partial<GameStore>) => void,
  get: () => GameStore,
  nextHighScore: number,
  previousHighScore: number,
) {
  if (nextHighScore <= previousHighScore) return;

  get().saveHighScore(nextHighScore);

  if (get().highScoreCelebratedThisRound) return;

  set({
    newHighScore: nextHighScore,
    showHighScoreCelebration: true,
    highScoreCelebratedThisRound: true,
  });
  void playGlobalSound(NEW_RECORD_SOUND, 0.78);
}

export const useGameStore = createWithEqualityFn<GameStore>((set, get) => ({
  ...gameEngine.initializeGame(),
  cellColors: createEmptyColorGrid(),
  ghost: null,
  dragOverlay: null,
  clearingRows: [],
  clearingColumns: [],
  justPlaced: [],
  placedCellScores: [],
  isAnimatingClear: false,
  isAnimatingPerfectClear: false,
  lastMoodIndex: 0,
  moodVisible: false,
  feedbackVisible: false,
  feedbackNonce: 0,
  lastScoreBreakdown: null,
  currentTheme: 'classic',
  comboMode: 'persist',
  blockGenSettings: { ...DEFAULT_BLOCK_GEN_SETTINGS },
  gameplaySettings: { ...DEFAULT_GAMEPLAY_SETTINGS },
  dangerState: null,
  lastGameOver: null,
  newRoundPhase: 'idle',
  boardEpoch: 0,
  newHighScore: null,
  showHighScoreCelebration: false,
  highScoreCelebratedThisRound: false,
  savedMoment: false,

  activeSession: null,
  quizActive: false,
  cachedQuizQuestion: null,
  usedQuizHistory: [],
  initGame: () => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    if (moodTimer) {
      clearTimeout(moodTimer);
      moodTimer = null;
    }
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
      feedbackTimer = null;
    }
    if (perfectClearTimer) {
      clearTimeout(perfectClearTimer);
      perfectClearTimer = null;
    }
    clearNewRoundTimers();
    pendingMove = null;
    pendingColors = null;
    pendingThemeCycle = false;
    invalidateDangerFeedback();

    const highScore = get().highScore;
    const newState = gameEngine.initializeGame();
    const theme = resolveTheme(get().currentTheme);
    const { grid: startGrid, colors: startColors } = createRoundStartBoard(
      theme,
      get().gameplaySettings.clearBoardOnNewRound,
      get().gameplaySettings.randomFillRatio,
    );
    syncSharedGrid(startGrid);

    // Preload voice feedback sounds
    preloadAllVoiceFeedback().catch((err) => 
      console.warn('Failed to preload voice feedback:', err)
    );

    set({
      ...newState,
      highScore,
      grid: startGrid,
      cellColors: startColors,
      ghost: null,
      dragOverlay: null,
      clearingRows: [],
      clearingColumns: [],
      justPlaced: [],
      isAnimatingClear: false,
      isAnimatingPerfectClear: false,
      moodVisible: false,
      feedbackVisible: false,
      lastScoreBreakdown: null,
      highScoreCelebratedThisRound: false,
      showHighScoreCelebration: false,
      newHighScore: null,
      newRoundPhase: 'idle',
      isGameOver: false,
      lastGameOver: null,
      dangerState: null,
      savedMoment: false,
      boardEpoch: get().boardEpoch + 1,
    });
    get().clearActiveSession();
    if (get().gameplaySettings.randomThemeOnNewRound) {
      get().cycleRandomTheme();
    }
    void get().preFetchQuizQuestion();
    get().confirmGameOverIfDeadlocked();
  },

  persistGameOverIfNeeded: () => {
    const state = get();
    if (!state.isGameOver) return;

    const snapshot = buildGameOverSnapshot(state);
    set({ lastGameOver: snapshot });
    AsyncStorage.setItem(LAST_GAME_OVER_KEY, JSON.stringify(snapshot)).catch(error =>
      console.error('Failed to cache game over:', error),
    );
  },

  triggerImmediateGameOver: () => {
    const { isGameOver, isAnimatingClear } = get();
    if (isGameOver || isAnimatingClear) return;

    set({
      isGameOver: true,
      ghost: null,
      dragOverlay: null,
      newRoundPhase: 'idle',
      dangerState: null,
    });
    invalidateDangerFeedback();
    get().clearActiveSession();
    get().persistGameOverIfNeeded();
  },

  confirmGameOverIfDeadlocked: () => {
    const { grid, currentPieces, isGameOver, isAnimatingClear } = get();
    if (isGameOver || isAnimatingClear) return;

    const activePieces = currentPieces.filter((piece): piece is BlockShape => piece !== null);
    if (!gameEngine.checkGameOver(grid, activePieces)) return;

    invalidateDangerFeedback();
    set({
      isGameOver: true,
      dangerState: null,
      ghost: null,
      dragOverlay: null,
    });
    get().clearActiveSession();
    get().persistGameOverIfNeeded();
  },

  beginClassicSession: () => {
    const { activeSession } = get();
    if (activeSession && activeSession.grid?.length) {
      preloadThemeSounds(activeSession.currentTheme);
      syncSharedGrid(activeSession.grid);
      set({
        grid: cloneGrid(activeSession.grid),
        cellColors: cloneColorGrid(activeSession.cellColors),
        currentPieces: activeSession.currentPieces,
        score: activeSession.score,
        combo: activeSession.combo ?? 0,
        currentTheme: activeSession.currentTheme,
        boardEpoch: activeSession.boardEpoch ?? 0,
        reviveCount: activeSession.reviveCount ?? 0,
        isGameOver: false,
        newRoundPhase: 'idle',
        ghost: null,
        dragOverlay: null,
        clearingRows: [],
        clearingColumns: [],
        justPlaced: [],
        placedCellScores: [],
        isAnimatingClear: false,
        moodVisible: false,
        feedbackVisible: false,
      });
      invalidateDangerFeedback();
      void get().preFetchQuizQuestion();
      get().confirmGameOverIfDeadlocked();
      return;
    }
    get().initGame();
  },

  beginNewRound: () => {
    // Safety: if game over without lastGameOver (edge case), persist first
    if (!get().lastGameOver && get().isGameOver) {
      get().persistGameOverIfNeeded();
    }
    const { lastGameOver } = get();
    if (lastGameOver) {
      restoreLosingBoard(set, get, lastGameOver);
    } else {
      get().initGame();
    }
  },

  finishNewRoundTransition: () => {
    if (clearTimer) {
      clearTimeout(clearTimer);
      clearTimer = null;
    }
    if (moodTimer) {
      clearTimeout(moodTimer);
      moodTimer = null;
    }
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
      feedbackTimer = null;
    }
    clearNewRoundTimers();
    pendingMove = null;
    pendingColors = null;
    pendingThemeCycle = false;

    const highScore = get().highScore;
    const nextTheme = get().gameplaySettings.randomThemeOnNewRound
      ? pickRandomTheme(get().currentTheme)
      : get().currentTheme;
    applyFreshRoundState(set, get, highScore, nextTheme, get().boardEpoch + 1);
    preloadThemeSounds(nextTheme);
    get().clearActiveSession();
    AsyncStorage.removeItem(LAST_GAME_OVER_KEY).catch(error =>
      console.error('Failed to clear cached game over:', error),
    );
  },

  canPlace: (block, position) => {
    const { grid, isAnimatingClear } = get();
    if (isAnimatingClear) return false;
    return gameEngine.canPlaceBlock(grid, block, position);
  },

  setGhost: ghost => set({ ghost }),

  setDragOverlay: overlay => set({ dragOverlay: overlay }),

  /** Ghost snap only — no line-predict during drag (predict was cloning the grid every cell). */
  setSmartGhost: (block, position, positions) => {
    const { grid, ghost: prev } = get();
    if (
      prev &&
      prev.origin?.row === position.row &&
      prev.origin?.col === position.col
    ) {
      return;
    }

    const valid = gameEngine.canPlaceBlock(grid, block, position);
    const color = getThemePaintColor(
      resolveTheme(get().currentTheme),
      block.color,
    );

    set({
      ghost: {
        positions,
        origin: position,
        valid,
        color,
        willClearRows: [],
        willClearCols: [],
        predictedPositions: [],
      },
    });
  },

  placeBlock: (block, position, onPlaced) => {
    const current = get();
    if (current.isAnimatingClear) return false;

    // Fast synchronous validation
    if (!gameEngine.canPlaceBlock(current.grid, block, position)) return false;

    // Execute in next frame to avoid frame tearing and visual lag on drop
    const stateBeforeExecution = get();
    if (stateBeforeExecution.isGameOver) {
      if (onPlaced) onPlaced(false);
      return false;
    }

    requestAnimationFrame(() => {
      try {
        const currentInner = get();
        if (currentInner.isAnimatingClear) {
          if (onPlaced) onPlaced(false);
          return;
        }

      const result = gameEngine.executeMove(stateBeforeExecution, block, position, {
        comboMode: stateBeforeExecution.comboMode,
        blockGenSettings: stateBeforeExecution.blockGenSettings,
      });
      syncSharedGrid(result.gridAfterPlace);
      const paintColor = getThemePaintColor(resolveTheme(currentInner.currentTheme), block.color);
      const colorsAfterPlace = applyBlockColors(
        currentInner.cellColors,
        { ...block, color: paintColor },
        position,
      );

      // Floating +N uses real placement points (10 per cell), not hardcoded 1
      const cells = Math.max(result.placedPositions.length, 1);
      const pointsPerCell = Math.max(1, Math.round(result.pointsFromPlacement / cells));
      const placedScores = result.placedPositions.map(pos => ({
        position: pos,
        points: pointsPerCell,
      }));

      const hasClear = result.clearedRows.length > 0 || result.clearedColumns.length > 0;

      // Keep old theme skins/particles until clear animation ends
      if (result.isFullClear) pendingThemeCycle = true;

      if (hasClear) {
        pendingMove = result;
        pendingColors = clearColorLines(
          colorsAfterPlace,
          result.clearedRows,
          result.clearedColumns,
        );

        const linesCleared = result.clearedRows.length + result.clearedColumns.length;
        const breakdown = result.scoreBreakdown
          ? {
              points: result.scoreBreakdown.finalPoints,
              feedbackTier: result.scoreBreakdown.feedbackTier,
              comboMultiplier: result.scoreBreakdown.comboMultiplier,
              linesCleared,
            }
          : {
              points: Math.max(result.pointsFromClear, 100),
              feedbackTier: 'Good' as const,
              comboMultiplier: 1,
              linesCleared: Math.max(linesCleared, 1),
            };

        const beatHighScore = result.state.highScore > current.highScore;
        const nextHigh = result.state.highScore;
        const prevHigh = current.highScore;

        // Play place sound immediately (clear sound will follow in commitPendingClear)
        playThemeSound(get().currentTheme, 'place', DRAG.PLACE_VOLUME);

        // Frame 1: board + clear tint only (no feedback / particles UI pile-up)
        set({
          ...result.state,
          clearingRows: result.clearedRows,
          clearingColumns: result.clearedColumns,
          justPlaced: result.placedPositions,
          isAnimatingClear: true,
          isAnimatingPerfectClear: !!result.isPerfectClear,
          cellColors: colorsAfterPlace,
          placedCellScores: EMPTY_ARRAY,
          ghost: null,
          dragOverlay: null,
          score: result.state.score,
          highScore: result.state.highScore,
          combo: result.state.combo,
          movesWithoutClear: result.state.movesWithoutClear,
          lastScoreBreakdown: breakdown,
          moodVisible: false,
          feedbackVisible: false,
        });

        if (clearTimer) clearTimeout(clearTimer);
        clearTimer = setTimeout(() => {
          get().commitPendingClear();
        }, ANIMATION.LINE_CLEAR);

        // Frame 2+: feedback / floating scores / high-score after board paints
        setTimeout(() => {
          if (moodTimer) clearTimeout(moodTimer);
          if (feedbackTimer) clearTimeout(feedbackTimer);

          set({
            moodVisible: true,
            feedbackVisible: true,
            feedbackNonce: get().feedbackNonce + 1,
            lastMoodIndex: get().lastMoodIndex + 1,
            placedCellScores: placedScores,
          });

          // Play voice feedback for achievement
          const tier = breakdown.feedbackTier;
          playVoiceFeedback(tier, getVoiceVolume(tier));

          if (beatHighScore) {
            noteHighScoreIfNeeded(set, get, nextHigh, prevHigh);
          }

          moodTimer = setTimeout(() => {
            get().hideMood();
          }, ANIMATION.SCORE_POPUP);
          feedbackTimer = setTimeout(() => {
            set({ feedbackVisible: false });
          }, ANIMATION.SCORE_POPUP);
          
          if (result.isPerfectClear) {
            if (perfectClearTimer) clearTimeout(perfectClearTimer);
            perfectClearTimer = setTimeout(() => {
              set({ isAnimatingPerfectClear: false });
            }, 1000);
          }
        }, ANIMATION.PLACE_FX_DEFER_MS);

        setTimeout(() => {
          if (!get().savedMoment) {
            set({ placedCellScores: EMPTY_ARRAY });
          }
        }, ANIMATION.PLACE_FX_DEFER_MS + ANIMATION.FLOATING_SCORE_MS);

        return true;
      }

      // Non-clear: paint board first, defer sound / danger / +N
      playThemeSound(get().currentTheme, 'place', DRAG.PLACE_VOLUME);
      set({
        ...result.state,
        isGameOver: false,
        cellColors: colorsAfterPlace,
        justPlaced: result.placedPositions,
        placedCellScores: EMPTY_ARRAY,
        clearingRows: EMPTY_ARRAY,
        clearingColumns: EMPTY_ARRAY,
        ghost: null,
        dragOverlay: null,
        isAnimatingClear: false,
      });

      const beatHighScore = result.state.highScore > current.highScore;
      const nextHigh = result.state.highScore;
      const prevHigh = current.highScore;
      scheduleDangerFeedback(get, set, placedScores, true);
      get().saveActiveSessionIfNeeded();

      if (beatHighScore) {
        setTimeout(() => {
          noteHighScoreIfNeeded(set, get, nextHigh, prevHigh);
        }, ANIMATION.PLACE_FX_DEFER_MS);
      }

      setTimeout(() => {
        set({ justPlaced: [] });
        if (!get().savedMoment) {
          set({ placedCellScores: [] });
        }
      }, ANIMATION.PLACE_FX_DEFER_MS + ANIMATION.FLOATING_SCORE_MS);

      } catch (err) {
        console.error('Error during block placement:', err);
        set({ dragOverlay: null, ghost: null });
      } finally {
        if (onPlaced) onPlaced(!get().isGameOver); // Roughly determine success
      }
    }); // end requestAnimationFrame

    return true;
  },

  commitPendingClear: () => {
    if (!pendingMove || !pendingColors) {
      pendingThemeCycle = false;
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

    // Play dynamic clear sound with combo pitch scaling & multi-line intensity
    const totalLines = move.clearedRows.length + move.clearedColumns.length;
    void playThemeSound(get().currentTheme, 'clear', {
      volume: DRAG.CLEAR_VOLUME,
      combo: move.state.combo,
      linesCount: totalLines,
    });

    // Paint cleared board FIRST — fast path, no heavy computation
    syncSharedGrid(move.state.grid);
    set({
      ...move.state,
      isGameOver: false,
      cellColors: colors,
      clearingRows: EMPTY_ARRAY,
      clearingColumns: EMPTY_ARRAY,
      justPlaced: EMPTY_ARRAY,
      isAnimatingClear: false,
      ghost: null,
    });

    // Defer danger detection + game-over check to next tick so board paints immediately
    setTimeout(() => {
      const wasInDanger = (get().dangerState?.dangerLevel ?? 0) >= 2;
      const dangerResult = dangerDetector.checkDanger(move.state.grid, move.state.currentPieces);
      const escaped = wasInDanger && dangerResult.dangerLevel < 2;

      set({
        dangerState: dangerResult,
        savedMoment: escaped,
        placedCellScores: escaped
          ? move.placedPositions.map((pos) => ({
              position: pos,
              points: 0,
              kind: 'like' as const,
            }))
          : get().placedCellScores,
      });

      dangerFeedbackSeq += 1;
      syncDangerAudio(get);
      get().confirmGameOverIfDeadlocked();

      if (escaped) {
        setTimeout(() => set({ savedMoment: false, placedCellScores: [] }), 2000);
      }

      if (pendingThemeCycle) {
        pendingThemeCycle = false;
        if (get().gameplaySettings.randomThemeOnNewRound) {
          get().cycleRandomTheme();
        }
      }
      get().saveActiveSessionIfNeeded();
    }, 0);
  },

  resetGame: () => {
    get().beginNewRound();
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

  loadLastGameOver: async () => {
    try {
      const stored = await AsyncStorage.getItem(LAST_GAME_OVER_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as LastGameOverResult;
      // Ignore legacy cache without board snapshot
      if (!parsed?.grid?.length || !parsed?.cellColors?.length) {
        await AsyncStorage.removeItem(LAST_GAME_OVER_KEY);
        return;
      }
      set({ lastGameOver: parsed });
    } catch (error) {
      console.error('Failed to load cached game over:', error);
    }
  },

  saveHighScore: async (score: number) => {
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  },

  resetHighScore: async () => {
    try {
      set({ highScore: 0, newHighScore: null });
      await AsyncStorage.removeItem(HIGH_SCORE_KEY);
    } catch (error) {
      console.error('Failed to reset high score:', error);
    }
  },

  hideMood: () => set({ moodVisible: false, feedbackVisible: false }),

  hideHighScoreCelebration: () => {
    set({ showHighScoreCelebration: false, newHighScore: null });
  },

  changeTheme: theme => {
    set({ currentTheme: theme });
    preloadThemeSounds(theme);
  },

  cycleRandomTheme: () => {
    const next = pickRandomTheme(get().currentTheme);
    set({ currentTheme: next });
    preloadThemeSounds(next);
  },

  setComboMode: mode => {
    set({ comboMode: mode });
    void AsyncStorage.setItem(COMBO_MODE_KEY, mode).catch(error =>
      console.error('Failed to save combo mode:', error),
    );
  },

  loadComboMode: async () => {
    try {
      const stored = await AsyncStorage.getItem(COMBO_MODE_KEY);
      if (stored === 'reset' || stored === 'persist') {
        set({ comboMode: stored });
        return;
      }
      set({ comboMode: 'persist' });
      await AsyncStorage.setItem(COMBO_MODE_KEY, 'persist');
    } catch (error) {
      console.error('Failed to load combo mode:', error);
    }
  },

  setBlockGenSettings: (settings) => {
    const normalized = normalizeBlockGenSettings(settings);
    set({ blockGenSettings: normalized });
    void AsyncStorage.setItem(BLOCK_GEN_SETTINGS_KEY, JSON.stringify(normalized)).catch(
      (error) => console.error('Failed to save block gen settings:', error),
    );
  },

  loadBlockGenSettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(BLOCK_GEN_SETTINGS_KEY);
      if (!stored) {
        set({ blockGenSettings: { ...DEFAULT_BLOCK_GEN_SETTINGS } });
        return;
      }
      const parsed = JSON.parse(stored) as Partial<BlockGenSettings>;
      set({ blockGenSettings: normalizeBlockGenSettings(parsed) });
    } catch (error) {
      console.error('Failed to load block gen settings:', error);
      set({ blockGenSettings: { ...DEFAULT_BLOCK_GEN_SETTINGS } });
    }
  },

  setGameplaySettings: (settings) => {
    const normalized = normalizeGameplaySettings(settings);
    set({ gameplaySettings: normalized });
    if (!normalized.dangerWarningEnabled) {
      void stopWarningSound();
    } else {
      syncDangerAudio(get);
    }
    void AsyncStorage.setItem(GAMEPLAY_SETTINGS_KEY, JSON.stringify(normalized)).catch(
      (error) => console.error('Failed to save gameplay settings:', error),
    );
  },

  loadGameplaySettings: async () => {
    try {
      const stored = await AsyncStorage.getItem(GAMEPLAY_SETTINGS_KEY);
      if (!stored) {
        set({ gameplaySettings: { ...DEFAULT_GAMEPLAY_SETTINGS } });
        return;
      }
      const parsed = JSON.parse(stored) as Partial<GameplaySettings>;
      set({ gameplaySettings: normalizeGameplaySettings(parsed) });
    } catch (error) {
      console.error('Failed to load gameplay settings:', error);
      set({ gameplaySettings: { ...DEFAULT_GAMEPLAY_SETTINGS } });
    }
  },

  saveActiveSessionIfNeeded: () => {
    const state = get();
    if (state.isGameOver || state.newRoundPhase !== 'idle') return;

    const snapshot: ActiveSessionSnapshot = {
      grid: cloneGrid(state.grid),
      cellColors: cloneColorGrid(state.cellColors),
      currentPieces: state.currentPieces,
      score: state.score,
      combo: state.combo,
      currentTheme: state.currentTheme,
      boardEpoch: state.boardEpoch,
      reviveCount: state.reviveCount,
    };
    set({ activeSession: snapshot });
    void AsyncStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(snapshot)).catch((err) =>
      console.error('Failed to save active session:', err),
    );
  },

  clearActiveSession: () => {
    set({ activeSession: null });
    void AsyncStorage.removeItem(ACTIVE_SESSION_KEY).catch((err) =>
      console.error('Failed to clear active session:', err),
    );
  },

  loadActiveSession: async () => {
    try {
      const stored = await AsyncStorage.getItem(ACTIVE_SESSION_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as ActiveSessionSnapshot;
      if (parsed?.grid?.length && parsed?.cellColors?.length) {
        set({ activeSession: parsed });
      }
    } catch (error) {
      console.error('Failed to load active session:', error);
    }
  },

  setQuizActive: (active) => set({ quizActive: active }),

  reviveGame: () => {
    const state = get();
    // Copy the current board grid
    const currentGrid = state.grid.map(row => [...row]);
    const currentColorGrid = state.cellColors.map(row => [...row]);

    // Find row densities of filled cells
    const rowStats = currentGrid.map((row, idx) => {
      const filledCount = row.filter(cell => cell === 1).length;
      return { idx, filledCount };
    });

    // Sort by filled count descending
    rowStats.sort((a, b) => b.filledCount - a.filledCount);

    // Clear top 3 rows (only if they have at least 1 block)
    const rowsToClear = rowStats
      .filter(stat => stat.filledCount > 0)
      .slice(0, 3)
      .map(stat => stat.idx);

    rowsToClear.forEach(rIdx => {
      currentGrid[rIdx] = currentGrid[rIdx].map(() => 0);
      currentColorGrid[rIdx] = currentColorGrid[rIdx].map(() => null);
    });

    // Create 3 easy blocks
    const easyShapes = [
      [[1]], // 1x1
      [[1, 1]], // 2x1
      [[1], [1]] // 1x2
    ];

    const colors = ['cyan', 'orange', 'green'];
    const easyPieces = easyShapes.map((shape, index) => {
      const colorKey = colors[index % colors.length];
      const paintColor = getThemePaintColor(resolveTheme(state.currentTheme), colorKey);
      return {
        id: `block-easy-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        shape: shape.map(row => [...row]),
        color: paintColor
      };
    });

    const nextUsedHistory = [...state.usedQuizHistory];
    if (state.cachedQuizQuestion) {
      nextUsedHistory.push(state.cachedQuizQuestion.question);
    }

    set({
      isGameOver: false,
      grid: currentGrid,
      cellColors: currentColorGrid,
      currentPieces: easyPieces,
      reviveCount: state.reviveCount + 1,
      quizActive: false,
      dangerState: null,
      ghost: null,
      dragOverlay: null,
      boardEpoch: state.boardEpoch + 1,
      usedQuizHistory: nextUsedHistory,
      cachedQuizQuestion: null, // Clear after use
    });

    syncSharedGrid(currentGrid);
    invalidateDangerFeedback();
    void get().preFetchQuizQuestion();
  },

  preFetchQuizQuestion: async () => {
    try {
      const state = get();
      const question = await generateOpenRouterQuestion(state.usedQuizHistory);
      set({ cachedQuizQuestion: question });
    } catch (e) {
      console.warn('Failed to pre-fetch OpenRouter quiz question:', e);
      set({ cachedQuizQuestion: null });
    }
  },

  registerUsedQuestion: (questionText: string) => {
    const history = get().usedQuizHistory;
    if (!history.includes(questionText)) {
      set({ usedQuizHistory: [...history, questionText] });
    }
  },
}));

useGameStore.getState().loadHighScore();
useGameStore.getState().loadLastGameOver();
useGameStore.getState().loadActiveSession();
useGameStore.getState().loadComboMode();
useGameStore.getState().loadBlockGenSettings();
useGameStore.getState().loadGameplaySettings();

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  (window as unknown as { __GAME_STORE__: typeof useGameStore }).__GAME_STORE__ =
    useGameStore;
}
