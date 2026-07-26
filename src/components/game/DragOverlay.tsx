/**
 * DragOverlay — free-floating “thực thể” under the finger.
 * Position updates via Reanimated shared values (UI thread) — no per-frame React.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { dragActive, dragPageX, dragPageY, ghostValid, ghostRow, ghostCol, dragIndex } from '../../utils/dragShared';
import { DRAG } from '../../constants';
import { BOARD_BORDER_PAD, type BoardLayout } from './GameBoard';
import { getBoardPieceSize, ScaledBlockPiece } from './ScaledBlockPiece';
import { sharedClearMask } from '../../utils/sharedGrid';

import type { BlockShape } from '../../types';

const LIFT_RATIO = DRAG.LIFT_RATIO;
const INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

interface DragOverlayProps {
  originX: number;
  originY: number;
  boardLayout: BoardLayout | null;
}

const DragOverlayPiece = React.memo(({
  block,
  index,
  originX,
  originY,
  boardLayout,
  cellVisual,
}: {
  block: BlockShape;
  index: number;
  originX: number;
  originY: number;
  boardLayout: BoardLayout | null;
  cellVisual: number;
}) => {
  const pieceSize = useMemo(
    () => getBoardPieceSize(block, cellVisual),
    [block, cellVisual],
  );

  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  // Trigger scale bounce when this piece starts dragging
  useAnimatedReaction(
    () => dragIndex.value === index && dragActive.value === 1,
    (isActive, wasActive) => {
      if (isActive && !wasActive) {
        lift.value = 0;
        scale.value = 0.92;
        lift.value = withSequence(
          withTiming(-10, { duration: 70, easing: Easing.out(Easing.quad) }),
          withSpring(0, { damping: 12, stiffness: 240 }),
        );
        scale.value = withSequence(
          withTiming(1.08, { duration: 80, easing: Easing.out(Easing.quad) }),
          withSpring(1, { damping: 12, stiffness: 200 }),
        );
      } else if (!isActive && wasActive) {
        scale.value = 1;
        lift.value = 0;
      }
    }
  );

  const animStyle = useAnimatedStyle(() => {
    const isActive = dragIndex.value === index && dragActive.value === 1;
    const tx = dragPageX.value - originX - pieceSize.width / 2;
    const ty = dragPageY.value - cellVisual * LIFT_RATIO - originY - pieceSize.height / 2;
    
    return {
      opacity: isActive ? 1 : 0,
      transform: [
        { translateX: tx },
        { translateY: ty + lift.value },
        { scale: scale.value },
      ],
      pointerEvents: 'none',
    };
  }, [originX, originY, cellVisual, pieceSize.width, pieceSize.height]);

  const ghostAnimStyle = useAnimatedStyle(() => {
    const isActive = dragIndex.value === index && dragActive.value === 1;
    const valid = ghostValid.value;
    if (!isActive || !valid || !boardLayout) return { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }] };
    
    const tx = boardLayout.x + BOARD_BORDER_PAD + ghostCol.value * boardLayout.cellSize - originX;
    const ty = boardLayout.y + BOARD_BORDER_PAD + ghostRow.value * boardLayout.cellSize - originY;
    
    return {
      opacity: 1,
      transform: [{ translateX: tx }, { translateY: ty }],
    };
  }, [boardLayout, originX, originY]);

  return (
    <>
      {/* Ghost Preview */}
      <Animated.View
        style={[
          styles.piece,
          { width: pieceSize.width, height: pieceSize.height },
          ghostAnimStyle,
        ]}
      >
        <ScaledBlockPiece block={block} cellSize={cellVisual} />
      </Animated.View>

      {/* Dragging Piece */}
      <Animated.View
        style={[
          styles.piece,
          { width: pieceSize.width, height: pieceSize.height },
          animStyle,
        ]}
      >
        <ScaledBlockPiece block={block} cellSize={cellVisual} elevated />
      </Animated.View>
    </>
  );
});

export const DragOverlay = React.memo<DragOverlayProps>(({
  originX,
  originY,
  boardLayout,
}) => {
  const currentPieces = useGameStore((s) => s.currentPieces);
  const { cellVisual } = getBoardMetrics();

  return (
    <View style={styles.root} pointerEvents="none">
      {/* Clear Glow Lines */}
      {boardLayout && INDICES.map(i => (
        <GlowLine key={`row-${i}`} index={i} isRow={true} boardLayout={boardLayout} originX={originX} originY={originY} />
      ))}
      {boardLayout && INDICES.map(i => (
        <GlowLine key={`col-${i}`} index={i} isRow={false} boardLayout={boardLayout} originX={originX} originY={originY} />
      ))}

      {/* Pre-render all active pieces for zero-latency drag start */}
      {currentPieces.map((block, index) => 
        block ? (
          <DragOverlayPiece 
            key={`${block.id}-${index}`}
            block={block}
            index={index}
            originX={originX}
            originY={originY}
            boardLayout={boardLayout}
            cellVisual={cellVisual}
          />
        ) : null
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    elevation: 9999,
  },
  piece: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  glowLine: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  glowInner: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 105, 180, 0.2)',
    borderWidth: 2,
    borderColor: '#FF69B4',
    borderRadius: 8,
  }
});

const GlowLine = React.memo(({ index, isRow, boardLayout, originX, originY }: { index: number, isRow: boolean, boardLayout: BoardLayout, originX: number, originY: number }) => {
  const animStyle = useAnimatedStyle(() => {
    const valid = ghostValid.value;
    if (!valid || !dragActive.value) return { opacity: withTiming(0, { duration: 100 }) };
    const mask = sharedClearMask.value;
    const bit = isRow ? (1 << (index + 8)) : (1 << index);
    if ((mask & bit) !== 0) {
      return { opacity: withTiming(0.9, { duration: 100 }) };
    }
    return { opacity: withTiming(0, { duration: 100 }) };
  }, []);

  const innerX = boardLayout.x + BOARD_BORDER_PAD - originX;
  const innerY = boardLayout.y + BOARD_BORDER_PAD - originY;
  const innerW = boardLayout.width - BOARD_BORDER_PAD * 2;
  const innerH = boardLayout.height - BOARD_BORDER_PAD * 2;

  const style = isRow ? {
    left: innerX,
    top: innerY + index * boardLayout.cellSize,
    width: innerW,
    height: boardLayout.cellSize,
  } : {
    left: innerX + index * boardLayout.cellSize,
    top: innerY,
    width: boardLayout.cellSize,
    height: innerH,
  };

  return (
    <Animated.View style={[styles.glowLine, style, animStyle]}>
       <View style={styles.glowInner} />
    </Animated.View>
  );
});
