/**
 * Theme-specific sound effects system
 * Each theme has unique sounds for clear and drag end events
 */

import { Audio } from 'expo-av';
import { ThemeName } from './themes';

export type SoundEvent = 'clear' | 'dragEnd' | 'place' | 'dragStart';

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
  dragStart: any; // Block pickup/drag start sound
}

// Sound configurations for each theme
const THEME_SOUNDS: Record<ThemeName, ThemeSounds> = {
  watermelon: {
    clear: require('../../assets/sounds/watermelon-clear.wav'),
    dragEnd: require('../../assets/sounds/watermelon-drop.wav'),
    place: require('../../assets/sounds/watermelon-place.wav'),
    dragStart: require('../../assets/sounds/watermelon-dragstart.wav'),
  },
  icecream: {
    clear: require('../../assets/sounds/icecream-clear.wav'),
    dragEnd: require('../../assets/sounds/icecream-drop.wav'),
    place: require('../../assets/sounds/icecream-place.wav'),
    dragStart: require('../../assets/sounds/icecream-dragstart.wav'),
  },
  ocean: {
    clear: require('../../assets/sounds/ocean-clear.wav'),
    dragEnd: require('../../assets/sounds/ocean-drop.wav'),
    place: require('../../assets/sounds/ocean-place.wav'),
    dragStart: require('../../assets/sounds/ocean-dragstart.wav'),
  },
  sunset: {
    clear: require('../../assets/sounds/sunset-clear.wav'),
    dragEnd: require('../../assets/sounds/sunset-drop.wav'),
    place: require('../../assets/sounds/sunset-place.wav'),
    dragStart: require('../../assets/sounds/sunset-dragstart.wav'),
  },
  gem: {
    clear: require('../../assets/sounds/gem-clear.wav'),
    dragEnd: require('../../assets/sounds/gem-drop.wav'),
    place: require('../../assets/sounds/gem-place.wav'),
    dragStart: require('../../assets/sounds/gem-dragstart.wav'),
  },
  milktea: {
    clear: require('../../assets/sounds/milktea-clear.wav'),
    dragEnd: require('../../assets/sounds/milktea-drop.wav'),
    place: require('../../assets/sounds/milktea-place.wav'),
    dragStart: require('../../assets/sounds/milktea-dragstart.wav'),
  },
  love: {
    clear: require('../../assets/sounds/love-clear.wav'),
    dragEnd: require('../../assets/sounds/love-drop.wav'),
    place: require('../../assets/sounds/love-place.wav'),
    dragStart: require('../../assets/sounds/love-dragstart.wav'),
  },
  jollibee: {
    clear: require('../../assets/sounds/jollibee-clear.wav'),
    dragEnd: require('../../assets/sounds/jollibee-drop.wav'),
    place: require('../../assets/sounds/jollibee-place.wav'),
    dragStart: require('../../assets/sounds/jollibee-dragstart.wav'),
  },
  coffee: {
    clear: require('../../assets/sounds/coffee-clear.wav'),
    dragEnd: require('../../assets/sounds/coffee-drop.wav'),
    place: require('../../assets/sounds/coffee-place.wav'),
    dragStart: require('../../assets/sounds/coffee-dragstart.wav'),
  },
  matcha: {
    clear: require('../../assets/sounds/matcha-clear.wav'),
    dragEnd: require('../../assets/sounds/matcha-drop.wav'),
    place: require('../../assets/sounds/matcha-place.wav'),
    dragStart: require('../../assets/sounds/matcha-dragstart.wav'),
  },
  beer: {
    clear: require('../../assets/sounds/beer-clear.wav'),
    dragEnd: require('../../assets/sounds/beer-drop.wav'),
    place: require('../../assets/sounds/beer-place.wav'),
    dragStart: require('../../assets/sounds/beer-dragstart.wav'),
  },
};

const POOL_SIZE = 4;
// Sound cache to avoid reloading
const soundCache = new Map<string, Audio.Sound[]>();
const poolIndexCache = new Map<string, number>();

export interface PlaySoundOptions {
  volume?: number;
  pitch?: number;
  combo?: number;
  linesCount?: number;
}

/** Calculate musical semitone pitch shift based on combo streak */
export function getComboPitch(comboCount: number): number {
  if (comboCount <= 1) return 1.0;
  // Cap at 12 semitones (1 octave up) for combo 13+
  const semitones = Math.min(comboCount - 1, 12);
  return Math.pow(2, semitones / 12);
}

let audioModeConfigured = false;

