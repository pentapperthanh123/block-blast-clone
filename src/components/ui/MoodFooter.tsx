/**
 * MoodFooter — flavor text only after clearing line(s)
 */

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { MOOD_TEXTS, UI_COLORS } from '../../constants';

export const MoodFooter: React.FC = () => {
  const moodVisible = useGameStore((s) => s.moodVisible);
  const lastMoodIndex = useGameStore((s) => s.lastMoodIndex);
  const opacity = useRef(new Animated.Value(0)).current;
  const text = MOOD_TEXTS[Math.max(0, lastMoodIndex - 1) % MOOD_TEXTS.length];

  useEffect(() => {
    if (!moodVisible) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
      return;
    }

    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [moodVisible, lastMoodIndex, opacity]);

  if (!moodVisible) {
    return <Animated.View style={styles.placeholder} />;
  }

  return (
    <Animated.Text style={[styles.text, { opacity }]}>{text}</Animated.Text>
  );
};

const styles = StyleSheet.create({
  placeholder: {
    marginTop: 8,
    minHeight: 36,
  },
  text: {
    marginTop: 8,
    minHeight: 36,
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    color: UI_COLORS.TEXT_SCORE,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});
