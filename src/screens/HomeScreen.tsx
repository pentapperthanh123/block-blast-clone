/**
 * HomeScreen — reference-style hub (Adventure / Classic / More Games)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { useAppStore } from '../store/appStore';
import { useGameStore } from '../store/gameStore';
import { HOME_TITLE, UI_COLORS } from '../constants';

const TITLE_COLORS = ['#FFD93D', '#4DD3E8', '#FF6B6B', '#6BCF7F', '#B565D8'];

function showStub(label: string) {
  const message = `${label} coming soon — play Classic for now.`;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.alert(message);
    return;
  }
  Alert.alert(label, message);
}

export const HomeScreen: React.FC = () => {
  const startClassic = useAppStore((s) => s.startClassic);
  const dailyStreak = useAppStore((s) => s.dailyStreak);
  const highScore = useGameStore((s) => s.highScore);
  const initGame = useGameStore((s) => s.initGame);

  const onClassic = () => {
    initGame();
    startClassic();
  };

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <View style={styles.profileChip}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🙂</Text>
          </View>
          <Text style={styles.chipIcon}>👑</Text>
          <Text style={styles.chipValue}>0</Text>
          <Text style={styles.chipIcon}>∞</Text>
          <Text style={styles.chipValue}>{highScore.toLocaleString()}</Text>
        </View>
        <View style={styles.topActions}>
          <Pressable style={styles.iconBtn} onPress={() => showStub('Settings')}>
            <Text style={styles.iconBtnText}>⚙</Text>
          </Pressable>
          <Pressable style={styles.medalBtn} onPress={() => showStub('Medals')}>
            <Text style={styles.iconBtnText}>🏅</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.brand}>
        <View style={styles.titleRow}>
          {HOME_TITLE.LINE1.split('').map((ch, i) => (
            <Text
              key={`${ch}-${i}`}
              style={[
                styles.titleChar,
                { color: TITLE_COLORS[i % TITLE_COLORS.length] },
              ]}
            >
              {ch === ' ' ? ' ' : ch}
            </Text>
          ))}
        </View>
        <Text style={styles.subtitle}>{HOME_TITLE.LINE2}</Text>
      </View>

      <View style={styles.streakCard}>
        <Text style={styles.streakTitle}>Consecutive Daily Victories</Text>
        <View style={styles.streakRow}>
          <View style={styles.winBadge}>
            <Text style={styles.winBadgeText}>WIN</Text>
          </View>
          <Text style={styles.streakValue}>× {dailyStreak}</Text>
        </View>
        <Text style={styles.check}>✓</Text>
      </View>

      <View style={styles.menu}>
        <MenuButton
          label="Adventure"
          color={UI_COLORS.ADVENTURE}
          icon="📍"
          onPress={() => showStub('Adventure')}
        />
        <MenuButton
          label="Classic"
          color={UI_COLORS.CLASSIC}
          icon="∞"
          onPress={onClassic}
        />
        <MenuButton
          label="More Games"
          color={UI_COLORS.MORE_GAMES}
          icon="🎮"
          onPress={() => showStub('More Games')}
        />
      </View>
    </View>
  );
};

interface MenuButtonProps {
  label: string;
  color: string;
  icon: string;
  onPress: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  label,
  color,
  icon,
  onPress,
}) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.menuBtn,
      {
        backgroundColor: color,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      },
    ]}
  >
    <Text style={styles.menuIcon}>{icon}</Text>
    <Text style={styles.menuLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14 },
  chipIcon: { fontSize: 13, color: UI_COLORS.TEXT_SCORE },
  chipValue: {
    color: UI_COLORS.TEXT_PRIMARY,
    fontWeight: '800',
    fontSize: 13,
    marginRight: 4,
  },
  topActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  medalBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,215,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.35)',
  },
  iconBtnText: { fontSize: 18 },
  brand: {
    marginTop: 36,
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  titleChar: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  subtitle: {
    marginTop: 8,
    color: '#D1E2FF',
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 14,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  streakCard: {
    marginTop: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    minHeight: 90,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  streakTitle: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  streakRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  winBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
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
  },
  check: {
    position: 'absolute',
    right: 16,
    bottom: 14,
    color: '#10B981',
    fontSize: 24,
    fontWeight: '900',
  },
  menu: {
    marginTop: 'auto',
    gap: 14,
  },
  menuBtn: {
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.45)',
    borderLeftColor: 'rgba(255,255,255,0.35)',
    borderBottomColor: 'rgba(0,0,0,0.3)',
    borderRightColor: 'rgba(0,0,0,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  menuIcon: { fontSize: 24 },
  menuLabel: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});
