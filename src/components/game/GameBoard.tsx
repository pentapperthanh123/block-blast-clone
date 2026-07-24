/**
 * GameBoard — 8x8 board with ghost + place/clear FX (View-based)
 */

import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, type View as RNView } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
  withRepeat,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { UI_COLORS, GRID_SIZE, BLOCK_COLORS } from '../../constants';
import { CELL_PAD, getBoardMetrics } from '../../utils/boardMetrics';
import { Position } from '../../types';
import { BlockCell } from './BlockCell';

export type BoardLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  cellSize: number;
};

export const BOARD_BORDER_PAD = 6; // 4px padding + 2px border

interface GameBoardProps {
  onBoardLayout?: (layout: BoardLayout) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ onBoardLayout }) => {
  const { cellSize, boardSize } = getBoardMetrics();
  const boardRef = useRef<RNView>(null);
  const grid = useGameStore((s) => s.grid);
  const cellColors = useGameStore((s) => s.cellColors);
  const ghost = useGameStore((s) => s.ghost);
  const clearingRows = useGameStore((s) => s.clearingRows);
  const clearingColumns = useGameStore((s) => s.clearingColumns);
  const justPlaced = useGameStore((s) => s.justPlaced);

  const measure = () => {
    boardRef.current?.measureInWindow((x, y, width, height) => {
      onBoardLayout?.({ x, y, width, height, cellSize });
    });
  };

  const clearingSet = useMemo(() => {
    const set = new Set<string>();
    for (const row of clearingRows) {
      for (let col = 0; col < GRID_SIZE; col++) set.add(`${row}-${col}`);
    }
    for (const col of clearingColumns) {
      for (let row = 0; row < GRID_SIZE; row++) set.add(`${row}-${col}`);
    }
    return set;
  }, [clearingRows, clearingColumns]);

  const placedSet = useMemo(
    () => new Set(justPlaced.map((p) => `${p.row}-${p.col}`)),
    [justPlaced]
  );

  const ghostSet = useMemo(() => {
    if (!ghost) return new Set<string>();
    return new Set(ghost.positions.map((p) => `${p.row}-${p.col}`));
  }, [ghost]);

  return (
    <View
      ref={boardRef}
      onLayout={measure}
      style={[
        styles.board,
        {
          width: boardSize + BOARD_BORDER_PAD * 2,
          height: boardSize + BOARD_BORDER_PAD * 2,
        },
      ]}
    >
      {Array.from({ length: GRID_SIZE }, (_, row) => (
        <View key={row} style={styles.boardRow}>
          {Array.from({ length: GRID_SIZE }, (_, col) => {
            const key = `${row}-${col}`;
            const filled = grid[row][col] === 1;
            const isGhost = ghostSet.has(key);

            return (
              <BoardCell
                key={key}
                size={cellSize}
                color={cellColors[row][col] ?? BLOCK_COLORS.BLUE}
                isGhost={isGhost}
                isValidGhost={ghost?.valid}
                empty={!filled && !isGhost}
                clearing={clearingSet.has(key)}
                placed={placedSet.has(key)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};

interface BoardCellProps {
  size: number;
  color: string;
  empty: boolean;
  isGhost?: boolean;
  isValidGhost?: boolean;
  clearing: boolean;
  placed: boolean;
}

const BoardCell: React.FC<BoardCellProps> = ({
  size,
  color,
  empty,
  isGhost,
  isValidGhost,
  clearing,
  placed,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (placed) {
      scale.value = withSequence(
        withTiming(1.15, { duration: 90 }),
        withTiming(1, { duration: 130 })
      );
    }
  }, [placed, scale]);

  useEffect(() => {
    if (clearing) {
      opacity.value = withRepeat(withTiming(0.2, { duration: 90 }), 4, true);
      scale.value = withSequence(
        withTiming(1.25, { duration: 120 }),
        withTiming(0.2, { duration: 280 })
      );
    } else {
      opacity.value = withTiming(1, { duration: 120 });
      scale.value = withTiming(1, { duration: 120 });
    }
  }, [clearing, opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pad = CELL_PAD;
  const cellSize = size - pad * 2;

  return (
    <Animated.View style={[{ margin: pad }, animStyle]}>
      <BlockCell
        size={cellSize}
        color={color}
        isEmpty={empty}
        isGhost={isGhost}
        isValidGhost={isValidGhost}
      />
    </Animated.View>
  );
};

export function pointerToCell(
  pageX: number,
  pageY: number,
  layout: BoardLayout,
  blockRows: number,
  blockCols: number
): Position | null {
  const localX = pageX - (layout.x + BOARD_BORDER_PAD);
  const localY = pageY - (layout.y + BOARD_BORDER_PAD);
  if (localX < -layout.cellSize || localY < -layout.cellSize) return null;
  if (localX > layout.width + layout.cellSize) return null;
  if (localY > layout.height + layout.cellSize) return null;

  const col = Math.round(localX / layout.cellSize - blockCols / 2);
  const row = Math.round(localY / layout.cellSize - blockRows / 2);
  return { row, col };
}

export function getBlockOccupiedCells(
  shape: number[][],
  origin: Position
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
  board: {
    backgroundColor: '#101A4D',
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  boardRow: {
    flexDirection: 'row',
  },
});
