/**
 * DraggableBlock — tray piece size === board cell size (no scale jump)
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BlockShape } from '../../types';
import { useGameStore } from '../../store/gameStore';
import {
  BoardLayout,
  getBlockOccupiedCells,
  pointerToCell,
} from './GameBoard';
import { CELL_PAD, getBoardMetrics } from '../../utils/boardMetrics';
import { BlockCell } from './BlockCell';

interface DraggableBlockProps {
  block: BlockShape;
  boardLayout: BoardLayout | null;
  disabled?: boolean;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  boardLayout,
  disabled,
}) => {
  const { cellSize, cellVisualSize, traySlotSize, trayCellSize, trayCellVisualSize } = getBoardMetrics();
  const placeBlock = useGameStore((s) => s.placeBlock);
  const canPlace = useGameStore((s) => s.canPlace);
  const setGhost = useGameStore((s) => s.setGhost);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const scale = useSharedValue(1);
  const z = useSharedValue(1);
  const slotOpacity = useSharedValue(1);

  const rows = block.shape.length;
  const cols = block.shape[0].length;
  const trayRadius = Math.max(3, trayCellSize * 0.12);
  const boardRadius = Math.max(4, cellSize * 0.12);

  const updateGhost = (pageX: number, pageY: number) => {
    if (!boardLayout) {
      setGhost(null);
      return;
    }
    const origin = pointerToCell(pageX, pageY, boardLayout, rows, cols);
    if (!origin) {
      setGhost(null);
      return;
    }
    const positions = getBlockOccupiedCells(
      block.shape as unknown as number[][],
      origin
    );
    const valid = canPlace(block, origin);
    setGhost({ positions, valid, color: block.color });
  };

  const clearGhost = () => setGhost(null);

  const tryDrop = (pageX: number, pageY: number) => {
    if (!boardLayout) {
      clearGhost();
      return;
    }
    const origin = pointerToCell(pageX, pageY, boardLayout, rows, cols);
    clearGhost();
    if (!origin) return;
    placeBlock(block, origin);
  };

  const gesture = Gesture.Pan()
    .enabled(!disabled)
    .onBegin(() => {
      // Scale up từ tray size lên board size
      const scaleRatio = cellSize / trayCellSize;
      scale.value = withSpring(scaleRatio, { damping: 15, stiffness: 300 });
      z.value = 100;
      slotOpacity.value = withSpring(0.35);
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY - cellSize * 1.2;
      runOnJS(updateGhost)(e.absoluteX, e.absoluteY - cellSize * 1.2);
    })
    .onEnd((e) => {
      runOnJS(tryDrop)(e.absoluteX, e.absoluteY - cellSize * 1.2);
      tx.value = withSpring(0);
      ty.value = withSpring(0);
      scale.value = withSpring(1);
      z.value = 1;
      slotOpacity.value = withSpring(1);
    })
    .onFinalize(() => {
      runOnJS(clearGhost)();
      tx.value = withSpring(0);
      ty.value = withSpring(0);
      scale.value = withSpring(1);
      z.value = 1;
      slotOpacity.value = withSpring(1);
    });

  const pieceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value }, 
      { translateY: ty.value },
      { scale: scale.value }
    ],
    zIndex: z.value,
    elevation: z.value,
  }));

  const slotStyle = useAnimatedStyle(() => ({
    opacity: slotOpacity.value,
  }));

  return (
    <View style={[styles.slot, { width: traySlotSize, height: traySlotSize }]}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.piece, pieceStyle]}>
          {block.shape.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((cell, ci) =>
                cell ? (
                  <View key={ci} style={{ margin: CELL_PAD }}>
                    <BlockCell
                      size={trayCellVisualSize}
                      color={block.color}
                      borderRadius={trayRadius}
                    />
                  </View>
                ) : (
                  <View
                    key={ci}
                    style={{
                      width: trayCellVisualSize,
                      height: trayCellVisualSize,
                      margin: CELL_PAD,
                      backgroundColor: 'transparent',
                    }}
                  />
                )
              )}
            </View>
          ))}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    margin: CELL_PAD,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
});
