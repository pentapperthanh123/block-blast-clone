/**
 * GameOverModal - Game over screen
 * Presentation Layer
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { UI_COLORS } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GameOverModal: React.FC = () => {
  const { score, highScore, resetGame } = useGameStore();
  const isNewHighScore = score === highScore && score > 0;

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Game Over!</Text>

          {isNewHighScore && (
            <Text style={styles.newHighScore}>🎉 New High Score!</Text>
          )}

          <View style={styles.scoreContainer}>
            <Text style={styles.label}>Your Score</Text>
            <Text style={styles.score}>{score.toLocaleString()}</Text>

            <Text style={[styles.label, styles.bestLabel]}>Best Score</Text>
            <Text style={styles.bestScore}>{highScore.toLocaleString()}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={resetGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: UI_COLORS.GRID_BACKGROUND,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: UI_COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  newHighScore: {
    fontSize: 18,
    color: UI_COLORS.TEXT_SCORE,
    marginBottom: 24,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  label: {
    fontSize: 16,
    color: UI_COLORS.TEXT_PRIMARY,
    opacity: 0.7,
    marginBottom: 8,
  },
  bestLabel: {
    marginTop: 16,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: UI_COLORS.TEXT_SCORE,
    marginBottom: 8,
  },
  bestScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: UI_COLORS.TEXT_PRIMARY,
  },
  button: {
    backgroundColor: UI_COLORS.TEXT_SCORE,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginTop: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: UI_COLORS.BACKGROUND,
  },
});
