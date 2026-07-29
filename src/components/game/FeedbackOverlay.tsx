/**
 * FeedbackOverlay — Good / Perfect / +points / combo on clear
 * Appear in place (no float-from-below). Web-safe RN Animated fade.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Animated, Easing, StyleProp, TextStyle } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { ANIMATION, FEEDBACK_TIER_LABEL, type FeedbackTier } from '../../constants';
import { formatScore } from '../../utils/formatScore';
import { THEMES } from '../../constants/themes';
import { THEME_BLOCK_IMAGES, isThemeImageSource, themeImageKey } from '../../constants/themeImages';

const TIER_COLOR: Record<FeedbackTier, string> = {
  Good: '#4ADE80',
  Perfect: '#38BDF8',
  Awesome: '#FACC15',
  Unbelievable: '#FF4D4D',
};

const TIER_GLOW: Record<FeedbackTier, string> = {
  Good: '#15803D',
  Perfect: '#0284C7',
  Awesome: '#CA8A04',
  Unbelievable: '#B91C1C',
};

interface StrokeTextProps {
  style?: StyleProp<TextStyle>;
  text: string;
  strokeColor: string;
  strokeWidth?: number;
  testID?: string;
}

const StrokeText = ({ style, text, strokeColor, strokeWidth = 2, testID }: StrokeTextProps) => {
  const strokeStyles = [
    { textShadowOffset: { width: strokeWidth, height: strokeWidth } },
    { textShadowOffset: { width: -strokeWidth, height: strokeWidth } },
    { textShadowOffset: { width: strokeWidth, height: -strokeWidth } },
    { textShadowOffset: { width: -strokeWidth, height: -strokeWidth } },
    { textShadowOffset: { width: 0, height: strokeWidth } },
    { textShadowOffset: { width: 0, height: -strokeWidth } },
    { textShadowOffset: { width: strokeWidth, height: 0 } },
    { textShadowOffset: { width: -strokeWidth, height: 0 } },
  ];
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {strokeStyles.map((shadow, i) => (
        <Text
          key={i}
          style={[
            style,
            {
              position: 'absolute',
              color: strokeColor,
              textShadowColor: strokeColor,
              textShadowRadius: 1,
            },
            shadow,
          ]}
        >
          {text}
        </Text>
      ))}
      <Text style={style} testID={testID}>
        {text}
      </Text>
    </View>
  );
};

export const FeedbackOverlay = React.memo(() => {
  const visible = useGameStore((s) => s.feedbackVisible);
  const nonce = useGameStore((s) => s.feedbackNonce);
  const breakdown = useGameStore((s) => s.lastScoreBreakdown);
  const combo = useGameStore((s) => s.combo);
  const currentTheme = useGameStore((s) => s.currentTheme);
  const [show, setShow] = useState(false);

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.6)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (!visible || !breakdown) {
      setShow(false);
      return;
    }

    setShow(true);
    fade.setValue(0);
    scale.setValue(0.5);
    translateY.setValue(25);

    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: false,
      }),
      Animated.timing(translateY, {
        toValue: -15,
        duration: 450,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: false,
      }),
    ]).start();

    const popupDuration = ANIMATION.SCORE_POPUP;
    const fadeOutDuration = 350;
    const fadeOutStart = Math.max(200, popupDuration - fadeOutDuration);

    const fadeOut = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 0,
          duration: fadeOutDuration,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(translateY, {
          toValue: -45,
          duration: fadeOutDuration,
          easing: Easing.in(Easing.quad),
          useNativeDriver: false,
        }),
      ]).start();
    }, fadeOutStart);

    const hide = setTimeout(() => setShow(false), popupDuration);
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(hide);
    };
  }, [visible, breakdown, nonce, fade, scale, translateY]);

  if (!show || !breakdown) return null;

  const tier = breakdown.feedbackTier;
  const color = TIER_COLOR[tier];
  const glow = TIER_GLOW[tier];
  const label = FEEDBACK_TIER_LABEL[tier] ?? `${tier}!`;
  const showCombo = combo >= 1 || breakdown.linesCleared >= 2;

  // Render theme-specific icon popping in from left and right sides
  const themeConfig = THEMES[currentTheme];
  let imageSource = null;
  if (themeConfig) {
    if (isThemeImageSource(themeConfig.source)) {
      const key = themeImageKey(themeConfig.source);
      if (key && THEME_BLOCK_IMAGES[key]) {
        imageSource = THEME_BLOCK_IMAGES[key];
      }
    } else {
      imageSource = { uri: themeConfig.source };
    }
  }

  const leftTranslateX = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, -110], // slide in from further left
  });
  const rightTranslateX = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [180, 110], // slide in from further right
  });
  const iconScale = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });
  const leftRotate = fade.interpolate({
    inputRange: [0, 1],
    outputRange: ['-75deg', '-15deg'],
  });
  const rightRotate = fade.interpolate({
    inputRange: [0, 1],
    outputRange: ['75deg', '15deg'],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.root,
        {
          opacity: fade,
          transform: [{ scale }, { translateY }],
        },
      ]}
      testID="feedback-overlay"
      accessibilityLabel={`feedback-${tier}`}
    >
      {/* Left Character */}
      {imageSource && (
        <Animated.Image
          source={imageSource}
          style={{
            position: 'absolute',
            width: 90,
            height: 90,
            transform: [
              { translateX: leftTranslateX },
              { scale: iconScale },
              { rotate: leftRotate }
            ],
            zIndex: 1,
          }}
          resizeMode="contain"
        />
      )}

      {/* Right Character */}
      {imageSource && (
        <Animated.Image
          source={imageSource}
          style={{
            position: 'absolute',
            width: 90,
            height: 90,
            transform: [
              { translateX: rightTranslateX },
              { scale: iconScale },
              { rotate: rightRotate }
            ],
            zIndex: 1,
          }}
          resizeMode="contain"
        />
      )}

      <View style={[styles.card, { zIndex: 2 }]}>
        
        {showCombo && (
          <View style={styles.comboPill}>
            <Text style={styles.combo} testID="feedback-combo">
              ⚡ COMBO {Math.max(combo, breakdown.linesCleared)}
            </Text>
          </View>
        )}
        
        <View style={styles.tierWrap}>
          <StrokeText 
            text={label} 
            style={[styles.tier, { color, textShadowColor: glow }]} 
            strokeColor="#000000" 
            strokeWidth={3} 
            testID="feedback-tier" 
          />
        </View>

        <View style={styles.pointsWrap}>
          <StrokeText 
            text={`+${formatScore(breakdown.points)}`} 
            style={styles.points} 
            strokeColor="#000000" 
            strokeWidth={2} 
            testID="feedback-points" 
          />
        </View>
      </View>
    </Animated.View>
  );
});

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
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 24,
    backgroundColor: 'rgba(11, 15, 25, 0.82)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  comboPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  combo: {
    fontSize: 16,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#0F172A',
    letterSpacing: 0.8,
    fontFamily: 'Fredoka',
  },
  tierWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tier: {
    fontSize: 54,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 1.5,
    fontFamily: 'Fredoka',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 16,
  },
  pointsWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  points: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFD700',
    fontFamily: 'Fredoka',
    textShadowColor: 'rgba(0, 0, 0, 0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
});

FeedbackOverlay.displayName = 'FeedbackOverlay';
