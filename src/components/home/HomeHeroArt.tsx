/**
 * View-based candy block mascot + mini board preview for Home center.
 */

import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BLOCK_COLORS } from '../../constants';

const CELL = 26;
const GAP = 4;

const BOARD: (string | null)[][] = [
  [null, BLOCK_COLORS.CYAN, BLOCK_COLORS.CYAN, null],
  [BLOCK_COLORS.ORANGE, BLOCK_COLORS.YELLOW, BLOCK_COLORS.GREEN, BLOCK_COLORS.RED],
  [BLOCK_COLORS.ORANGE, BLOCK_COLORS.YELLOW, BLOCK_COLORS.GREEN, null],
  [null, BLOCK_COLORS.BLUE, BLOCK_COLORS.BLUE, BLOCK_COLORS.BLUE],
];

const CandyCell: React.FC<{ color: string; delay: number; reduceMotion: boolean }> = ({
  color,
  delay,
  reduceMotion,
}) => {
  const scale = useSharedValue(reduceMotion ? 1 : 0.6);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delay, withTiming(1, { duration: 280 }));
    scale.value = withDelay(
      delay,
      withSequence(
        withTiming(1.08, { duration: 220, easing: Easing.out(Easing.back(1.2)) }),
        withTiming(1, { duration: 160 }),
      ),
    );
  }, [delay, opacity, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          backgroundColor: color,
          width: CELL,
          height: CELL,
          borderRadius: CELL * 0.28,
        },
        style,
      ]}
    />
  );
};

export const HomeHeroArt: React.FC = () => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const bob = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      bob.value = 0;
      return;
    }
    bob.value = withRepeat(
      withTiming(-10, {
        duration: 1800,
        easing: Easing.inOut(Easing.sin),
      }), 999999,
      true,
    );
  }, [bob, reduceMotion]);

  const wrapStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bob.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, wrapStyle]}>
      <View style={styles.halo} />
      <View style={styles.board}>
        {BOARD.map((row, ri) => (
          <View key={ri} style={styles.row}>
            {row.map((color, ci) =>
              color ? (
                <CandyCell
                  key={`${ri}-${ci}`}
                  color={color}
                  delay={120 + (ri * 4 + ci) * 45}
                  reduceMotion={reduceMotion}
                />
              ) : (
                <View
                  key={`${ri}-${ci}`}
                  style={{ width: CELL, height: CELL }}
                />
              ),
            )}
          </View>
        ))}
      </View>

      {/* Simple face on the yellow center pair */}
      <View pointerEvents="none" style={styles.face}>
        <View style={styles.eye} />
        <View style={styles.eye} />
      </View>
      <View pointerEvents="none" style={styles.smile} />
    </Animated.View>
  );
};

const BOARD_W = CELL * 4 + GAP * 3;

const styles = StyleSheet.create({
  wrap: {
    width: BOARD_W + 48,
    height: BOARD_W + 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: BOARD_W + 40,
    height: BOARD_W + 40,
    borderRadius: (BOARD_W + 40) / 2,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  board: {
    gap: GAP,
    padding: 12,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 68, 0.35)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
  },
  cell: {
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.55)',
    borderLeftColor: 'rgba(255,255,255,0.4)',
    borderBottomColor: 'rgba(0,0,0,0.28)',
    borderRightColor: 'rgba(0,0,0,0.2)',
  },
  face: {
    position: 'absolute',
    top: '42%',
    left: '38%',
    width: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eye: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0F172A',
  },
  smile: {
    position: 'absolute',
    top: '52%',
    left: '42%',
    width: 22,
    height: 10,
    borderBottomWidth: 3,
    borderColor: '#0F172A',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
});
