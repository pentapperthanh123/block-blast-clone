/**
 * FeedbackOverlay — Good / Perfect / +points / combo on clear
 * Appear in place (no float-from-below). Web-safe RN Animated fade.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, Easing } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { ANIMATION, FEEDBACK_TIER_LABEL, type FeedbackTier } from '../../constants';
import { formatScore } from '../../utils/formatScore';

const TIER_COLOR: Record<FeedbackTier, string> = {
  Good: '#6BCF7F',
  Perfect: '#38BDF8',
  Awesome: '#FACC15',
  Unbelievable: '#FF6B6B',
};

export const FeedbackOverlay: React.FC = () => {
  const visible = useGameStore((s) => s.feedbackVisible);
  const nonce = useGameStore((s) => s.feedbackNonce);
  const breakdown = useGameStore((s) => s.lastScoreBreakdown);
  const combo = useGameStore((s) => s.combo);
  const savedMoment = useGameStore((s) => s.savedMoment);
  const [show, setShow] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const savedFade = useRef(new Animated.Value(0)).current;
  const savedScale = useRef(new Animated.Value(0.8)).current;

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    if (!visible || !breakdown || nonce <= 0) {
      setShow(false);
      return;
    }

    setShow(true);
    fade.setValue(0);
    scale.setValue(0.92);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 140,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.back(1.1)),
        useNativeDriver: false,
      }),
    ]).start();

    const fadeOut = setTimeout(() => {
      Animated.timing(fade, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, ANIMATION.SCORE_POPUP - 260);

    const hide = setTimeout(() => setShow(false), ANIMATION.SCORE_POPUP);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [visible, breakdown, nonce, fade, scale]);

  useEffect(() => {
    if (!savedMoment) return;
    setShowSaved(true);
    savedFade.setValue(0);
    savedScale.setValue(0.7);

    Animated.parallel([
      Animated.timing(savedFade, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(savedScale, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: false,
      }),
    ]).start();

    const fadeOut = setTimeout(() => {
      Animated.timing(savedFade, {
        toValue: 0,
        duration: 300,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }).start();
    }, 1400);

    const hide = setTimeout(() => setShowSaved(false), 1700);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [savedMoment, savedFade, savedScale]);

  // Saved! only (no clear feedback at same time)
  if (showSaved && !show) {
    return (
      <Animated.View
        pointerEvents="none"
        style={[styles.root, { opacity: savedFade, transform: [{ scale: savedScale }] }]}
      >
        <View style={[styles.card, styles.savedCard]}>
          <Text style={styles.savedEmoji}>🛡️</Text>
          <Text style={styles.savedText}>Saved!</Text>
        </View>
      </Animated.View>
    );
  }

  if (!show || !breakdown) return null;

  const tier = breakdown.feedbackTier;
  const color = TIER_COLOR[tier];
  const label = FEEDBACK_TIER_LABEL[tier] ?? `${tier}!`;
  const showCombo = combo >= 1 || breakdown.linesCleared >= 2;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        {
          opacity: fade,
          transform: [{ scale }],
        },
      ]}
      testID="feedback-overlay"
      accessibilityLabel={`feedback-${tier}`}
    >
      <View style={styles.card}>
        {showSaved && (
          <Text style={styles.savedBadge}>🛡️ Saved!</Text>
        )}
        {showCombo && (
          <Text style={styles.combo} testID="feedback-combo">
            Combo {Math.max(combo, breakdown.linesCleared)}
          </Text>
        )}
        <Text style={[styles.tier, { color }]} testID="feedback-tier">
          {label}
        </Text>
        <Text style={styles.points} testID="feedback-points">
          +{formatScore(breakdown.points)}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    elevation: 999,
  },
  card: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 15, 40, 0.78)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  combo: {
    fontSize: 18,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  tier: {
    fontSize: 48,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  points: {
    marginTop: 4,
    fontSize: 28,
    fontWeight: '900',
    color: '#FACC15',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  savedCard: {
    backgroundColor: 'rgba(16, 42, 26, 0.88)',
    borderColor: '#4ADE80',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
    paddingVertical: 20,
  },
  savedEmoji: {
    fontSize: 38,
  },
  savedText: {
    fontSize: 44,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#4ADE80',
    letterSpacing: 1,
  },
  savedBadge: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4ADE80',
    marginBottom: 4,
  },
});
