/**
 * Theme-specific sound effects system
 * Each theme has unique sounds for clear and drag end events
 */

import { Audio } from 'expo-av';
import { ThemeName } from './themes';

export type SoundEvent = 'clear' | 'dragEnd' | 'place';

// Global game sounds (not theme-specific)
export const GAME_START_SOUND = require('../../assets/sounds/game-start.wav');
export const GAME_OVER_SOUND = require('../../assets/sounds/game-over.wav');
export const NEW_RECORD_SOUND = require('../../assets/sounds/new-record.wav');

// Warning sounds for danger levels
export const WARNING_LIGHT_SOUND = require('../../assets/sounds/warning-light.wav');
export const WARNING_MEDIUM_SOUND = require('../../assets/sounds/warning-medium.wav');
export const WARNING_CRITICAL_SOUND = require('../../assets/sounds/warning-critical.wav');

interface ThemeSounds {
  clear: any; // Line/column clear sound (AVPlaybackSource when files added)
  dragEnd: any; // Block placement sound
  place: any; // Block drop sound
}

// Sound configurations for each theme
const THEME_SOUNDS: Record<ThemeName, ThemeSounds> = {
  watermelon: {
    clear: require('../../assets/sounds/watermelon-clear.wav'),
    dragEnd: require('../../assets/sounds/watermelon-drop.wav'),
    place: require('../../assets/sounds/watermelon-place.wav'),
  },
  icecream: {
    clear: require('../../assets/sounds/icecream-clear.wav'),
    dragEnd: require('../../assets/sounds/icecream-drop.wav'),
    place: require('../../assets/sounds/icecream-place.wav'),
  },
  ocean: {
    clear: require('../../assets/sounds/ocean-clear.wav'),
    dragEnd: require('../../assets/sounds/ocean-drop.wav'),
    place: require('../../assets/sounds/ocean-place.wav'),
  },
  sunset: {
    clear: require('../../assets/sounds/sunset-clear.wav'),
    dragEnd: require('../../assets/sounds/sunset-drop.wav'),
    place: require('../../assets/sounds/sunset-place.wav'),
  },
  gem: {
    clear: require('../../assets/sounds/gem-clear.wav'),
    dragEnd: require('../../assets/sounds/gem-drop.wav'),
    place: require('../../assets/sounds/gem-place.wav'),
  },
  milktea: {
    clear: require('../../assets/sounds/milktea-clear.wav'),
    dragEnd: require('../../assets/sounds/milktea-drop.wav'),
    place: require('../../assets/sounds/milktea-place.wav'),
  },
  love: {
    clear: require('../../assets/sounds/love-clear.wav'),
    dragEnd: require('../../assets/sounds/love-drop.wav'),
    place: require('../../assets/sounds/love-place.wav'),
  },
  jollibee: {
    clear: require('../../assets/sounds/jollibee-clear.wav'),
    dragEnd: require('../../assets/sounds/jollibee-drop.wav'),
    place: require('../../assets/sounds/jollibee-place.wav'),
  },
};

// Sound cache to avoid reloading
const soundCache = new Map<string, Audio.Sound>();

/**
 * Play theme-specific sound effect
 * @param theme Current active theme
 * @param event Sound event type
 * @param volume Volume (0-1), default 0.7
 */
export async function playThemeSound(
  theme: ThemeName,
  event: SoundEvent,
  volume: number = 0.7
): Promise<void> {
  try {
    const soundSource = THEME_SOUNDS[theme]?.[event];
    if (!soundSource || soundSource === '') return;

    const cacheKey = `${theme}-${event}`;
    let sound = soundCache.get(cacheKey);

    if (!sound) {
      const result = await Audio.Sound.createAsync(soundSource);
      sound = result?.sound;
      if (sound) soundCache.set(cacheKey, sound);
    }

    if (sound) {
      await sound.setVolumeAsync(volume);
      await sound.replayAsync();
    }
  } catch {
    // Silently skip audio errors — never crash the game for a missing sound
  }
}

/**
 * Preload all sounds for a theme
 * Call this when theme changes to avoid lag
 */
export async function preloadThemeSounds(theme: ThemeName): Promise<void> {
  const events: SoundEvent[] = ['clear', 'dragEnd', 'place'];
  
  await Promise.all(
    events.map(async (event) => {
      const cacheKey = `${theme}-${event}`;
      if (soundCache.has(cacheKey)) return;

      try {
        const soundSource = THEME_SOUNDS[theme]?.[event];
        if (!soundSource || soundSource === '') return; // Skip if not added yet

        const { sound } = await Audio.Sound.createAsync(soundSource);
        soundCache.set(cacheKey, sound);
      } catch (error) {
        console.warn(`Failed to preload ${theme} ${event} sound:`, error);
      }
    })
  );
}

