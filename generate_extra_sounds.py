"""
Generate additional sound effects: game start and game over
"""

import wave
import struct
import math
from pathlib import Path

SOUNDS_DIR = Path("assets/sounds")

def generate_chord(frequencies, duration, sample_rate=44100):
    """Generate a chord (multiple frequencies)"""
    num_samples = int(sample_rate * duration)
    samples = []
    
    for i in range(num_samples):
        sample = 0
        # Add all frequencies together
        for freq in frequencies:
            sample += math.sin(2 * math.pi * freq * i / sample_rate)
        
        # Average and apply decay
        sample = sample / len(frequencies)
        decay = math.exp(-2 * i / num_samples)
        sample *= decay
        
        # Apply fade in/out
        fade_samples = int(sample_rate * 0.02)
        if i < fade_samples:
            sample *= i / fade_samples
        if i > num_samples - fade_samples:
            sample *= (num_samples - i) / fade_samples
        
        samples.append(int(sample * 32767 * 0.5))
    
    return samples

def generate_game_start():
    """Generate uplifting game start sound (ascending chord)"""
    print("Generating game-start.wav (Uplifting start chord)...")
    
    # Create ascending chord: C major arpeggio (happy, positive)
    # C4, E4, G4, C5
    chord1 = [261.63, 329.63, 392.00, 523.25]
    
    samples = []
    
    # First chord (0.3s)
    samples.extend(generate_chord(chord1, 0.3))
    
    # Higher chord (0.25s) - more sparkle
    chord2 = [392.00, 493.88, 587.33]
    samples.extend(generate_chord(chord2, 0.25))
    
    # Save
    filepath = SOUNDS_DIR / "game-start.wav"
    with wave.open(str(filepath), 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(44100)
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))
    
    print(f"OK game-start.wav created ({filepath.stat().st_size / 1024:.1f} KB)")

def generate_game_over():
    """Generate descending game over sound (sad, but not harsh)"""
    print("Generating game-over.wav (Game over descending tone)...")
    
    # Descending minor chord progression
    # A minor to E minor (melancholic but gentle)
    chord1 = [440.00, 523.25, 659.25]  # A minor
    chord2 = [329.63, 392.00, 493.88]  # E minor
    chord3 = [293.66, 349.23, 440.00]  # D minor (resolution)
    
    samples = []
    
    # First chord (0.35s)
    samples.extend(generate_chord(chord1, 0.35))
    
    # Second chord (0.35s)
    samples.extend(generate_chord(chord2, 0.35))
    
    # Final chord (0.5s) - longer decay
    samples.extend(generate_chord(chord3, 0.5))
    
    # Save
    filepath = SOUNDS_DIR / "game-over.wav"
    with wave.open(str(filepath), 'w') as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(44100)
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))
    
    print(f"OK game-over.wav created ({filepath.stat().st_size / 1024:.1f} KB)")

def main():
    print("=" * 60)
    print("Generating Game Start & Game Over Sounds")
    print("=" * 60)
    print()
    
    try:
        generate_game_start()
        generate_game_over()
        
        print("\n" + "=" * 60)
        print("Generation complete!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Sounds are in assets/sounds/")
        print("2. Update themeSounds.ts to add:")
        print("   - export const GAME_START_SOUND = require('../../assets/sounds/game-start.wav');")
        print("   - export const GAME_OVER_SOUND = require('../../assets/sounds/game-over.wav');")
        print("3. Play sounds in appropriate components:")
        print("   - Game start: LoadingScreen or HomeScreen")
        print("   - Game over: GameOverModal")
        
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    main()
