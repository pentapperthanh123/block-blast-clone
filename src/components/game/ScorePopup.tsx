/**
 * ScorePopup — big combo + Good/Perfect/Awesome feedback over the board
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { FeedbackTier } from '../../constants';
import { formatScore } from '../../utils/formatScore';

interface ScorePopupProps {
  points: number;
  feedbackTier: FeedbackTier;
  comboMultiplier: number;
  linesCleared: number;
  active: boolean;
}

const TIER_COLOR: Record<FeedbackTier, string> = {
  Good: '#6BCF7F',
  Perfect: '#38BDF8',
  Awesome: '#FACC15',
  Unbelievable: '#FF6B6B',
};

export const ScorePopup: React.FC<ScorePopupProps> = ({
  points,
  feedbackTier,
  linesCleared,
  active,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const scale = useSharedValue(0.55);
  const comboScale = useSharedValue(0.35);

  useEffect(() => {
    if (!active) {
      opacity.value = withTiming(0, { duration: 180 });
      return;
    }

    opacity.value = 0;
    translateY.value = 48; // ~ start lower (~20% of popup travel)
    scale.value = 0.55;
    comboScale.value = 0.35;

    opacity.value = withSequence(
      withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) }),
      withDelay(750, withTiming(0, { duration: 320 })),
    );
    comboScale.value = withSequence(
      withSpring(1.25, { damping: 8, stiffness: 160 }),
      withDelay(180, withSpring(1.05, { damping: 12 })),
    );
    scale.value = withDelay(
      80,
      withSequence(
        withSpring(1.12, { damping: 10 }),
        withDelay(120, withSpring(1, { damping: 14 })),
      ),
    );
    translateY.value = withTiming(-36, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [active, feedbackTier, points, opacity, translateY, scale, comboScale]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const comboStyle = useAnimatedStyle(() => ({
    transform: [{ scale: comboScale.value }],
  }));

  if (!active || points <= 0) return null;

  const feedbackColor = TIER_COLOR[feedbackTier];
  const showCombo = linesCleared >= 2;

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      {showCombo && (
        <Animated.View style={[styles.comboContainer, comboStyle]}>
          <Animated.Text style={styles.comboLabel}>Combo</Animated.Text>
          <Animated.Text style={styles.comboNumber}>{linesCleared}</Animated.Text>
        </Animated.View>
      )}

      <Animated.Text style={[styles.feedbackText, { color: feedbackColor }]}>
        {feedbackTier}!
      </Animated.Text>

      <Animated.Text style={styles.points}>
        +{formatScore(points)}
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  comboContainer: {
    alignItems: 'center',
    marginBottom: 4,
  },
  comboLabel: {
    fontSize: 20,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: -1, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  comboNumber: {
    fontSize: 64,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#FFD700',
    textShadowColor: '#000',
    textShadowOffset: { width: -2, height: 5 },
    textShadowRadius: 10,
    letterSpacing: -2,
    lineHeight: 70,
  },
  feedbackText: {
    fontSize: 40,
    fontWeight: '900',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0,0,0,0.65)',
    textShadowOffset: { width: -1, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  points: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFE4A0',
    marginTop: 6,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});
