/**
 * GameBoard — 8x8 board with ghost + place/clear FX (View-based)
 */

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Dimensions, View, StyleSheet, type View as RNView } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  withDelay,
  withTiming,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { GRID_SIZE, BLOCK_COLORS, BOARD_CONSTANTS, ANIMATION, getMaxBoardFallMs } from '../../constants';
import { resolveTheme } from '../../constants/themes';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { Position } from '../../types';
import { BlockCell } from './BlockCell';
import { DangerOverlay } from '../ui/DangerOverlay';

export type BoardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Snap step = cellVisual + gap */
  cellSize: number;
  cellVisual: number;
  cellGap: number;
};

const GRID_INDICES = Array.from({ length: GRID_SIZE }, (_, i) => i);
const EMPTY_SET = new Set<string>();

export const BOARD_BORDER_PAD = BOARD_CONSTANTS.BORDER_PAD;

interface GameBoardProps {
  onBoardLayout?: (layout: BoardLayout) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ onBoardLayout }) => {
  const { cellVisual, cellGap, cellStep, boardSize, frameSize } = getBoardMetrics();
  const boardRef = useRef<RNView>(null);
  const clearingRows = useGameStore((s) => s.clearingRows);
  const clearingColumns = useGameStore((s) => s.clearingColumns);
  const currentThemeId = useGameStore((s) => s.currentTheme);
  const newRoundPhase = useGameStore((s) => s.newRoundPhase);
  const boardEpoch = useGameStore((s) => s.boardEpoch);
  const lastGameOver = useGameStore((s) => s.lastGameOver);

  // During recap/fall, lock skins to the lost round's theme
  const skinThemeId =
    newRoundPhase !== 'idle' && lastGameOver?.theme
      ? lastGameOver.theme
      : currentThemeId;
  const theme = resolveTheme(skinThemeId);
  const clearTint =
    theme.clearFx.colors[0] ?? theme.palette.glowMid;
  const isFalling = newRoundPhase === 'falling';
  const isRevealing = newRoundPhase === 'revealing';

  const measure = useCallback(() => {
    boardRef.current?.measureInWindow((x, y, width, height) => {
      if (width > 0 && height > 0) {
        onBoardLayout?.({
          x,
          y,
          width,
          height,
          cellSize: cellStep,
          cellVisual,
          cellGap,
        });
      }
    });
  }, [onBoardLayout, cellStep, cellVisual, cellGap]);

  useEffect(() => {
    const timer = setTimeout(measure, 100);
    const dimSub = Dimensions.addEventListener('change', measure);
    return () => {
      clearTimeout(timer);
      dimSub.remove();
    };
  }, [measure]);

  const clearingSet = useMemo(() => {
    if (clearingRows.length === 0 && clearingColumns.length === 0) {
      return EMPTY_SET;
    }
    const set = new Set<string>();
    for (const row of clearingRows) {
      for (let col = 0; col < GRID_SIZE; col++) set.add(`${row}-${col}`);
    }
    for (const col of clearingColumns) {
      for (let row = 0; row < GRID_SIZE; row++) set.add(`${row}-${col}`);
    }
    return set;
  }, [clearingRows, clearingColumns]);

  const skinMode =
    theme.skinMode ?? (theme.lockedBaseColor ? 'replace' : 'overlay');
  const skinSource = theme.source;
  const cellRadius =
    skinMode === 'replace'
      ? 0
      : Math.floor(
          Math.max(
            BOARD_CONSTANTS.MIN_RADIUS,
            cellVisual * BOARD_CONSTANTS.CELL_RADIUS_RATIO,
          ),
        );
  const boardColor = theme.boardColor || 'rgba(15, 23, 68, 0.92)';

  return (
    <View
      ref={boardRef}
      onLayout={measure}
      style={[
        styles.boardShell,
        {
          width: frameSize,
          height: frameSize,
          borderRadius: BOARD_CONSTANTS.BOARD_RADIUS,
          backgroundColor: boardColor,
        },
      ]}
    >
      <View
        style={[
          styles.boardInset,
          {
            width: boardSize,
            height: boardSize,
            margin: BOARD_BORDER_PAD,
            overflow: isFalling ? 'visible' : 'hidden',
          },
        ]}
      >
      <FallingGridWrapper
        isFalling={isFalling}
        isRevealing={isRevealing}
        boardEpoch={boardEpoch}
        boardSize={boardSize}
      >
      <View
        key={`grid-${boardEpoch}`}
        style={[
          styles.grid,
          {
            width: boardSize,
            height: boardSize,
            gap: cellGap,
            backgroundColor: boardColor,
          },
        ]}
      >
        <BoardGridOverlay
          boardSize={boardSize}
          cellStep={cellStep}
          lineColor={`rgba(255,255,255,${BOARD_CONSTANTS.GRID_LINE_OPACITY})`}
        />
        {GRID_INDICES.map((row) => (
          <BoardRow
            key={row}
            row={row}
            cellVisual={cellVisual}
            cellGap={cellGap}
            cellRadius={cellRadius}
            boardSize={boardSize}
            boardColor={boardColor}
            isFalling={isFalling}
            clearTint={clearTint}
            skinSource={skinSource}
            skinMode={skinMode}
            clearingSet={clearingSet}
          />
        ))}

        <DangerOverlay gridRadius={BOARD_CONSTANTS.BOARD_RADIUS - BOARD_BORDER_PAD} />
      </View>
      </FallingGridWrapper>
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.boardBorderOverlay,
          { borderRadius: BOARD_CONSTANTS.BOARD_RADIUS },
        ]}
      />
    </View>
  );
};

