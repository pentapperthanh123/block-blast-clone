/**
 * Game Store - Zustand State Management
 * Interface Adapters Layer - Clean Architecture
 */

import { create } from 'zustand';
import { GameState, BlockShape, Position } from '../types';
import { gameEngine } from '../engine';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GameStore extends GameState {
  // Actions
  initGame: () => void;
  placeBlock: (block: BlockShape, position: Position) => void;
  resetGame: () => void;
  loadHighScore: () => Promise<void>;
  saveHighScore: (score: number) => Promise<void>;
}

const HIGH_SCORE_KEY = '@block-blast:high-score';

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  ...gameEngine.initializeGame(),

  // Actions
  initGame: () => {
    const newState = gameEngine.initializeGame();
    const currentHighScore = get().highScore;
    set({
      ...newState,
      highScore: currentHighScore, // Preserve loaded high score
    });
  },

  placeBlock: (block: BlockShape, position: Position) => {
    const currentState = get();

    try {
      const newState = gameEngine.placeBlock(currentState, block, position);

      // Save high score if updated
      if (newState.highScore > currentState.highScore) {
        get().saveHighScore(newState.highScore);
      }

      set(newState);
    } catch (error) {
      console.error('Failed to place block:', error);
      // Don't update state on error
    }
  },

  resetGame: () => {
    const currentHighScore = get().highScore;
    const newState = gameEngine.resetGame(currentHighScore);
    set(newState);
  },

  loadHighScore: async () => {
    try {
      const storedScore = await AsyncStorage.getItem(HIGH_SCORE_KEY);
      if (storedScore !== null) {
        const highScore = parseInt(storedScore, 10);
        set({ highScore });
      }
    } catch (error) {
      console.error('Failed to load high score:', error);
    }
  },

  saveHighScore: async (score: number) => {
    try {
      await AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString());
    } catch (error) {
      console.error('Failed to save high score:', error);
    }
  },
}));

// Initialize high score on app start
useGameStore.getState().loadHighScore();
