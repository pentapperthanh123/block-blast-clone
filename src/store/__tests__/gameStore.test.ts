jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useGameStore } from '../gameStore';

describe('gameStore - triggerImmediateGameOver', () => {
  beforeEach(() => {
    useGameStore.getState().initGame();
  });

  it('should trigger game over immediately when called', () => {
    expect(useGameStore.getState().isGameOver).toBe(false);

    useGameStore.getState().triggerImmediateGameOver();

    expect(useGameStore.getState().isGameOver).toBe(true);
    expect(useGameStore.getState().lastGameOver).not.toBeNull();
  });
});

describe('gameStore - clearBoardOnNewRound', () => {
  beforeEach(() => {
    useGameStore.setState({
      gameplaySettings: {
        dangerWarningEnabled: true,
        clearBoardOnNewRound: true,
        randomFillRatio: 0.35,
        randomThemeOnNewRound: false,
        defaultTheme: 'ocean',
      },
    });
    useGameStore.getState().initGame();
  });

  it('should start with an empty board when clearBoardOnNewRound is enabled', () => {
    const { grid } = useGameStore.getState();
    const filled = grid.flat().filter((cell) => cell === 1).length;
    expect(filled).toBe(0);
  });
});

describe('gameStore - activeSession auto-save & resume', () => {
  beforeEach(() => {
    useGameStore.getState().initGame();
  });

  it('should save active session and restore it on beginClassicSession', () => {
    useGameStore.setState({ score: 150 });
    useGameStore.getState().saveActiveSessionIfNeeded();

    expect(useGameStore.getState().activeSession).not.toBeNull();
    expect(useGameStore.getState().activeSession?.score).toBe(150);

    // Simulate returning to home and clicking Classic (Continue)
    useGameStore.getState().beginClassicSession();
    expect(useGameStore.getState().score).toBe(150);
  });

  it('should clear active session on game over', () => {
    useGameStore.setState({ score: 150 });
    useGameStore.getState().saveActiveSessionIfNeeded();

    useGameStore.getState().triggerImmediateGameOver();
    expect(useGameStore.getState().activeSession).toBeNull();
  });
});