interface BoardRowProps {
  row: number;
  cellVisual: number;
  cellGap: number;
  cellRadius: number;
  boardSize: number;
  boardColor: string;
  isFalling: boolean;
  clearTint: string;
  skinSource: string;
  skinMode: 'replace' | 'overlay';
  clearingSet: Set<string>;
}

type BoardRowState = {
  cells: number[];
  colors: (string | null)[];
};

function boardRowStoreEqual(prev: BoardRowState, next: BoardRowState): boolean {
  if (prev.cells === next.cells && prev.colors === next.colors) return true;
  for (let i = 0; i < GRID_SIZE; i++) {
    if (prev.cells[i] !== next.cells[i]) return false;
    if (prev.colors[i] !== next.colors[i]) return false;
  }
  return true;
}

function boardRowPropsEqual(prev: Readonly<BoardRowProps>, next: Readonly<BoardRowProps>): boolean {
  if (
    prev.row !== next.row ||
    prev.cellVisual !== next.cellVisual ||
    prev.cellGap !== next.cellGap ||
    prev.cellRadius !== next.cellRadius ||
    prev.boardSize !== next.boardSize ||
    prev.boardColor !== next.boardColor ||
    prev.isFalling !== next.isFalling ||
    prev.clearTint !== next.clearTint ||
    prev.skinSource !== next.skinSource ||
    prev.skinMode !== next.skinMode
  ) {
    return false;
  }

  // Only re-render if the clearing state for THIS row changed
  for (let c = 0; c < 8; c++) {
    const key = `${prev.row}-${c}`;
    if (prev.clearingSet.has(key) !== next.clearingSet.has(key)) return false;
  }
  return true;
}

