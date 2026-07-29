import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withDelay,
  withSpring,
  Easing,
  withRepeat,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { formatScore } from '../../utils/formatScore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Mascot = ({ isLeft, delay = 0 }: { isLeft: boolean; delay?: number }) => {
  const scale = useSharedValue(0);
  const translateY = useSharedValue(0); // Stay in center vertically
  const rotate = useSharedValue(isLeft ? -45 : 45);

  useEffect(() => {
    // Pop out in the center
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 10, stiffness: 120 })
    );

    // Dance loop
    rotate.value = withDelay(
      delay + 500,
      withRepeat(
        withSequence(
          withTiming(isLeft ? 15 : -15, { duration: 400, easing: Easing.inOut(Easing.quad) }),
          withTiming(isLeft ? -15 : 15, { duration: 400, easing: Easing.inOut(Easing.quad) })
        ),
        999999,
        true
      )
    );

    // Exit (fly off screen)
    translateY.value = withDelay(
      delay + 2500,
      withTiming(SCREEN_HEIGHT, { duration: 500, easing: Easing.in(Easing.cubic) })
    );
  }, [delay, isLeft, rotate, scale, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[
      styles.mascot, 
      animStyle, 
      isLeft ? { left: 50 } : { right: 50 }
    ]}>
      <Animated.Text style={styles.mascotFace}>
        {isLeft ? '🥳' : '🤩'}
      </Animated.Text>
    </Animated.View>
  );
};

export const PerfectClearCelebration = React.memo(() => {
  const isAnimatingPerfectClear = useGameStore((s) => s.isAnimatingPerfectClear);
  const breakdown = useGameStore((s) => s.lastScoreBreakdown);
  const combo = useGameStore((s) => s.combo);
  
  // Text animation
  const textScale = useSharedValue(0);
  const infoOpacity = useSharedValue(0);
  const infoTranslateY = useSharedValue(20);
  
  useEffect(() => {
    if (isAnimatingPerfectClear) {
      textScale.value = 0;
      infoOpacity.value = 0;
      infoTranslateY.value = 20;

      textScale.value = withDelay(
        200,
        withSpring(1, { damping: 10, stiffness: 150 })
      );

      infoOpacity.value = withDelay(
        600,
        withTiming(1, { duration: 400 })
      );
      infoTranslateY.value = withDelay(
        600,
        withSpring(0, { damping: 12, stiffness: 100 })
      );
    }
  }, [isAnimatingPerfectClear, textScale, infoOpacity, infoTranslateY]);

  const textStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -120 }, // Move up slightly to make room for combo/score
      { scale: textScale.value }
    ]
  }));

  const infoStyle = useAnimatedStyle(() => ({
    opacity: infoOpacity.value,
    transform: [
      { translateY: infoTranslateY.value - 60 }
    ]
  }));

  if (!isAnimatingPerfectClear) return null;

  const showCombo = combo >= 1 || (breakdown && breakdown.linesCleared >= 2);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Dim overlay */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'rgba(0,0,0,0.6)' }, // Darker for more focus
        ]}
      />

      {/* Mascots */}
      <Mascot isLeft={true} delay={100} />
      <Mascot isLeft={false} delay={250} />

      {/* Celebration Text */}
      <Animated.Text style={[styles.text, { color: '#FFD700' }, textStyle]}>
        PERFECT CLEAR!
      </Animated.Text>

      {/* Combo and Score Info */}
      {breakdown && (
        <Animated.View style={[styles.infoContainer, infoStyle]}>
          {showCombo && (
            <Text style={styles.comboText}>
              Combo {Math.max(combo, breakdown.linesCleared)}
            </Text>
          )}
          <Text style={styles.scoreText}>
            +{formatScore(breakdown.points)}
          </Text>
        </Animated.View>
      )}
    </View>
  );
});
PerfectClearCelebration.displayName = 'PerfectClearCelebration';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    position: 'absolute',
    top: '50%',
    marginTop: -40, // Half of height 80
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  mascotFace: {
    fontSize: 40,
  },
  text: {
    fontSize: 42,
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  infoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  comboText: {
    fontSize: 24,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scoreText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#4ADE80', // Green for score bonus
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
});
