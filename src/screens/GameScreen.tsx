/**
 * GameScreen - Main Game Screen
 * Presentation Layer - Clean Architecture
 */

import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useGameStore } from '../store/gameStore';
import { ScoreDisplay } from '../components/ui/ScoreDisplay';
import { GridCanvas } from '../components/game/GridCanvas';
import { BlockPicker } from '../components/game/BlockPicker';
import { GameOverModal } from '../components/ui/GameOverModal';
import { UI_COLORS } from '../constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const GameScreen: React.FC = () => {
  const { initGame, isGameOver } = useGameStore();

  useEffect(() => {
    initGame();
  }, [initGame]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={UI_COLORS.BACKGROUND} />

      <View style={styles.content}>
        {/* Header with score */}
        <ScoreDisplay />

        {/* Main game grid */}
        <View style={styles.gridContainer}>
          <GridCanvas />
        </View>

        {/* Block picker at bottom */}
        <View style={styles.pickerContainer}>
          <BlockPicker />
        </View>
      </View>

      {/* Game over modal */}
      {isGameOver && <GameOverModal />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
  },
  pickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});