/** One row subscription — only re-renders when this row's cells/colors change */
const BoardRow: React.FC<BoardRowProps> = React.memo(({
  row,
  cellVisual,
  cellGap,
  cellRadius,
  boardSize,
  boardColor,
  isFalling,
  clearTint,
  skinSource,
  skinMode,
  clearingSet,
}) => {
  const { cells, colors } = useGameStore(
    (s) => ({
      cells: s.grid[row],
      colors: s.cellColors[row],
    }),
    boardRowStoreEqual,
  );

  return (
    <View
      style={[
        styles.boardRow,
        { gap: cellGap },
        isFalling && styles.boardRowFalling,
      ]}
    >
      {GRID_INDICES.map((col) => {
        const key = `${row}-${col}`;
        const filled = cells[col] === 1;
        const clearing = clearingSet.has(key);

        if (!filled && !clearing) {
          return (
            <StaticEmptyCell
              key={key}
              row={row}
              col={col}
              cellSize={cellVisual}
              radius={cellRadius}
              fillColor={boardColor}
            />
          );
        }

        return (
          <BoardCell
            key={key}
            row={row}
            col={col}
            cellSize={cellVisual}
            radius={cellRadius}
            boardSize={boardSize}
            falling={isFalling}
            clearTint={clearTint}
            skinSource={skinSource}
            skinMode={skinMode}
            color={colors[col] ?? BLOCK_COLORS.BLUE}
            empty={!filled}
            clearing={clearing}
          />
        );
      })}
    </View>
  );
}, boardRowPropsEqual);

/** Subtle checker tint + grid lines behind blocks */
const BoardGridOverlay: React.FC<{
  boardSize: number;
  cellStep: number;
  lineColor: string;
}> = React.memo(({ boardSize, cellStep, lineColor }) => {
  const lineW = BOARD_CONSTANTS.GRID_LINE_WIDTH;
  const vLines = useMemo(
    () =>
      Array.from({ length: GRID_SIZE - 1 }, (_, i) => ({
        key: `v-${i}`,
        left: (i + 1) * cellStep - lineW,
      })),
    [cellStep, lineW],
  );
  const hLines = useMemo(
    () =>
      Array.from({ length: GRID_SIZE - 1 }, (_, i) => ({
        key: `h-${i}`,
        top: (i + 1) * cellStep - lineW,
      })),
    [cellStep, lineW],
  );

  return (
    <View pointerEvents="none" style={styles.gridOverlay}>
      {vLines.map((line) => (
        <View
          key={line.key}
          style={[
            styles.gridLine,
            {
              left: line.left,
              top: 0,
              width: lineW,
              height: boardSize,
              backgroundColor: lineColor,
            },
          ]}
        />
      ))}
      {hLines.map((line) => (
        <View
          key={line.key}
          style={[
            styles.gridLine,
            {
              top: line.top,
              left: 0,
              height: lineW,
              width: boardSize,
              backgroundColor: lineColor,
            },
          ]}
        />
      ))}
    </View>
  );
});

const FallingGridWrapper: React.FC<{
  isFalling: boolean;
  isRevealing: boolean;
  boardEpoch: number;
  boardSize: number;
  children: React.ReactNode;
}> = ({ isFalling, isRevealing, boardEpoch, boardSize, children }) => {
  const boardFade = useSharedValue(1);
  const prevEpoch = useRef(boardEpoch);

  useEffect(() => {
    if (isRevealing) {
      boardFade.value = 0;
      return;
    }

    if (isFalling) {
      boardFade.value = 1;
      const maxFallMs = getMaxBoardFallMs();
      boardFade.value = withDelay(
        Math.max(0, maxFallMs - BOARD_CONSTANTS.FALL_FADE_LEAD_MS),
        withTiming(0, {
          duration: BOARD_CONSTANTS.FALL_FADE_DURATION_MS,
          easing: Easing.in(Easing.quad),
        }),
      );
      return;
    }

    if (prevEpoch.current !== boardEpoch) {
      prevEpoch.current = boardEpoch;
      boardFade.value = 0;
      boardFade.value = withTiming(1, {
        duration: ANIMATION.NEW_ROUND_REVEAL_FADE_MS,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    boardFade.value = 1;
  }, [isFalling, isRevealing, boardEpoch, boardFade]);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: boardFade.value,
  }));

  return (
    <Animated.View
      style={[{ width: boardSize, height: boardSize, overflow: 'hidden' }, fadeStyle]}
    >
      {children}
    </Animated.View>
  );
};

// BoardGhostLayer has been removed. Ghost preview is now rendered directly inside DragOverlay.tsx (100% UI thread).

