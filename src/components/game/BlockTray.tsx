/**
 * BlockTray — 3 fixed slots with candy cradles; empty slots stay put
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { DraggableBlock } from './DraggableBlock';
import type { BoardLayout } from './GameBoard';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { ANIMATION } from '../../constants';

interface BlockTrayProps {
  boardLayout: BoardLayout | null;
}

export const BlockTray = React.memo<BlockTrayProps>(({ boardLayout }) => {
  const currentPieces = useGameStore((s) => s.currentPieces);
  const isAnimatingClear = useGameStore((s) => s.isAnimatingClear);
  const newRoundPhase = useGameStore((s) => s.newRoundPhase);
  const { traySlotSize } = getBoardMetrics();
  const fall = useSharedValue(0);
  const prevPhase = useRef(newRoundPhase);

  useEffect(() => {
    if (newRoundPhase === 'falling' || newRoundPhase === 'revealing') {
      fall.value = withTiming(1, {
        duration: 520,
        easing: Easing.in(Easing.cubic),
      });
    } else if (
      (prevPhase.current === 'falling' || prevPhase.current === 'revealing') &&
      newRoundPhase === 'idle'
    ) {
      // Fix Reanimated race condition: do not synchronously set to 1 before withTiming
      fall.value = withTiming(0, {
        duration: ANIMATION.NEW_ROUND_REVEAL_FADE_MS,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // Force reset to 0 to prevent getting stuck
      fall.value = withTiming(0, { duration: 50 });
    }
    prevPhase.current = newRoundPhase;
  }, [newRoundPhase, fall]);

  const trayStyle = useAnimatedStyle(() => ({
    opacity: 1 - fall.value,
    transform: [
      { translateY: fall.value * 48 },
      { scale: 1 - fall.value * 0.08 },
    ],
  }));

  const feedbackVisible = useGameStore((s) => s.feedbackVisible);
  const showHighScoreCelebration = useGameStore((s) => s.showHighScoreCelebration);
  const isAnimatingPerfectClear = useGameStore((s) => s.isAnimatingPerfectClear);

  const slots = [0, 1, 2].map((index) => currentPieces[index] ?? null);
  const inputLocked =
    isAnimatingClear ||
    feedbackVisible ||
    showHighScoreCelebration ||
    isAnimatingPerfectClear ||
    newRoundPhase === 'recap' ||
    newRoundPhase === 'falling' ||
    newRoundPhase === 'revealing';

  return (
    <Animated.View style={[styles.tray, { minHeight: traySlotSize + 16 }, trayStyle]}>
      {slots.map((block, index) => (
        <View
          key={`tray-slot-${index}`}
          style={[
            styles.slotCradle,
            { width: traySlotSize + 8, height: traySlotSize + 8 },
          ]}
        >
          {block ? (
            <DraggableBlock
              key={`draggable-${index}-${block.id}`}
              block={block}
              index={index}
              boardLayout={boardLayout}
              disabled={inputLocked}
            />
          ) : (
            <View style={styles.emptySlot} />
          )}
        </View>
      ))}
    </Animated.View>
  );
});
BlockTray.displayName = 'BlockTray';

const styles = StyleSheet.create({
  tray: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 8,
    zIndex: 20,
    position: 'relative',
    overflow: 'visible',
  },
  slotCradle: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  emptySlot: {
    width: '70%',
    height: '70%',
    borderRadius: 12,
  },
});