async function configureAudioModeIfNeeded() {
  if (audioModeConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
    });
    audioModeConfigured = true;
  } catch {
    // Ignore audio mode configuration errors
  }
}

/**
 * Play theme-specific sound effect with optional pitch scaling & combo escalation
 * @param theme Current active theme
 * @param event Sound event type
 * @param options Volume, pitch, combo streak, or lines count
 */
export async function playThemeSound(
  theme: ThemeName,
  event: SoundEvent,
  options?: number | PlaySoundOptions
): Promise<void> {
  try {
    void configureAudioModeIfNeeded();
    const opts: PlaySoundOptions =
      typeof options === 'number' ? { volume: options } : options ?? {};

    const baseVolume = opts.volume ?? 1.0;
    let pitch = opts.pitch ?? 1.0;

    if (opts.combo && opts.combo > 1) {
      pitch = getComboPitch(opts.combo);
    }

    // Boost volume and slightly shift pitch up for multi-line clears
    let finalVolume = baseVolume;
    if (opts.linesCount && opts.linesCount > 1) {
      finalVolume = Math.min(1.0, baseVolume + (opts.linesCount - 1) * 0.1);
      if (!opts.pitch && !opts.combo) {
        pitch = Math.min(1.4, 1.0 + (opts.linesCount - 1) * 0.08);
      }
    } else if (event === 'place' && !opts.pitch && (!opts.combo || opts.combo <= 1)) {
      // Micro variation (0.96x - 1.04x) so repetitive taps sound organic & tactile
      pitch = 0.96 + Math.random() * 0.08;
    }

    const soundSource = THEME_SOUNDS[theme]?.[event];
    if (!soundSource || soundSource === '') return;

    const cacheKey = `${theme}-${event}`;
    let sounds = soundCache.get(cacheKey);

    if (!sounds || sounds.length === 0) {
      sounds = [];
      try {
        const result = await Audio.Sound.createAsync(soundSource);
        if (result?.sound) {
          sounds.push(result.sound);
          soundCache.set(cacheKey, sounds);
          poolIndexCache.set(cacheKey, 0);
        }
      } catch {
        // Continue to direct playback fallback below
      }
    }

    if (sounds && sounds.length > 0) {
      const idx = poolIndexCache.get(cacheKey) || 0;
      const sound = sounds[idx];
      poolIndexCache.set(cacheKey, (idx + 1) % sounds.length);

      // Fire and forget: safe playback with graceful fallback
      (async () => {
        try {
          await sound.setVolumeAsync(finalVolume);
          if (pitch !== 1.0) {
            try {
              await sound.setRateAsync(pitch, false);
            } catch {
              // Ignore rate error on platforms/devices that don't support pitch shifting
            }
          }
          await sound.setPositionAsync(0);
          await sound.playAsync();
        } catch {
          // Direct fallback creation if pool instance is locked
          try {
            const { sound: freshSound } = await Audio.Sound.createAsync(soundSource, {
              shouldPlay: true,
              volume: finalVolume,
            });
            freshSound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                freshSound.unloadAsync();
              }
            });
          } catch {
            // Ignore
          }
        }
      })();
    } else {
      // Direct one-off play if pool is empty
      Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        volume: finalVolume,
      }).then(({ sound: freshSound }) => {
        freshSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            freshSound.unloadAsync();
          }
        });
      }).catch(() => {});
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
  const events: SoundEvent[] = ['clear', 'dragEnd', 'place', 'dragStart'];
  
  await Promise.all(
    events.map(async (event) => {
      const cacheKey = `${theme}-${event}`;
      if (soundCache.has(cacheKey)) return;

      try {
        const soundSource = THEME_SOUNDS[theme]?.[event];
        if (!soundSource || soundSource === '') return; // Skip if not added yet

        const pool: Audio.Sound[] = [];
        for (let i = 0; i < POOL_SIZE; i++) {
          const { sound } = await Audio.Sound.createAsync(soundSource);
          pool.push(sound);
        }
        soundCache.set(cacheKey, pool);
        poolIndexCache.set(cacheKey, 0);
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
  for (const [key, pool] of soundCache.entries()) {
    try {
      for (const sound of pool) {
        await sound.unloadAsync();
      }
    } catch (error) {
      console.warn(`Failed to unload sound ${key}:`, error);
    }
  }
  soundCache.clear();
  poolIndexCache.clear();
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
  const sound = activeWarningSound;
  if (sound) {
    activeWarningSound = null;
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
    } catch (error) {
      console.warn('Failed to stop warning sound:', error);
    }
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