const StaticEmptyCell = React.memo(function StaticEmptyCell({
  row,
  col,
  cellSize,
  radius,
  fillColor,
}: {
  row: number;
  col: number;
  cellSize: number;
  radius: number;
  fillColor: string;
}) {
  const isDark = (row + col) % 2 === 1;
  return (
    <View style={{ width: cellSize, height: cellSize }}>
      <View
        style={[
          styles.staticEmpty,
          {
            width: cellSize,
            height: cellSize,
            borderRadius: radius,
            backgroundColor: fillColor,
          },
        ]}
      >
        {isDark ? (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: `rgba(0,0,0,${BOARD_CONSTANTS.CHECKER_OVERLAY_OPACITY})`,
                borderRadius: radius,
              },
            ]}
          />
        ) : null}
      </View>
    </View>
  );
});

interface BoardCellProps {
  row: number;
  col: number;
  cellSize: number;
  radius: number;
  boardSize: number;
  falling: boolean;
  clearTint: string;
  skinSource: string;
  skinMode: 'replace' | 'overlay';
  color: string;
  empty: boolean;
  clearing: boolean;
}

function boardCellEqual(
  prev: Readonly<BoardCellProps>,
  next: Readonly<BoardCellProps>,
): boolean {
  return (
    prev.row === next.row &&
    prev.col === next.col &&
    prev.cellSize === next.cellSize &&
    prev.radius === next.radius &&
    prev.boardSize === next.boardSize &&
    prev.falling === next.falling &&
    prev.clearTint === next.clearTint &&
    prev.skinSource === next.skinSource &&
    prev.skinMode === next.skinMode &&
    prev.color === next.color &&
    prev.empty === next.empty &&
    prev.clearing === next.clearing
  );
}

const BoardCell: React.FC<BoardCellProps> = React.memo(({
  row,
  col,
  cellSize,
  radius,
  boardSize,
  falling,
  clearTint,
  skinSource,
  skinMode,
  color,
  empty,
  clearing,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const flash = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!clearing) return;
    flash.value = withRepeat(
      withTiming(1, { duration: BOARD_CONSTANTS.CLEAR_FLASH_DURATION_MS }),
      4,
      true,
    );
    opacity.value = withSequence(
      withRepeat(
        withTiming(0.35, { duration: BOARD_CONSTANTS.CLEAR_FLASH_DURATION_MS }),
        3,
        true,
      ),
      withTiming(0, { duration: BOARD_CONSTANTS.CLEAR_FLASH_DURATION_MS })
    );
    scale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withTiming(0, { duration: 200 }),
    );
    return () => {
      flash.value = 0;
      opacity.value = 1;
      scale.value = 1;
    };
  }, [clearing, flash, opacity, scale]);

  useEffect(() => {
    if (!falling || empty) {
      // CRITICAL: Use withTiming to reliably cancel running animations
      translateY.value = withTiming(0, { duration: 10 });
      translateX.value = withTiming(0, { duration: 10 });
      rotate.value = withTiming(0, { duration: 10 });
      // Fall fades opacity/scale — must restore or next round cells stay invisible
      if (!falling) {
        opacity.value = withTiming(1, { duration: 10 });
        scale.value = withTiming(1, { duration: 10 });
      }
      return;
    }

    const delay =
      row * BOARD_CONSTANTS.FALL_ROW_STAGGER_MS +
      col * BOARD_CONSTANTS.FALL_COL_STAGGER_MS;
    const drift =
      (col - 3.5) * BOARD_CONSTANTS.FALL_DRIFT_COL_SPREAD_PX +
      (row % 2 === 0
        ? BOARD_CONSTANTS.FALL_DRIFT_ROW_PARITY_PX
        : -BOARD_CONSTANTS.FALL_DRIFT_ROW_PARITY_PX);
    const spin = (col % 2 === 0 ? 1 : -1) * (18 + (row % 3) * 8);
    const screenH = Dimensions.get('window').height;
    const fallDistance =
      Math.max(boardSize * 1.35, screenH * 0.55) +
      row * BOARD_CONSTANTS.FALL_ROW_DISTANCE_BONUS_PX;

    translateY.value = 0;
    translateX.value = 0;
    rotate.value = 0;
    opacity.value = 1;
    scale.value = 1;

    translateY.value = withDelay(
      delay,
      withTiming(fallDistance, {
        duration: BOARD_CONSTANTS.FALL_DURATION_MS,
        easing: Easing.in(Easing.cubic),
      }),
    );
    translateX.value = withDelay(
      delay,
      withTiming(drift, {
        duration: BOARD_CONSTANTS.FALL_DURATION_MS,
        easing: Easing.out(Easing.quad),
      }),
    );
    rotate.value = withDelay(
      delay,
      withTiming(spin, {
        duration: BOARD_CONSTANTS.FALL_DURATION_MS,
        easing: Easing.out(Easing.quad),
      }),
    );
    opacity.value = withDelay(
      delay + BOARD_CONSTANTS.FALL_OPACITY_DELAY_MS,
      withTiming(0, {
        duration: BOARD_CONSTANTS.FALL_OPACITY_DURATION_MS,
        easing: Easing.in(Easing.quad),
      }),
    );
    scale.value = withDelay(
      delay,
      withTiming(0.85, { duration: BOARD_CONSTANTS.FALL_DURATION_MS }),
    );
  }, [
    falling,
    empty,
    row,
    col,
    boardSize,
    translateY,
    translateX,
    rotate,
    opacity,
    scale,
  ]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  const flashStyle = useAnimatedStyle(() => ({
    opacity: flash.value * 0.55,
  }));

  return (
    <Animated.View
      style={[{ width: cellSize, height: cellSize, position: 'relative' }, animStyle]}
    >
      <BlockCell
        size={cellSize}
        borderRadius={radius}
        color={color}
        skinSource={skinSource}
        skinMode={skinMode}
        isEmpty={empty}
      />
      {clearing && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: clearTint,
              borderRadius: radius,
            },
            flashStyle,
          ]}
        />
      )}
    </Animated.View>
  );
}, boardCellEqual);

