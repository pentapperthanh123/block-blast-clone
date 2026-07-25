/**
 * NewRoundTransition — visual recap card only.
 * Phase machine (recap → falling → idle) lives in gameStore timers
 * so leaving Classic mid-transition cannot strand the game.
 */

import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { UI_COLORS } from '../../constants';
import { formatScore } from '../../utils/formatScore';

export const NewRoundTransition: React.FC = () => {
  const phase = useGameStore((s) => s.newRoundPhase);
  const lastGameOver = useGameStore((s) => s.lastGameOver);

  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.92);
  const cardOpacity = useSharedValue(0);

  useEffect(() => {
    if (phase === 'recap' && lastGameOver) {
      overlayOpacity.value = 0;
      cardScale.value = 0.92;
      cardOpacity.value = 0;
      overlayOpacity.value = withTiming(1, { duration: 220 });
      cardOpacity.value = withTiming(1, { duration: 260 });
      cardScale.value = withTiming(1, {
        duration: 320,
        easing: Easing.out(Easing.back(1.2)),
      });
      return;
    }

    if (phase === 'falling') {
      overlayOpacity.value = withTiming(0, { duration: 280 });
      cardOpacity.value = withTiming(0, { duration: 220 });
    }
  }, [phase, lastGameOver, overlayOpacity, cardScale, cardOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  if (phase === 'idle' || !lastGameOver) return null;

  const shouldBlockPointers = phase === 'recap';

  return (
    <Animated.View
      pointerEvents={shouldBlockPointers ? 'auto' : 'none'}
      style={[
        styles.overlay,
        overlayStyle,
        phase === 'falling' && styles.overlayPassthrough,
      ]}
    >
      {phase === 'recap' && (
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.kicker}>Last Round</Text>
          <Text style={styles.score}>{formatScore(lastGameOver.score)}</Text>
          <Text style={styles.meta}>
            Best {formatScore(lastGameOver.highScore)}
            {lastGameOver.isNewHighScore ? ' · New record!' : ''}
          </Text>
          <Text style={styles.hint}>Get ready...</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 15, 45, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  overlayPassthrough: {
    backgroundColor: 'transparent',
  },
  card: {
    width: '82%',
    maxWidth: 320,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 22,
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 68, 0.96)',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  kicker: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  score: {
    color: UI_COLORS.TEXT_SCORE,
    fontSize: 48,
    fontWeight: '900',
  },
  meta: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
  },
  hint: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 14,
  },
});
