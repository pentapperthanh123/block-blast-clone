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
