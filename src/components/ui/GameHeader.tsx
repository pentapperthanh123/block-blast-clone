/**
 * GameHeader — crown/best, big score with counter animation, settings
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { useAppStore } from '../../store/appStore';
import { UI_COLORS } from '../../constants';
import { formatScore } from '../../utils/formatScore';
import { SettingsModal } from './SettingsModal';

const COUNTER_MS = 650;

export const GameHeader = React.memo(() => {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const goHome = useAppStore((s) => s.goHome);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [displayScore, setDisplayScore] = useState(score);
  const displayRef = useRef(score);
  const rafRef = useRef<number | null>(null);
  const scale = useSharedValue(1);

  useEffect(() => {
    const from = displayRef.current;
    const to = score;
    if (from === to) return;

    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Instant reset (new round / restore) — no long count-down
    if (to < from || to - from > 5000) {
      displayRef.current = to;
      setDisplayScore(to);
      scale.value = withSequence(
        withTiming(1.08, { duration: 90 }),
        withSpring(1, { damping: 12 }),
      );
      return;
    }

    const start = performance.now();
    const delta = to - from;

    scale.value = withSequence(
      withTiming(1.18, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 180 }),
    );

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNTER_MS);
      // easeOut cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + delta * eased);
      displayRef.current = value;
      setDisplayScore(value);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        displayRef.current = to;
        setDisplayScore(to);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [score, scale]);

  const scoreAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <>
      <View style={styles.root}>
        <View style={styles.topRow}>
          <Pressable
            style={styles.homeBtn}
            onPress={goHome}
            accessibilityRole="button"
            accessibilityLabel="Home"
          >
            <Text style={styles.homeBtnText}>🏠</Text>
          </Pressable>
          <View style={styles.best}>
            <Text style={styles.crown}>👑</Text>
            <Text style={styles.bestScore}>{formatScore(highScore)}</Text>
          </View>
          <Pressable
            style={styles.settings}
            onPress={() => setSettingsVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Settings"
          >
            <Text style={styles.settingsIcon}>⚙</Text>
          </Pressable>
        </View>
        <Animated.Text
          style={[styles.score, scoreAnimStyle]}
          testID="score-counter"
          accessibilityLabel={`score-${displayScore}`}
        >
          {formatScore(displayScore)}
        </Animated.Text>
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </>
  );
});

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  best: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 68, 0.45)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  crown: { fontSize: 16 },
  bestScore: {
    color: UI_COLORS.TEXT_SCORE,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  homeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 68, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  homeBtnText: {
    fontSize: 20,
  },
  settings: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 23, 68, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  settingsIcon: {
    fontSize: 20,
    color: '#D1E2FF',
  },
  score: {
    marginTop: 8,
    fontSize: 54,
    fontWeight: '900',
    color: UI_COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
});
