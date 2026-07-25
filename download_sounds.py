"""
Auto-generate simple sound files for Block Blast themes
Creates sine wave tones with different characteristics for each theme
"""

import os
import wave
import struct
import math
from pathlib import Path

# Target directory
SOUNDS_DIR = Path("assets/sounds")
SOUNDS_DIR.mkdir(parents=True, exist_ok=True)

# Sound configurations (frequency, duration, fade)
# Format: (filename, freq_hz, duration_s, description)
SOUND_CONFIGS = [
    # Watermelon theme - Fresh, high-pitched water sounds
    ("watermelon-clear.wav", 800, 0.35, "Watermelon splash"),
    ("watermelon-drop.wav", 600, 0.2, "Water drop"),
    ("watermelon-place.wav", 700, 0.12, "Water tap"),
    
    # Ice Cream theme - Sweet, bell-like tones
    ("icecream-clear.wav", 1200, 0.4, "Ice cream chime"),
    ("icecream-drop.wav", 900, 0.22, "Ice cream plop"),
    ("icecream-place.wav", 1000, 0.15, "Ice cream tap"),
    
    # Ocean theme - Deep, wave-like sounds
    ("ocean-clear.wav", 400, 0.5, "Ocean wave"),
    ("ocean-drop.wav", 500, 0.28, "Water splash"),
    ("ocean-place.wav", 550, 0.11, "Bubble pop"),
    
    # Sunset theme - Warm, wooden sounds
    ("sunset-clear.wav", 650, 0.38, "Wood chime"),
    ("sunset-drop.wav", 450, 0.24, "Wood knock"),
    ("sunset-place.wav", 520, 0.13, "Wood tap"),
    
    # Gem theme - High, crystalline sounds
    ("gem-clear.wav", 1500, 0.55, "Crystal shimmer"),
    ("gem-drop.wav", 1300, 0.32, "Glass clink"),
    ("gem-place.wav", 1400, 0.16, "Gem tap"),
]

def generate_tone(frequency, duration, sample_rate=44100, fade_ms=20):
    """Generate a sine wave tone with fade in/out"""
    num_samples = int(sample_rate * duration)
    fade_samples = int(sample_rate * fade_ms / 1000)
    
    samples = []
    for i in range(num_samples):
        # Generate sine wave
        sample = math.sin(2 * math.pi * frequency * i / sample_rate)
        
        # Apply fade in
        if i < fade_samples:
            sample *= i / fade_samples
        
        # Apply fade out
        if i > num_samples - fade_samples:
            sample *= (num_samples - i) / fade_samples
        
        # Apply exponential decay for more natural sound
        decay = math.exp(-3 * i / num_samples)
        sample *= decay
        
        # Convert to 16-bit integer
        samples.append(int(sample * 32767 * 0.6))  # 60% volume
    
    return samples

def save_wav(filename, samples, sample_rate=44100):
    """Save samples as a WAV file"""
    filepath = SOUNDS_DIR / filename
    
    with wave.open(str(filepath), 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # Pack samples as bytes
        for sample in samples:
            wav_file.writeframes(struct.pack('<h', sample))
    
    return filepath

def generate_sound(filename, frequency, duration, description):
    """Generate and save a sound file"""
    filepath = SOUNDS_DIR / filename
    
    # Skip if already exists
    if filepath.exists():
        print(f"OK {filename} already exists")
        return True
    
    print(f"Generating {filename} ({description}, {frequency}Hz, {duration}s)...")
    
    try:
        # Generate tone
        samples = generate_tone(frequency, duration)
        
        # Save to file
        filepath = save_wav(filename, samples)
        
        file_size = filepath.stat().st_size / 1024  # KB
        print(f"OK {filename} created ({file_size:.1f} KB)")
        return True
        
    except Exception as e:
        print(f"ERROR Failed to generate {filename}: {e}")
        return False

def main():
    print("=" * 60)
    print("Block Blast Sound Files Generator")
    print("=" * 60)
    print(f"\nTarget directory: {SOUNDS_DIR.absolute()}\n")
    
    success_count = 0
    fail_count = 0
    
    # Generate all files
    for filename, freq, duration, description in SOUND_CONFIGS:
        if generate_sound(filename, freq, duration, description):
            success_count += 1
        else:
            fail_count += 1
    
    # Summary
    print("\n" + "=" * 60)
    print(f"Generation complete!")
    print(f"OK Success: {success_count}/{len(SOUND_CONFIGS)}")
    if fail_count > 0:
        print(f"ERROR Failed: {fail_count}/{len(SOUND_CONFIGS)}")
    print("=" * 60)
    
    # Next steps
    if success_count > 0:
        print("\nNext steps:")
        print("1. Files are in assets/sounds/ folder")
        print("2. Uncomment lines 16-41 in src/constants/themeSounds.ts")
        print("   Change file extensions from .mp3 to .wav")
        print("3. Run: npm start")
        print("\nNote: These are simple generated tones.")
        print("For better quality, download real sounds from Freesound.org")
        print("(see DOWNLOAD-LINKS.md)")

if __name__ == "__main__":
    main()
