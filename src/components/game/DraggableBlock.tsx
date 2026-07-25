/**
 * DraggableBlock — tray hit target; floating piece via DragOverlay (UI-thread pos).
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlockShape, Position } from '../../types';
import { useGameStore } from '../../store/gameStore';
import { DRAG } from '../../constants';
import { playThemeSound } from '../../constants/themeSounds';
import { getThemePaintColor, resolveTheme } from '../../constants/themes';
import {
  BOARD_BORDER_PAD,
  BoardLayout,
  getBlockOccupiedCells,
  pointerToCell,
} from './GameBoard';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { dragActive, dragPageX, dragPageY, ghostRow, ghostCol, ghostValid, ghostColor, dragIndex } from '../../utils/dragShared';
import { sharedGrid, sharedClearMask } from '../../utils/sharedGrid';
import { computeDropSnapPage } from '../../utils/dropSnap';
import { BlockCell } from './BlockCell';

const LIFT_RATIO = DRAG.LIFT_RATIO;

interface DraggableBlockProps {
  block: BlockShape;
  boardLayout: BoardLayout | null;
  index?: number;
  disabled?: boolean;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  boardLayout,
  index = -1,
  disabled,
}) => {
  const { cellStep, cellVisual, traySlotSize, trayCellSize } = getBoardMetrics();
  const placeBlock = useGameStore((s) => s.placeBlock);
  const confirmGameOverIfDeadlocked = useGameStore(
    (s) => s.confirmGameOverIfDeadlocked,
  );
  const setGhost = useGameStore((s) => s.setGhost);
  const setSmartGhost = useGameStore((s) => s.setSmartGhost);
  const setDragOverlay = useGameStore((s) => s.setDragOverlay);
  const currentTheme = useGameStore((s) => s.currentTheme);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const dragging = useSharedValue(0);
  /** 1 = onEnd already handled drop — skip cancel in onFinalize */
  const dropHandled = useSharedValue(0);

  const layoutX = useSharedValue(0);
  const layoutY = useSharedValue(0);
  const layoutW = useSharedValue(0);
  const layoutH = useSharedValue(0);
  const layoutCell = useSharedValue(cellStep);
  const hasLayout = useSharedValue(0);
  const lastSnapRow = useSharedValue(-999);
  const lastSnapCol = useSharedValue(-999);

  const boardLayoutRef = useRef(boardLayout);
  boardLayoutRef.current = boardLayout;
  const ghostFrameRef = useRef<number | null>(null);
  const pendingGhostRef = useRef<{ pageX: number; pageY: number } | null>(null);
  const dropInFlightRef = useRef(false);

  useEffect(() => {
    return () => {
      if (ghostFrameRef.current != null) {
        cancelAnimationFrame(ghostFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!boardLayout) {
      hasLayout.value = 0;
      return;
    }
    layoutX.value = boardLayout.x;
    layoutY.value = boardLayout.y;
    layoutW.value = boardLayout.width;
    layoutH.value = boardLayout.height;
    layoutCell.value = boardLayout.cellSize;
    hasLayout.value = 1;
  }, [
    boardLayout,
    hasLayout,
    layoutX,
    layoutY,
    layoutW,
    layoutH,
    layoutCell,
  ]);

  const rows = block.shape.length;
  const cols = block.shape[0].length;
  const trayRadius = Math.max(3, trayCellSize * 0.12);
  const theme = resolveTheme(currentTheme);
  const paint = getThemePaintColor(theme, block.color);
  const skinMode = theme.skinMode ?? (theme.lockedBaseColor ? 'replace' : 'overlay');

  const ghostAnchorY = (pageY: number) => pageY - cellVisual * LIFT_RATIO;

  const resetSnap = () => {
    lastSnapRow.value = -999;
    lastSnapCol.value = -999;
  };

  const checkCollisionWorklet = (
    row: number,
    col: number,
    shape: number[][],
    grid: number[][]
  ) => {
    'worklet';
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const rr = row + r;
          const cc = col + c;
          if (rr < 0 || rr >= 8 || cc < 0 || cc >= 8) return false;
          if (grid[rr][cc]) return false;
        }
      }
    }
    return true;
  };

  const checkClearWorklet = (
    row: number,
    col: number,
    shape: number[][],
    grid: number[][]
  ) => {
    'worklet';
    let clearRows = 0;
    let clearCols = 0;

    const rowCounts = [0, 0, 0, 0, 0, 0, 0, 0];
    const colCounts = [0, 0, 0, 0, 0, 0, 0, 0];

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (grid[r][c]) {
          rowCounts[r]++;
          colCounts[c]++;
        }
      }
    }

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          rowCounts[row + r]++;
          colCounts[col + c]++;
        }
      }
    }

    for (let i = 0; i < 8; i++) {
      if (rowCounts[i] === 8) clearRows |= (1 << i);
      if (colCounts[i] === 8) clearCols |= (1 << i);
    }
    return clearCols | (clearRows << 8);
  };

  const cancelDrag = () => {
    dropInFlightRef.current = false;
    resetSnap();
    sharedClearMask.value = 0;
    ghostValid.value = 0;
    ghostRow.value = -999;
    dragActive.value = 0;
    dragging.value = 0;
    setDragOverlay(null);
  };

  const finishDrop = (pageX: number, pageY: number) => {
    if (dropInFlightRef.current) return;

    const layout = boardLayoutRef.current;
    if (!layout) {
      cancelDrag();
      return;
    }

    const origin = ghostValid.value ? { row: ghostRow.value, col: ghostCol.value } : null;

    if (!origin) {
      cancelDrag();
      playThemeSound(currentTheme, 'dragEnd', DRAG.MISS_VOLUME);
      return;
    }

    dropInFlightRef.current = true;
    ghostValid.value = 0;
    ghostRow.value = -999;
    sharedClearMask.value = 0;

    const { pageX: snapX, pageY: snapY } = computeDropSnapPage(
      layout,
      origin,
      block,
      cellVisual,
      LIFT_RATIO,
    );

    dragPageX.value = snapX;
    dragPageY.value = snapY;

    // Async placement: store immediately returns true if valid, but defers calculation
    const placed = placeBlock(block, origin, () => {
      // Hide UI-thread overlay after board is already updated
      dragActive.value = 0;
      dragging.value = 0;
      dropInFlightRef.current = false;
    });
    resetSnap();

    if (!placed) {
      dropInFlightRef.current = false;
      cancelDrag();
      playThemeSound(currentTheme, 'dragEnd', DRAG.MISS_VOLUME);
      confirmGameOverIfDeadlocked();
      return;
    }
  };

  const beginDrag = (pageX: number, pageY: number) => {
    dropInFlightRef.current = false;
    resetSnap();
    sharedClearMask.value = 0;
    
    // Fallback: we still set drag overlay to show the exact piece under the finger
    setDragOverlay({ block, pageX, pageY });
  };

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .hitSlop({
      top: DRAG.TRAY_HIT_SLOP_TOP,
      bottom: DRAG.TRAY_HIT_SLOP,
      left: DRAG.TRAY_HIT_SLOP,
      right: DRAG.TRAY_HIT_SLOP,
    })
    .onBegin((e) => {
      'worklet';
      dropHandled.value = 0;
      dragging.value = 1;
      tx.value = 0;
      ty.value = 0;
      sharedClearMask.value = 0;
      const x = e.absoluteX;
      const y = e.absoluteY;
      if (x > 0) {
        dragPageX.value = x;
        dragPageY.value = y;
        dragActive.value = 1;
        lastSnapRow.value = -999;
        lastSnapCol.value = -999;
        ghostValid.value = 0;
        ghostRow.value = -999;
        ghostCol.value = -999;
        
        // Pass color to UI thread to draw ghost
        // Since we can't call getThemePaintColor in worklet, we just use block.color
        // (Wait, block.color is the base color, not the theme paint color, but that's handled by BoardGhostLayer or GhostPreview)
        ghostColor.value = block.color;
        dragIndex.value = index;
        
        runOnJS(beginDrag)(x, y);
      }
    })
    .onUpdate((e) => {
      'worklet';
      tx.value = e.translationX;
      ty.value = e.translationY;
      const x = e.absoluteX > 0 ? e.absoluteX : dragPageX.value;
      const y = e.absoluteY > 0 ? e.absoluteY : dragPageY.value;
      dragPageX.value = x;
      dragPageY.value = y;

      if (!hasLayout.value) return;

      const cs = layoutCell.value;
      const anchorY = y - cs * LIFT_RATIO;
      const innerX = layoutX.value + BOARD_BORDER_PAD;
      const innerY = layoutY.value + BOARD_BORDER_PAD;
      const innerW = layoutW.value - BOARD_BORDER_PAD * 2;
      const innerH = layoutH.value - BOARD_BORDER_PAD * 2;
      const localX = x - innerX;
      const localY = anchorY - innerY;

      if (
        localX < -cs ||
        localY < -cs ||
        localX > innerW + cs ||
        localY > innerH + cs
      ) {
        if (lastSnapRow.value !== -999) {
          lastSnapRow.value = -999;
          lastSnapCol.value = -999;
          ghostValid.value = 0;
          ghostRow.value = -999;
          sharedClearMask.value = 0;
        }
        return;
      }

      const col = Math.round(localX / cs - cols / 2);
      const row = Math.round(localY / cs - rows / 2);
      if (row === lastSnapRow.value && col === lastSnapCol.value) return;
      lastSnapRow.value = row;
      lastSnapCol.value = col;
      
      // Pure UI-thread Ghost Collision!
      const isValid = checkCollisionWorklet(row, col, block.shape as unknown as number[][], sharedGrid.value);
      ghostRow.value = row;
      ghostCol.value = col;
      ghostValid.value = isValid ? 1 : 0;
      
      if (isValid) {
        sharedClearMask.value = checkClearWorklet(row, col, block.shape as unknown as number[][], sharedGrid.value);
      } else {
        sharedClearMask.value = 0;
      }
    })
    .onEnd((e) => {
      'worklet';
      dropHandled.value = 1;
      let px = e.absoluteX > 0 ? e.absoluteX : dragPageX.value;
      let py = e.absoluteY > 0 ? e.absoluteY : dragPageY.value;
      tx.value = 0;
      ty.value = 0;

      // INSTANT SNAP ON UI THREAD (Zero Latency)
      if (ghostValid.value === 1 && hasLayout.value === 1) {
        const shape = block.shape as unknown as number[][];
        const rows = shape.length;
        const cols = shape[0].length;
        const width = cols * cellVisual;
        const height = rows * cellVisual;
        const innerX = layoutX.value + BOARD_BORDER_PAD;
        const innerY = layoutY.value + BOARD_BORDER_PAD;
        
        px = innerX + ghostCol.value * layoutCell.value + width / 2;
        py = innerY + ghostRow.value * layoutCell.value + height / 2 + cellVisual * LIFT_RATIO;
      }
      
      dragPageX.value = px;
      dragPageY.value = py;

      runOnJS(finishDrop)(px, py);
    })
    .onFinalize(() => {
      'worklet';
      if (dropHandled.value) {
        dropHandled.value = 0;
        return;
      }
      dragActive.value = 0;
      dragging.value = 0;
      tx.value = withSpring(0);
      ty.value = withSpring(0);
      runOnJS(cancelDrag)();
    });

  const pieceStyle = useAnimatedStyle(() => ({
    opacity: dragging.value ? 0 : 1,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          styles.hitTarget,
          { width: traySlotSize, height: traySlotSize },
        ]}
      >
        <Animated.View style={[styles.piece, pieceStyle]}>
          {block.shape.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((cell, ci) =>
                cell ? (
                  <View
                    key={ci}
                    style={{ width: trayCellSize, height: trayCellSize }}
                  >
                    <BlockCell
                      size={trayCellSize}
                      color={paint}
                      borderRadius={trayRadius}
                      skinSource={theme.source}
                      skinMode={skinMode}
                    />
                  </View>
                ) : (
                  <View
                    key={ci}
                    style={{ width: trayCellSize, height: trayCellSize }}
                  />
                ),
              )}
            </View>
          ))}
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  hitTarget: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  piece: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
