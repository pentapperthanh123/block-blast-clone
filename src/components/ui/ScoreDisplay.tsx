/**
 * ScoreDisplay - Header with score and controls
 * Presentation Layer
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { UI_COLORS } from '../../constants';

export const ScoreDisplay: React.FC = () => {
  const { score, highScore, resetGame } = useGameStore();

  return (
    <View style={styles.container}>
      <View style={styles.scoreRow}>
        <View style={styles.scoreItem}>
          <Text style={styles.label}>Score</Text>
          <Text style={styles.score}>{score.toLocaleString()}</Text>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetText}>↻</Text>
        </TouchableOpacity>

        <View style={styles.scoreItem}>
          <Text style={styles.label}>Best</Text>
          <Text style={styles.highScore}>{highScore.toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreItem: {
    alignItems: 'center',
    minWidth: 100,
  },
  label: {
    fontSize: 14,
    color: UI_COLORS.TEXT_PRIMARY,
    opacity: 0.7,
    marginBottom: 4,
  },
  score: {
    fontSize: 28,
    fontWeight: 'bold',
    color: UI_COLORS.TEXT_SCORE,
  },
  highScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: UI_COLORS.TEXT_PRIMARY,
  },
  resetButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: UI_COLORS.GRID_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetText: {
    fontSize: 32,
    color: UI_COLORS.TEXT_PRIMARY,
  },
});
