/**
 * GameOverModal — end round + replay / home with animated score counter
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { useAppStore } from '../../store/appStore';
import { UI_COLORS } from '../../constants';
import { formatScore } from '../../utils/formatScore';
import { playGlobalSound, GAME_OVER_SOUND, stopWarningSound } from '../../constants/themeSounds';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GameOverModal: React.FC = () => {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const beginNewRound = useGameStore((s) => s.beginNewRound);
  const goHome = useAppStore((s) => s.goHome);
  const isNewHighScore = score === highScore && score > 0;

  // Counter animation state
  const [displayScore, setDisplayScore] = useState(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  // Play game over sound when modal appears; ensure warning loop is off
  useEffect(() => {
    void stopWarningSound();
    playGlobalSound(GAME_OVER_SOUND, 0.7);
  }, []);

  // Animate counter from 0 to score
  useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSpring(1, { damping: 12 });

    // Counter animation
    const duration = Math.min(1500, 500 + score * 0.5); // Max 1.5s, scales with score
    const steps = Math.min(60, Math.ceil(score / 50)); // Smooth steps
    const interval = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += Math.ceil(score / steps);
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(current);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [score, opacity, scale]);

  const modalStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.overlay}>
      <Animated.View style={[styles.modal, modalStyle]}>
        <Text style={styles.title}>Game Over!</Text>

        {isNewHighScore && (
          <Text style={styles.newHighScore}>New High Score!</Text>
        )}

        <View style={styles.scoreContainer}>
          <Text style={styles.label}>Your Score</Text>
          <Text style={styles.score}>{formatScore(displayScore)}</Text>
          <Text style={[styles.label, styles.bestLabel]}>Best Score</Text>
          <Text style={styles.bestScore}>{formatScore(highScore)}</Text>
        </View>

        <Pressable style={styles.button} onPress={beginNewRound}>
          <Text style={styles.buttonText}>Play Again</Text>
        </Pressable>
        <Pressable
          style={[styles.button, styles.secondary]}
          onPress={goHome}
        >
          <Text style={[styles.buttonText, styles.secondaryText]}>Home</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 45, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 40,
    elevation: 40,
  },
  modal: {
    width: Math.min(SCREEN_WIDTH * 0.88, 380),
    backgroundColor: 'rgba(15, 23, 68, 0.96)',
    borderRadius: 26,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: UI_COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  newHighScore: {
    fontSize: 18,
    color: UI_COLORS.TEXT_SCORE,
    marginTop: 6,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bestLabel: {
    marginTop: 14,
  },
  score: {
    fontSize: 50,
    fontWeight: '900',
    color: UI_COLORS.TEXT_SCORE,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bestScore: {
    fontSize: 28,
    fontWeight: '900',
    color: UI_COLORS.TEXT_PRIMARY,
    marginTop: 2,
  },
  button: {
    backgroundColor: UI_COLORS.CLASSIC,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 18,
    marginTop: 14,
    width: '100%',
    alignItems: 'center',
    minHeight: 52,
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderLeftColor: 'rgba(255,255,255,0.38)',
    borderBottomColor: 'rgba(0,0,0,0.28)',
    borderRightColor: 'rgba(0,0,0,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secondaryText: {
    color: UI_COLORS.TEXT_PRIMARY,
    textShadowColor: 'transparent',
  },
});
