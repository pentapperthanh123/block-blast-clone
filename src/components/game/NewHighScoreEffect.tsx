/**
 * NewHighScoreEffect - Celebration effect when breaking high score record
 */

import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { formatScore } from '../../utils/formatScore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface NewHighScoreEffectProps {
  visible: boolean;
  newScore: number;
  onComplete?: () => void;
}

export const NewHighScoreEffect = React.memo<NewHighScoreEffectProps>(({
  visible,
  newScore,
  onComplete,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const crownY = useSharedValue(-100);
  const crownRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const particlesOpacity = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      scale.value = 0;
      opacity.value = 0;
      crownY.value = -100;
      crownRotate.value = 0;
      glowOpacity.value = 0;
      particlesOpacity.value = 0;
      return;
    }

    // Crown drops down with bounce
    crownY.value = withSequence(
      withSpring(0, {
        damping: 8,
        stiffness: 100,
      }),
      withDelay(
        500,
        withRepeat(
          withSequence(
            withTiming(-20, { duration: 400, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
          ),
          2, // Bounce 2 times
          false
        )
      )
    );

    // Crown rotates
    crownRotate.value = withDelay(
      200,
      withSpring(360, { damping: 12 })
    );

    // Text scale pop
    scale.value = withSequence(
      withSpring(1.3, { damping: 8 }),
      withSpring(1, { damping: 15 })
    );

    // Fade in
    opacity.value = withTiming(1, { duration: 300 });

    // Glow pulse
    glowOpacity.value = withDelay(
      300,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        999999, // Infinite
        true
      )
    );

    // Particles burst
    particlesOpacity.value = withSequence(
      withDelay(100, withTiming(1, { duration: 200 })),
      withDelay(1500, withTiming(0, { duration: 500 }))
    );

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 500 });
      if (onComplete) {
        setTimeout(() => {
          runOnJS(onComplete)();
        }, 500);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible, scale, opacity, crownY, crownRotate, glowOpacity, particlesOpacity, onComplete]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const crownStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: crownY.value },
      { rotate: `${crownRotate.value}deg` },
    ],
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const particlesStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      {/* Background glow */}
      <Animated.View style={[styles.glow, glowStyle]} />

      {/* Particles */}
      <Animated.View style={[styles.particles, particlesStyle]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <Particle key={i} index={i} />
        ))}
      </Animated.View>

      {/* Crown icon */}
      <Animated.View style={[styles.crownContainer, crownStyle]}>
        <Animated.Text style={styles.crown}>👑</Animated.Text>
      </Animated.View>

      {/* Text */}
      <Animated.View style={textStyle}>
        <Animated.Text style={styles.title}>NEW RECORD!</Animated.Text>
        <Animated.Text style={styles.score}>{formatScore(newScore)}</Animated.Text>
      </Animated.View>
    </Animated.View>
  );
});

// Individual particle component
const Particle = React.memo<{ index: number }>(({ index }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const angle = (index / 20) * Math.PI * 2;
    const distance = 100 + Math.random() * 100;
    const targetX = Math.cos(angle) * distance;
    const targetY = Math.sin(angle) * distance;
    const delay = Math.random() * 200;

    scale.value = withDelay(
      delay,
      withSequence(
        withSpring(1, { damping: 8 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      )
    );

    opacity.value = withDelay(
      delay,
      withSequence(
        withTiming(1, { duration: 200 }),
        withDelay(800, withTiming(0, { duration: 400 }))
      )
    );

    translateX.value = withDelay(
      delay,
      withSpring(targetX, {
        damping: 10,
        stiffness: 50,
      })
    );

    translateY.value = withDelay(
      delay,
      withSpring(targetY, {
        damping: 10,
        stiffness: 50,
      })
    );
  }, [index, translateX, translateY, scale, opacity]);

  const particleStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];
  const color = colors[index % colors.length];

  return (
    <Animated.View style={[styles.particle, particleStyle, { backgroundColor: color }]} />
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  glow: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  particles: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  crownContainer: {
    marginBottom: 20,
  },
  crown: {
    fontSize: 80,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
    marginBottom: 12,
  },
  score: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 215, 0, 0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
});
