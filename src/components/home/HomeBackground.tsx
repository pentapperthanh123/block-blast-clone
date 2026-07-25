/**
 * Soft layered atmosphere + floating themed candy blocks.
 * density: rich (Home/Loading) | subtle (Gameplay — less distraction)
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  DimensionValue,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { resolveTheme } from '../../constants/themes';
import { useGameStore } from '../../store/gameStore';

const RICH_FLOATERS = [
  { size: 28, left: '8%', top: '18%', delay: 0, amp: 10 },
  { size: 20, left: '78%', top: '22%', delay: 400, amp: 8 },
  { size: 24, left: '14%', top: '58%', delay: 800, amp: 12 },
  { size: 18, left: '82%', top: '62%', delay: 200, amp: 9 },
  { size: 22, left: '48%', top: '12%', delay: 600, amp: 7 },
] as const;

const SUBTLE_FLOATERS = [
  { size: 18, left: '6%', top: '14%', delay: 0, amp: 6 },
  { size: 14, left: '88%', top: '20%', delay: 500, amp: 5 },
  { size: 16, left: '90%', top: '72%', delay: 300, amp: 6 },
] as const;

type FloaterSpec = {
  size: number;
  left: DimensionValue;
  top: DimensionValue;
  delay: number;
  amp: number;
};

const Floater: React.FC<
  FloaterSpec & {
    reduceMotion: boolean;
    opacity: number;
    skinUri: string;
    tint: string;
  }
> = ({
  size,
  left,
  top,
  delay,
  amp,
  reduceMotion,
  opacity,
  skinUri,
  tint,
}) => {
  const ty = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    ty.value = withRepeat(
      withTiming(amp, {
        duration: 2200 + delay,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );
  }, [amp, delay, reduceMotion, ty]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
  }));

  const radius = size * 0.28;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.floater,
        {
          width: size,
          height: size,
          borderRadius: radius,
          left,
          top,
          backgroundColor: tint,
          opacity,
        },
        style,
      ]}
    >
      <Image
        source={{ uri: skinUri }}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="cover"
      />
    </Animated.View>
  );
};

export type CandyBackgroundProps = {
  density?: 'rich' | 'subtle';
};

export const CandyBackground: React.FC<CandyBackgroundProps> = ({
  density = 'rich',
}) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const currentTheme = useGameStore((s) => s.currentTheme);
  const lastGameOver = useGameStore((s) => s.lastGameOver);
  const newRoundPhase = useGameStore((s) => s.newRoundPhase);
  // Keep old-theme floaters during recap/fall when entering a new round
  const skinThemeId =
    newRoundPhase !== 'idle' && lastGameOver?.theme
      ? lastGameOver.theme
      : currentTheme;
  const theme = resolveTheme(skinThemeId);
  const palette = theme.palette;
  const floaters = useMemo(
    () => (density === 'subtle' ? SUBTLE_FLOATERS : RICH_FLOATERS),
    [density],
  );
  const floaterOpacity = density === 'subtle' ? 0.22 : 0.4;
  const tintColors = theme.clearFx.colors;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.deep, { backgroundColor: palette.backgroundDeep }]} />
      <View
        style={[
          styles.glowTop,
          { backgroundColor: palette.background },
          density === 'subtle' && styles.glowSoft,
        ]}
      />
      <View
        style={[
          styles.glowMid,
          { backgroundColor: palette.glowMid },
          density === 'subtle' && styles.glowSoft,
        ]}
      />
      <View
        style={[
          styles.glowBottom,
          { backgroundColor: palette.glowBottom },
          density === 'subtle' && styles.glowSoft,
        ]}
      />
      {floaters.map((f, i) => (
        <Floater
          key={i}
          {...f}
          reduceMotion={reduceMotion}
          opacity={floaterOpacity}
          skinUri={theme.source}
          tint={tintColors[i % tintColors.length]}
        />
      ))}
    </View>
  );
};

/** @deprecated Prefer CandyBackground — kept for Home import compatibility */
export const HomeBackground: React.FC = () => (
  <CandyBackground density="rich" />
);

const styles = StyleSheet.create({
  deep: {
    ...StyleSheet.absoluteFillObject,
  },
  glowTop: {
    position: 'absolute',
    top: -80,
    left: -40,
    width: 280,
    height: 280,
    borderRadius: 140,
    opacity: 0.95,
  },
  glowMid: {
    position: 'absolute',
    top: '32%',
    right: -100,
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.45,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -60,
    left: '15%',
    width: 320,
    height: 220,
    borderRadius: 160,
    opacity: 0.7,
  },
  glowSoft: {
    opacity: 0.55,
  },
  floater: {
    position: 'absolute',
    overflow: 'hidden',
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.55)',
    borderLeftColor: 'rgba(255,255,255,0.4)',
    borderBottomColor: 'rgba(0,0,0,0.25)',
    borderRightColor: 'rgba(0,0,0,0.18)',
  },
});
