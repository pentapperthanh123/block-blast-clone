/**
 * GameLogo — animated block-blast mark for splash / loading
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
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BLOCK_COLORS } from '../../constants';

const LOGO_BLOCKS: { row: number; col: number; color: string; delay: number }[] = [
  { row: 0, col: 1, color: BLOCK_COLORS.RED, delay: 80 },
  { row: 0, col: 2, color: BLOCK_COLORS.ORANGE, delay: 140 },
  { row: 1, col: 0, color: BLOCK_COLORS.YELLOW, delay: 200 },
  { row: 1, col: 1, color: BLOCK_COLORS.GREEN, delay: 260 },
  { row: 1, col: 2, color: BLOCK_COLORS.CYAN, delay: 320 },
  { row: 2, col: 1, color: BLOCK_COLORS.BLUE, delay: 380 },
  { row: 2, col: 2, color: BLOCK_COLORS.RED, delay: 440 },
];

const SPARKLES = [
  { top: '8%', left: '12%', delay: 500 },
  { top: '18%', right: '8%', delay: 620 },
  { bottom: '14%', left: '6%', delay: 740 },
  { bottom: '10%', right: '14%', delay: 860 },
] as const;

interface GameLogoProps {
  size?: number;
}

const LogoBlock: React.FC<{
  color: string;
  cell: number;
  gap: number;
  row: number;
  col: number;
  delay: number;
  reduceMotion: boolean;
}> = ({ color, cell, gap, row, col, delay, reduceMotion }) => {
  const scale = useSharedValue(reduceMotion ? 1 : 0);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);
  const rotate = useSharedValue(reduceMotion ? 0 : -18);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delay, withTiming(1, { duration: 180 }));
    rotate.value = withDelay(
      delay,
      withSpring(0, { damping: 12, stiffness: 180 }),
    );
    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1.14, { damping: 8, stiffness: 220 }),
        withSpring(1, { damping: 14, stiffness: 200 }),
      ),
    );
  }, [delay, opacity, reduceMotion, rotate, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: col * (cell + gap) },
      { translateY: row * (cell + gap) },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width: cell,
          height: cell,
          borderRadius: cell * 0.24,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

export const GameLogo: React.FC<GameLogoProps> = ({ size = 196 }) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const shellScale = useSharedValue(0.72);
  const shellOpacity = useSharedValue(0);
  const glow = useSharedValue(0.55);
  const ringRotate = useSharedValue(0);

  const cell = size * 0.19;
  const gap = size * 0.045;
  const gridW = cell * 3 + gap * 2;
  const pad = size * 0.16;

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
      shellScale.value = 1;
      shellOpacity.value = 1;
      glow.value = 0.75;
      return;
    }

    shellOpacity.value = withTiming(1, { duration: 320 });
    shellScale.value = withSpring(1, { damping: 11, stiffness: 120 });
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.55, { duration: 900, easing: Easing.inOut(Easing.sin) }),
      ), 999999,
      true,
    );
    ringRotate.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }), 999999,
      false,
    );
  }, [glow, reduceMotion, ringRotate, shellOpacity, shellScale]);

  const shellStyle = useAnimatedStyle(() => ({
    opacity: shellOpacity.value,
    transform: [{ scale: shellScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value}deg` }],
  }));

  return (
    <Animated.View
      style={[styles.root, { width: size, height: size }, shellStyle]}
      accessibilityRole="image"
      accessibilityLabel="Block Blast logo"
    >
      <Animated.View style={[styles.glow, { width: size, height: size }, glowStyle]} />

      <Animated.View style={[styles.orbitRing, { width: size - 8, height: size - 8 }, ringStyle]}>
        <View style={styles.orbitDotTop} />
        <View style={styles.orbitDotRight} />
        <View style={styles.orbitDotBottom} />
        <View style={styles.orbitDotLeft} />
      </Animated.View>

      <View
        style={[
          styles.badge,
          {
            width: gridW + pad * 2,
            height: gridW + pad * 2,
            borderRadius: (gridW + pad * 2) * 0.22,
          },
        ]}
      >
        <View style={[styles.grid, { width: gridW, height: gridW }]}>
          {LOGO_BLOCKS.map((block, index) => (
            <LogoBlock
              key={`${block.row}-${block.col}-${index}`}
              color={block.color}
              cell={cell}
              gap={gap}
              row={block.row}
              col={block.col}
              delay={block.delay}
              reduceMotion={reduceMotion}
            />
          ))}
        </View>
      </View>

      {SPARKLES.map((spark, index) => (
        <Sparkle key={index} {...spark} reduceMotion={reduceMotion} />
      ))}
    </Animated.View>
  );
};

const Sparkle: React.FC<{
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  delay: number;
  reduceMotion: boolean;
}> = ({ top, left, right, bottom, delay, reduceMotion }) => {
  const opacity = useSharedValue(reduceMotion ? 0.85 : 0);
  const scale = useSharedValue(reduceMotion ? 1 : 0.4);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.25, { duration: 500 }),
        ), 999999,
        true,
      ),
    );
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(0.7, { duration: 500 }),
        ), 999999,
        true,
      ),
    );
  }, [delay, opacity, reduceMotion, scale]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.sparkle, { top, left, right, bottom } as object, style]}
    />
  );
};

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(250, 204, 21, 0.22)',
  },
  orbitRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.14)',
    borderStyle: 'dashed',
  },
  orbitDotTop: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FACC15',
  },
  orbitDotRight: {
    position: 'absolute',
    right: -4,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4DD3E8',
  },
  orbitDotBottom: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B9D',
  },
  orbitDotLeft: {
    position: 'absolute',
    left: -4,
    top: '50%',
    marginTop: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6BCF7F',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10, 18, 52, 0.72)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 12,
  },
  grid: {
    position: 'relative',
  },
  block: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.62)',
    borderLeftColor: 'rgba(255,255,255,0.45)',
    borderBottomColor: 'rgba(0,0,0,0.28)',
    borderRightColor: 'rgba(0,0,0,0.22)',
  },
  sparkle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
  },
});
