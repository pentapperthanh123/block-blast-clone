/**
 * DangerOverlay — outer border flash on the grid only (no inner grid lines).
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';

const LEVEL_COLOR = ['transparent', '#FACC15', '#F97316', '#EF4444'] as const;
const BORDER = 3;

function hexToRgba(hex: string, alpha: number): string {
  'worklet';
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface DangerOverlayProps {
  gridRadius?: number;
}

export const DangerOverlay: React.FC<DangerOverlayProps> = ({ gridRadius = 6 }) => {
  const dangerState = useGameStore((s) => s.dangerState);
  const warningEnabled = useGameStore((s) => s.gameplaySettings.dangerWarningEnabled);
  const level = dangerState?.dangerLevel ?? 0;
  const color = LEVEL_COLOR[level] ?? 'transparent';

  const intensity = useSharedValue(0);

  useEffect(() => {
    cancelAnimation(intensity);

    if (!warningEnabled || level === 0) {
      intensity.value = withTiming(0, { duration: 200 });
      return;
    }

    if (level === 1) {
      intensity.value = withTiming(0.9, { duration: 250 });
      return;
    }

    if (level === 2) {
      intensity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 550 }),
          withTiming(0.35, { duration: 550 }),
        ),
        -1,
        true,
      );
      return;
    }

    intensity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 260 }),
        withTiming(0.3, { duration: 260 }),
      ),
      -1,
      true,
    );
  }, [intensity, level, warningEnabled]);

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: hexToRgba(color, intensity.value),
  }));

  if (!warningEnabled || level === 0) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ring,
        {
          borderRadius: gridRadius,
          top: BORDER / 2,
          left: BORDER / 2,
          right: BORDER / 2,
          bottom: BORDER / 2,
        },
        ringStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    borderWidth: BORDER,
    backgroundColor: 'transparent',
    zIndex: 25,
    elevation: 25,
  },
});
