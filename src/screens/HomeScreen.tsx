/**
 * HomeScreen — candy-style hub (Adventure / Classic / More Games)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import { HOME_TITLE, TITLE_LETTER_COLORS, UI_COLORS } from '../constants';
import { THEMES } from '../constants/themes';
import { HomeBackground, HomeHeroArt } from '../components/home';
import { SettingsModal } from '../components/ui/SettingsModal';
import { formatScore } from '../utils/formatScore';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';

const TITLE_COLORS = TITLE_LETTER_COLORS;

function showStub(label: string) {
  const message = `${label} ${i18n.t('home.coming_soon')}`;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(message);
    return;
  }
  Alert.alert(label, message);
}

export const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const startClassic = useAppStore((s) => s.startClassic);
  const dailyStreak = useAppStore((s) => s.dailyStreak);
  const highScore = useGameStore((s) => s.highScore);
  const beginClassicSession = useGameStore((s) => s.beginClassicSession);
  const currentTheme = useGameStore((s) => s.currentTheme);
  const palette = THEMES[currentTheme]?.palette ?? THEMES.ocean.palette;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => sub.remove();
  }, []);

  const hasActiveSession = useGameStore((s) => s.activeSession !== null);

  const onClassic = () => {
    beginClassicSession();
    startClassic();
  };

  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <HomeBackground />

      <View style={styles.topBar}>
        <View style={styles.profileChip}>
          <Text style={styles.chipLabel}>{t('common.high_score')}</Text>
          <Text style={styles.chipValue}>{formatScore(highScore)}</Text>
        </View>
        <Pressable
          style={styles.settingsBtn}
          onPress={() => setSettingsVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={t('common.settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </Pressable>
      </View>

      <View style={styles.brand}>
        <View style={styles.titleRow}>
          {HOME_TITLE.LINE1.split('').map((ch, i) => (
            <TitleChar
              key={`${ch}-${i}`}
              char={ch}
              color={TITLE_COLORS[i % TITLE_COLORS.length]}
              delay={i * 35}
              reduceMotion={reduceMotion}
            />
          ))}
        </View>
        <Text style={styles.subtitle}>{HOME_TITLE.LINE2}</Text>
      </View>

      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>{t('home.daily_streak')}</Text>
        <View style={styles.streakRow}>
          <View style={styles.winBadge}>
            <Text style={styles.winBadgeText}>{t('home.win')}</Text>
          </View>
          <Text style={styles.streakValue}>× {dailyStreak}</Text>
          <View style={styles.checkCircle}>
            <Text style={styles.check}>✓</Text>
          </View>
        </View>
      </View>

      <View style={styles.heroSlot}>
        <HomeHeroArt />
      </View>

      <View style={styles.menu}>
        <MenuButton
          label={t('home.adventure')}
          color={UI_COLORS.ADVENTURE}
          icon="📍"
          onPress={() => showStub('Adventure')}
        />
        <MenuButton
          label={hasActiveSession ? t('home.resume') : t('home.classic')}
          color={UI_COLORS.CLASSIC}
          icon={hasActiveSession ? '▶' : '∞'}
          onPress={onClassic}
          emphasize
          reduceMotion={reduceMotion}
        />
        <MenuButton
          label={t('home.more_games')}
          color={UI_COLORS.MORE_GAMES}
          icon="🎮"
          onPress={() => showStub('More Games')}
        />
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </View>
  );
};

const TitleChar: React.FC<{
  char: string;
  color: string;
  delay: number;
  reduceMotion: boolean;
}> = ({ char, color, delay, reduceMotion }) => {
  const ty = useSharedValue(reduceMotion ? 0 : 12);
  const opacity = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    opacity.value = withDelay(delay, withTiming(1, { duration: 220 }));
    ty.value = withDelay(
      delay,
      withSequence(
        withTiming(-4, { duration: 200, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 180 }),
      ),
    );
  }, [delay, opacity, reduceMotion, ty]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.Text style={[styles.titleChar, { color }, style]}>
      {char === ' ' ? ' ' : char}
    </Animated.Text>
  );
};

interface MenuButtonProps {
  label: string;
  color: string;
  icon: string;
  onPress: () => void;
  emphasize?: boolean;
  reduceMotion?: boolean;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  color,
  icon,
  onPress,
  emphasize,
  reduceMotion,
}) => {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (!emphasize || reduceMotion) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.025, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1200 }),
      ), 999999,
      false,
    );
  }, [emphasize, pulse, reduceMotion]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View style={emphasize ? animStyle : undefined}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={({ pressed }) => [
          styles.menuBtn,
          {
            backgroundColor: color,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            opacity: pressed ? 0.95 : 1,
          },
        ]}
      >
        <View style={styles.menuIconWrap}>
          <Text style={styles.menuIcon}>{icon}</Text>
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 68, 0.45)',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  chipLabel: {
    color: UI_COLORS.TEXT_SCORE,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.2,
  },
  chipValue: {
    color: UI_COLORS.TEXT_PRIMARY,
    fontWeight: '900',
    fontSize: 18,
  },
  settingsBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(15, 23, 68, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  settingsIcon: { fontSize: 28 },
  brand: {
    marginTop: 22,
    alignItems: 'center',
    zIndex: 2,
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  titleChar: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    marginTop: 6,
    color: '#E0EAFF',
    fontWeight: '900',
    letterSpacing: 3.2,
    fontSize: 13,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  streakCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    zIndex: 2,
  },
  streakTitle: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 12,
  },
  streakRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  winBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.45)',
    borderLeftColor: 'rgba(255,255,255,0.35)',
    borderBottomColor: 'rgba(0,0,0,0.15)',
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  winBadgeText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 12,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#0F172A',
    flex: 1,
  },
  checkCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    color: '#059669',
    fontSize: 18,
    fontWeight: '900',
  },
  heroSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    zIndex: 1,
  },
  menu: {
    gap: 12,
    zIndex: 2,
  },
  menuBtn: {
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 56,
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.5)',
    borderLeftColor: 'rgba(255,255,255,0.38)',
    borderBottomColor: 'rgba(0,0,0,0.28)',
    borderRightColor: 'rgba(0,0,0,0.18)',
    shadowColor: '#000',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: { fontSize: 26 },
  menuLabel: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});