export function pointerToCell(
  pageX: number,
  pageY: number,
  layout: BoardLayout,
  blockRows: number,
  blockCols: number,
): Position | null {
  const innerX = layout.x + BOARD_BORDER_PAD;
  const innerY = layout.y + BOARD_BORDER_PAD;
  const innerW = layout.width - BOARD_BORDER_PAD * 2;
  const innerH = layout.height - BOARD_BORDER_PAD * 2;

  const localX = pageX - innerX;
  const localY = pageY - innerY;
  if (localX < -layout.cellSize || localY < -layout.cellSize) return null;
  if (localX > innerW + layout.cellSize || localY > innerH + layout.cellSize) {
    return null;
  }

  const col = Math.round(localX / layout.cellSize - blockCols / 2);
  const row = Math.round(localY / layout.cellSize - blockRows / 2);
  return { row, col };
}

export function getBlockOccupiedCells(
  shape: number[][],
  origin: Position,
): Position[] {
  const cells: Position[] = [];
  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        cells.push({ row: origin.row + r, col: origin.col + c });
      }
    }
  }
  return cells;
}

const styles = StyleSheet.create({
  boardShell: {
    overflow: 'hidden',
    position: 'relative',
  },
  boardInset: {
    position: 'relative',
  },
  boardBorderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: BOARD_CONSTANTS.BORDER_WIDTH,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  grid: {
    position: 'relative',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  gridLine: {
    position: 'absolute',
  },
  boardRow: {
    flexDirection: 'row',
    zIndex: 2,
  },
  boardRowFalling: {
    overflow: 'visible',
    zIndex: 2,
  },
  ghostLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 4,
  },
  ghostCellWrap: {
    position: 'absolute',
  },
  ghostCell: {
    opacity: BOARD_CONSTANTS.GHOST_OPACITY,
  },
  staticEmpty: {
    position: 'relative',
    overflow: 'hidden',
  },
});
