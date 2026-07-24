/**
 * GameHeader — crown/best, big score, settings (reference layout)
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { useAppStore } from '../../store/appStore';
import { UI_COLORS } from '../../constants';

export const GameHeader: React.FC = () => {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const goHome = useAppStore((s) => s.goHome);

  const onSettings = () => {
    const message = 'Return to home?';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      if (window.confirm(message)) goHome();
      return;
    }
    Alert.alert('Settings', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Home', onPress: goHome },
    ]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.topRow}>
        <View style={styles.best}>
          <Text style={styles.crown}>👑</Text>
          <Text style={styles.bestScore}>{highScore.toLocaleString()}</Text>
        </View>
        <Pressable style={styles.settings} onPress={onSettings}>
          <Text style={styles.settingsIcon}>⚙</Text>
        </Pressable>
      </View>
      <Text style={styles.score}>{score.toLocaleString()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
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
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  crown: { fontSize: 16 },
  bestScore: {
    color: UI_COLORS.TEXT_SCORE,
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  settings: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  settingsIcon: {
    fontSize: 20,
    color: '#D1E2FF',
  },
  score: {
    marginTop: 6,
    fontSize: 56,
    fontWeight: '900',
    color: UI_COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
});
