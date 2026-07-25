/**
 * Voice Feedback System - Text-to-Speech audio encouragement
 * Uses Expo Speech to speak feedback words aloud
 */

import { Audio } from 'expo-av';

export type VoiceFeedbackTier = 'Good' | 'Perfect' | 'Awesome' | 'Unbelievable';

// Pre-define mapping of files
const AUDIO_FILES: Record<VoiceFeedbackTier, any> = {
  Good: require('../../assets/sounds/good.wav'),
  Perfect: require('../../assets/sounds/perfect.wav'),
  Awesome: require('../../assets/sounds/awesome.wav'),
  Unbelievable: require('../../assets/sounds/unbelievable.wav'),
};

// Store loaded sound objects
const loadedSounds: Record<VoiceFeedbackTier, Audio.Sound | null> = {
  Good: null,
  Perfect: null,
  Awesome: null,
  Unbelievable: null,
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
      if (!loadedSounds[tier]) {
        const { sound } = await Audio.Sound.createAsync(AUDIO_FILES[tier]);
        loadedSounds[tier] = sound;
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
    const sound = loadedSounds[tier];
    if (!sound) {
      console.warn(`Sound for ${tier} not preloaded!`);
      return;
    }

    const volume = customVolume ?? SPEECH_CONFIG[tier].volume;
    
    // Stop any ongoing speech
    await sound.stopAsync();
    
    // Set volume and play from beginning
    await sound.setVolumeAsync(volume);
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (error) {
    console.warn(`Failed to play pre-recorded sound for ${tier}:`, error);
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
    const sound = loadedSounds[tier];
    if (sound) {
      await sound.unloadAsync();
      loadedSounds[tier] = null;
    }
  }
}
