/**
 * LoadingScreen — splash before Home
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useAppStore } from '../store/appStore';
import { ANIMATION, HOME_TITLE, UI_COLORS } from '../constants';

export const LoadingScreen: React.FC = () => {
  const finishLoading = useAppStore((s) => s.finishLoading);
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    ).start();

    Animated.timing(progress, {
      toValue: 1,
      duration: ANIMATION.LOADING_MS,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start(({ finished }) => {
      if (finished) finishLoading();
    });
  }, [finishLoading, progress, pulse]);

  const barWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['8%', '100%'],
  });

  return (
    <View style={styles.root}>
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Text style={styles.title}>{HOME_TITLE.LINE1}</Text>
        <Text style={styles.subtitle}>{HOME_TITLE.LINE2}</Text>
      </Animated.View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>
      <Text style={styles.hint}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: UI_COLORS.TEXT_SCORE,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    letterSpacing: 3,
    opacity: 0.9,
  },
  barTrack: {
    marginTop: 48,
    width: '78%',
    height: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: UI_COLORS.TEXT_SCORE,
  },
  hint: {
    marginTop: 14,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
});
