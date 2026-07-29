/**
 * Voice Feedback System - Text-to-Speech audio encouragement
 * Uses Expo Speech to speak feedback words aloud
 */

import { Audio, AVPlaybackSource } from 'expo-av';

export type VoiceFeedbackTier = 'Good' | 'Perfect' | 'Awesome' | 'Unbelievable';

// Pre-define mapping of files
const AUDIO_FILES: Record<VoiceFeedbackTier, AVPlaybackSource> = {
  Good: require('../../assets/sounds/good.wav'),
  Perfect: require('../../assets/sounds/perfect.wav'),
  Awesome: require('../../assets/sounds/awesome.wav'),
  Unbelievable: require('../../assets/sounds/unbelievable.wav'),
};

const POOL_SIZE = 3;

// Store loaded sound objects
const loadedSounds: Record<VoiceFeedbackTier, Audio.Sound[]> = {
  Good: [],
  Perfect: [],
  Awesome: [],
  Unbelievable: [],
};

const poolIndex: Record<VoiceFeedbackTier, number> = {
  Good: 0,
  Perfect: 0,
  Awesome: 0,
  Unbelievable: 0,
};

// Volume configuration per tier
const SPEECH_CONFIG: Record<VoiceFeedbackTier, { volume: number }> = {
  Good: { volume: 0.7 },
  Perfect: { volume: 0.8 },
  Awesome: { volume: 0.9 },
  Unbelievable: { volume: 1.0 },
};

/**
 * Preload all sounds into memory for instant playback
 */
export async function preloadAllVoiceFeedback(): Promise<void> {
  try {
    // Configure audio to duck others
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    // Load each sound
    for (const tier of Object.keys(AUDIO_FILES) as VoiceFeedbackTier[]) {
      if (loadedSounds[tier].length === 0) {
        const pool: Audio.Sound[] = [];
        for (let i = 0; i < POOL_SIZE; i++) {
          const { sound } = await Audio.Sound.createAsync(AUDIO_FILES[tier]);
          pool.push(sound);
        }
        loadedSounds[tier] = pool;
      }
    }
  } catch (error) {
    console.warn('Failed to preload voice feedback sounds:', error);
  }
}

/**
 * Play pre-recorded voice feedback with zero latency
 */
export async function playVoiceFeedback(
  tier: VoiceFeedbackTier,
  customVolume?: number
): Promise<void> {
  try {
    const soundSource = AUDIO_FILES[tier];
    if (!soundSource) return;

    const volume = customVolume ?? SPEECH_CONFIG[tier].volume;

    // Direct, reliable audio playback with automatic cleanup
    const { sound } = await Audio.Sound.createAsync(
      soundSource,
      { shouldPlay: true, volume }
    );

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (error) {
    console.warn(`Failed to play pre-recorded voice feedback sound for ${tier}:`, error);
  }
}

/**
 * Get volume based on feedback tier
 */
export function getVoiceVolume(tier: VoiceFeedbackTier): number {
  return SPEECH_CONFIG[tier].volume;
}

/**
 * Unload sounds to free memory
 */
export async function unloadAllVoiceFeedback(): Promise<void> {
  for (const tier of Object.keys(loadedSounds) as VoiceFeedbackTier[]) {
    const pool = loadedSounds[tier];
    for (const sound of pool) {
      await sound.unloadAsync();
    }
    loadedSounds[tier] = [];
    poolIndex[tier] = 0;
  }
}
