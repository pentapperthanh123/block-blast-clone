/**
 * LoadingSpinner - Animated block pieces for loading screen
 * 3 colorful blocks bouncing in wave pattern
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

interface LoadingSpinnerProps {
  size?: number;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 60 }) => {
  const blockSize = size * 0.28;
  const gap = size * 0.08;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <BouncingBlock delay={0} size={blockSize} gap={gap} index={0} />
      <BouncingBlock delay={150} size={blockSize} gap={gap} index={1} />
      <BouncingBlock delay={300} size={blockSize} gap={gap} index={2} />
    </View>
  );
};

interface BouncingBlockProps {
  delay: number;
  size: number;
  gap: number;
  index: number;
}

const BouncingBlock: React.FC<BouncingBlockProps> = ({ delay, size, gap, index }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Bounce animation
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-size * 1.2, {
            duration: 450,
            easing: Easing.out(Easing.quad),
          }),
          withTiming(0, {
            duration: 450,
            easing: Easing.in(Easing.quad),
          })
        ), 999999,
        false
      )
    );

    // Scale pulse
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.1, {
            duration: 450,
            easing: Easing.out(Easing.cubic),
          }),
          withTiming(1, {
            duration: 450,
            easing: Easing.in(Easing.cubic),
          })
        ), 999999,
        false
      )
    );

    // Subtle rotation
    rotate.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 450 }),
          withTiming(-8, { duration: 450 })
        ), 999999,
        true
      )
    );
  }, [delay, size, translateY, scale, rotate]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const colors = [
    { primary: '#FF6B9D', secondary: '#FF8FB3' }, // Pink
    { primary: '#4DD3E8', secondary: '#7DE0F0' }, // Cyan
    { primary: '#C084FC', secondary: '#D8B4FE' }, // Purple
  ];

  const color = colors[index % colors.length];
  const left = index * (size + gap);

  return (
    <Animated.View
      style={[
        styles.block,
        {
          width: size,
          height: size,
          left,
        },
        animStyle,
      ]}
    >
      <BlockSVG size={size} color={color} />
    </Animated.View>
  );
};

interface BlockSVGProps {
  size: number;
  color: { primary: string; secondary: string };
}

const BlockSVG: React.FC<BlockSVGProps> = ({ size, color }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`grad-${color.primary}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={color.secondary} />
          <Stop offset="100%" stopColor={color.primary} />
        </LinearGradient>
      </Defs>
      {/* Main block */}
      <Rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="8"
        fill={`url(#grad-${color.primary})`}
      />
      {/* Highlight */}
      <Rect
        x="4"
        y="4"
        width="92"
        height="38"
        rx="8"
        fill="#FFFFFF"
        opacity="0.35"
      />
      {/* Inner shadow */}
      <Rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="8"
        fill="none"
        stroke="#000000"
        strokeWidth="3"
        opacity="0.15"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  block: {
    position: 'absolute',
    bottom: 0,
  },
});
