"""
Generate sound files for Milk Tea theme
"""

import wave
import struct
import math
from pathlib import Path

SOUNDS_DIR = Path("assets/sounds")

def generate_tone(frequency, duration, sample_rate=44100, fade_ms=20):
    """Generate a sine wave tone with fade in/out"""
    num_samples = int(sample_rate * duration)
    fade_samples = int(sample_rate * fade_ms / 1000)
    samples = []
    
    for i in range(num_samples):
        # Sine wave
        sample = math.sin(2 * math.pi * frequency * i / sample_rate)
        
        # Exponential decay for natural sound
        decay = math.exp(-2 * i / num_samples)
        sample *= decay
        
        # Fade in
        if i < fade_samples:
            sample *= i / fade_samples
        
        # Fade out
        if i > num_samples - fade_samples:
            sample *= (num_samples - i) / fade_samples
        
        # Convert to 16-bit integer
        samples.append(int(sample * 32767 * 0.5))
    
    return samples

def save_wav(filename, samples, sample_rate=44100):
    """Save samples as WAV file"""
    filepath = SOUNDS_DIR / filename
    with wave.open(str(filepath), 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))

def generate_sound(filename, frequency, duration, description):
    """Generate and save a sound"""
    print(f"Generating {filename} ({description})...")
    samples = generate_tone(frequency, duration)
    save_wav(filename, samples)
    size_kb = (SOUNDS_DIR / filename).stat().st_size / 1024
    print(f"  OK - {size_kb:.1f} KB")

def main():
    print("=" * 60)
    print("Generating Milk Tea Theme Sounds")
    print("=" * 60)
    print()
    
    SOUNDS_DIR.mkdir(parents=True, exist_ok=True)
    
    # Milk Tea theme: Warm, mellow tones (mid-range frequencies)
    sounds = [
        ("milktea-clear.wav", 600, 0.40, "Milk Tea clear - warm splash"),
        ("milktea-drop.wav", 480, 0.28, "Milk Tea drop - soft thud"),
        ("milktea-place.wav", 540, 0.15, "Milk Tea place - gentle tap"),
    ]
    
    try:
        for filename, frequency, duration, description in sounds:
            generate_sound(filename, frequency, duration, description)
        
        print("\n" + "=" * 60)
        print("Milk Tea sounds generated successfully!")
        print("=" * 60)
        print("\nFiles created:")
        print("  - milktea-clear.wav")
        print("  - milktea-drop.wav")
        print("  - milktea-place.wav")
        print("\nTotal: 6 themes × 3 sounds = 18 audio files")
        
    except Exception as e:
        print(f"\nERROR: {e}")

if __name__ == "__main__":
    main()