/**
 * Unload all cached sounds to free memory
 */
export async function unloadAllSounds(): Promise<void> {
  for (const [key, sound] of soundCache.entries()) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.warn(`Failed to unload sound ${key}:`, error);
    }
  }
  soundCache.clear();
}

/**
 * Play global game sound (game start or game over)
 * @param soundSource The imported sound file
 * @param volume Volume (0-1), default 0.7
 */
export async function playGlobalSound(
  soundSource: any,
  volume: number = 0.7
): Promise<void> {
  try {
    if (!soundSource) return;
    
    const { sound } = await Audio.Sound.createAsync(soundSource);
    await sound.setVolumeAsync(volume);
    await sound.playAsync();
    
    // Auto-unload after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch (error) {
    console.warn(`Failed to play global sound:`, error);
  }
}

// Active warning sound instance for looping
let activeWarningSound: Audio.Sound | null = null;
let warningSoundToken = 0;

/**
 * Play warning sound based on danger level
 * Level 1: Single beep
 * Level 2: Looping medium warning
 * Level 3: Looping critical warning (faster)
 * @param dangerLevel 0-3
 */
export async function playWarningSound(dangerLevel: number): Promise<void> {
  const token = ++warningSoundToken;
  try {
    // Stop any existing warning sound
    if (activeWarningSound) {
      await activeWarningSound.stopAsync();
      await activeWarningSound.unloadAsync();
      activeWarningSound = null;
    }

    if (dangerLevel === 0) return; // No danger, no sound

    let soundSource: any;
    let shouldLoop = false;
    let volume = 0.5;

    if (dangerLevel === 1) {
      soundSource = WARNING_LIGHT_SOUND;
      shouldLoop = false;
      volume = 0.4;
    } else if (dangerLevel === 2) {
      soundSource = WARNING_MEDIUM_SOUND;
      shouldLoop = true;
      volume = 0.5;
    } else {
      soundSource = WARNING_CRITICAL_SOUND;
      shouldLoop = true;
      volume = 0.6;
    }

    if (!soundSource) return;

    const { sound } = await Audio.Sound.createAsync(soundSource, {
      isLooping: shouldLoop,
      volume,
    });

    if (token !== warningSoundToken) {
      await sound.unloadAsync();
      return;
    }

    activeWarningSound = sound;
    await sound.playAsync();

    // Auto-cleanup for non-looping sounds
    if (!shouldLoop) {
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          if (activeWarningSound === sound) {
            activeWarningSound = null;
          }
        }
      });
    }
  } catch (error) {
    console.warn(`Failed to play warning sound for level ${dangerLevel}:`, error);
  }
}

/**
 * Stop warning sound (call when danger cleared)
 */
export async function stopWarningSound(): Promise<void> {
  warningSoundToken++;
  if (activeWarningSound) {
    try {
      await activeWarningSound.stopAsync();
      await activeWarningSound.unloadAsync();
    } catch (error) {
      console.warn('Failed to stop warning sound:', error);
    }
    activeWarningSound = null;
  }
}

/**
 * Theme sound characteristics guide:
 * 
 * WATERMELON:
 * - Clear: Juicy splash sound (0.3s)
 * - Drop: Soft thud (0.2s)
 * - Place: Light tap (0.1s)
 * 
 * ICE CREAM:
 * - Clear: Sparkly chime (0.4s)
 * - Drop: Soft squish (0.2s)
 * - Place: Gentle plop (0.15s)
 * 
 * OCEAN:
 * - Clear: Wave crash (0.5s)
 * - Drop: Water splash (0.3s)
 * - Place: Bubble pop (0.1s)
 * 
 * SUNSET:
 * - Clear: Wood chime (0.4s)
 * - Drop: Wooden knock (0.2s)
 * - Place: Soft tap (0.1s)
 * 
 * GEM:
 * - Clear: Crystal shimmer (0.6s)
 * - Drop: Glass clink (0.3s)
 * - Place: Gem tap (0.15s)
 *
 * LOVE:
 * - Clear: Soft romantic chime
 * - Drop: Gentle thud
 * - Place: Light tap
 */
