jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn().mockResolvedValue(true),
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          setVolumeAsync: jest.fn().mockResolvedValue(true),
          setRateAsync: jest.fn().mockResolvedValue(true),
          playAsync: jest.fn().mockResolvedValue(true),
          replayAsync: jest.fn().mockResolvedValue(true),
          stopAsync: jest.fn().mockResolvedValue(true),
          unloadAsync: jest.fn().mockResolvedValue(true),
          setOnPlaybackStatusUpdate: jest.fn(),
        },
      }),
    },
  },
}));
