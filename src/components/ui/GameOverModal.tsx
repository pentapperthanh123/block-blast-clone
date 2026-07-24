/**
 * GameOverModal — end round + replay / home
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { useAppStore } from '../../store/appStore';
import { UI_COLORS } from '../../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GameOverModal: React.FC = () => {
  const { score, highScore, resetGame } = useGameStore();
  const goHome = useAppStore((s) => s.goHome);
  const isNewHighScore = score === highScore && score > 0;

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Game Over!</Text>

          {isNewHighScore && (
            <Text style={styles.newHighScore}>New High Score!</Text>
          )}

          <View style={styles.scoreContainer}>
            <Text style={styles.label}>Your Score</Text>
            <Text style={styles.score}>{score.toLocaleString()}</Text>
            <Text style={[styles.label, styles.bestLabel]}>Best Score</Text>
            <Text style={styles.bestScore}>{highScore.toLocaleString()}</Text>
          </View>

          <Pressable style={styles.button} onPress={resetGame}>
            <Text style={styles.buttonText}>Play Again</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.secondary]}
            onPress={goHome}
          >
            <Text style={[styles.buttonText, styles.secondaryText]}>Home</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 45, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: Math.min(SCREEN_WIDTH * 0.88, 380),
    backgroundColor: '#101A4D',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: UI_COLORS.TEXT_PRIMARY,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  newHighScore: {
    fontSize: 18,
    color: UI_COLORS.TEXT_SCORE,
    marginTop: 6,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  label: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bestLabel: {
    marginTop: 14,
  },
  score: {
    fontSize: 50,
    fontWeight: '900',
    color: UI_COLORS.TEXT_SCORE,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bestScore: {
    fontSize: 28,
    fontWeight: '900',
    color: UI_COLORS.TEXT_PRIMARY,
    marginTop: 2,
  },
  button: {
    backgroundColor: UI_COLORS.TEXT_SCORE,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginTop: 14,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.6)',
    borderLeftColor: 'rgba(255,255,255,0.4)',
    borderBottomColor: 'rgba(0,0,0,0.3)',
    borderRightColor: 'rgba(0,0,0,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  secondaryText: {
    color: UI_COLORS.TEXT_PRIMARY,
  },
});
