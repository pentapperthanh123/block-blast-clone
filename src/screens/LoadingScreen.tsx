/**
 * LoadingScreen — branded splash with animated GameLogo
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import {
  ANIMATION,
  HOME_TITLE,
  TITLE_LETTER_COLORS,
  UI_COLORS,
} from '../constants';
import { CandyBackground } from '../components/home';
import { GameLogo } from '../components/ui/GameLogo';
import { THEMES } from '../constants/themes';
import { playGlobalSound, GAME_START_SOUND } from '../constants/themeSounds';

export const LoadingScreen: React.FC = () => {
  const finishLoading = useAppStore((s) => s.finishLoading);
  const currentTheme = useGameStore((s) => s.currentTheme);
  const palette = THEMES[currentTheme]?.palette ?? THEMES.ocean.palette;
  const progress = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(18);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    useGameStore.getState().cycleRandomTheme();
  }, []);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!reduceMotion) {
      titleOpacity.value = withDelay(420, withTiming(1, { duration: 500 }));
      titleY.value = withDelay(
        420,
        withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }),
      );
    } else {
      titleOpacity.value = 1;
      titleY.value = 0;
    }

    progress.value = withTiming(
      1,
      {
        duration: ANIMATION.LOADING_MS,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(playGlobalSound)(GAME_START_SOUND, 0.6);
          runOnJS(finishLoading)();
        }
      },
    );
  }, [finishLoading, progress, reduceMotion, titleOpacity, titleY]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${8 + progress.value * 92}%`,
  }));

  return (
    <View style={[styles.root, { backgroundColor: palette.backgroundDeep }]}>
      <CandyBackground density="rich" />

      <View style={styles.logoWrap}>
        <GameLogo size={210} />
      </View>

      <Animated.View style={[styles.brand, titleStyle]}>
        <View style={styles.titleRow}>
          {HOME_TITLE.LINE1.split('').map((ch, i) => (
            <Text
              key={`${ch}-${i}`}
              style={[
                styles.titleChar,
                { color: TITLE_LETTER_COLORS[i % TITLE_LETTER_COLORS.length] },
              ]}
            >
              {ch === ' ' ? ' ' : ch}
            </Text>
          ))}
        </View>
        <Text style={styles.subtitle}>{HOME_TITLE.LINE2}</Text>
      </Animated.View>

      <View style={styles.footer}>
        <View style={styles.barTrack}>
          <Animated.View style={[styles.barFill, barStyle]} />
        </View>
        <Text style={styles.hint}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingTop: 72,
    paddingBottom: 48,
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  brand: {
    alignItems: 'center',
    zIndex: 2,
    marginBottom: 28,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  titleChar: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '900',
    color: '#E0EAFF',
    textAlign: 'center',
    letterSpacing: 3.4,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 2,
  },
  barTrack: {
    width: '78%',
    height: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 68, 0.45)',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  barFill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: UI_COLORS.TEXT_SCORE,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.45)',
  },
  hint: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
