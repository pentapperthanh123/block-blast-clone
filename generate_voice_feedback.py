"""
Generate voice feedback audio files for game achievements
Creates WAV files for: Good, Perfect, Awesome, Unbelievable
"""

import wave
import struct
import math
from pathlib import Path

SOUNDS_DIR = Path("assets/sounds")

def generate_tone_sequence(frequencies, durations, sample_rate=44100):
    """Generate a sequence of tones with smooth transitions"""
    samples = []
    
    for freq, duration in zip(frequencies, durations):
        num_samples = int(sample_rate * duration)
        fade_samples = int(sample_rate * 0.02)  # 20ms fade
        
        for i in range(num_samples):
            t = i / sample_rate
            # Main tone
            sample = math.sin(2 * math.pi * freq * t)
            
            # Add harmonics for richer sound
            sample += 0.3 * math.sin(2 * math.pi * freq * 2 * t)  # 2nd harmonic
            sample += 0.15 * math.sin(2 * math.pi * freq * 3 * t)  # 3rd harmonic
            
            # Envelope with fade in/out
            if i < fade_samples:
                envelope = i / fade_samples
            elif i > num_samples - fade_samples:
                envelope = (num_samples - i) / fade_samples
            else:
                envelope = 1.0
            
            # Exponential decay for natural sound
            decay = math.exp(-3 * t / duration)
            
            samples.append(sample * envelope * decay * 0.4)  # Volume: 40%
    
    return samples

def generate_bell_tone(base_freq, duration, sample_rate=44100):
    """Generate a bell-like tone with multiple harmonics"""
    num_samples = int(sample_rate * duration)
    samples = []
    
    # Bell harmonics ratios
    harmonics = [
        (1.0, 1.0),    # Fundamental
        (2.76, 0.6),   # 2nd partial
        (5.40, 0.4),   # 3rd partial
        (8.93, 0.25),  # 4th partial
    ]
    
    for i in range(num_samples):
        t = i / sample_rate
        sample = 0
        
        for ratio, amplitude in harmonics:
            freq = base_freq * ratio
            sample += amplitude * math.sin(2 * math.pi * freq * t)
        
        # Sharp attack, exponential decay
        if i < int(sample_rate * 0.01):  # 10ms attack
            envelope = i / (sample_rate * 0.01)
        else:
            envelope = 1.0
        
        decay = math.exp(-4 * t / duration)
        samples.append(sample * envelope * decay * 0.3)
    
    return samples

def save_wav(filename, samples, sample_rate=44100):
    """Save samples as WAV file"""
    filepath = SOUNDS_DIR / filename
    
    with wave.open(str(filepath), 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        for sample in samples:
            # Convert to 16-bit integer
            value = int(sample * 32767)
            value = max(-32768, min(32767, value))
            wav_file.writeframes(struct.pack('<h', value))

def generate_good():
    """Good - Single cheerful tone"""
    print("Generating 'Good' voice...")
    
    # Rising tone: C5 -> E5
    frequencies = [523, 659]
    durations = [0.12, 0.18]
    
    samples = generate_tone_sequence(frequencies, durations)
    save_wav("voice-good.wav", samples)
    print("  OK voice-good.wav")

def generate_perfect():
    """Perfect - Two ascending notes"""
    print("Generating 'Perfect' voice...")
    
    # C5 -> E5 -> G5
    frequencies = [523, 659, 784]
    durations = [0.10, 0.10, 0.20]
    
    samples = generate_tone_sequence(frequencies, durations)
    save_wav("voice-perfect.wav", samples)
    print("  OK voice-perfect.wav")

def generate_awesome():
    """Awesome - Triumphant chord sequence"""
    print("Generating 'Awesome' voice...")
    
    # C5 -> E5 -> G5 -> C6 (octave jump)
    frequencies = [523, 659, 784, 1047]
    durations = [0.08, 0.08, 0.10, 0.24]
    
    samples = generate_tone_sequence(frequencies, durations)
    save_wav("voice-awesome.wav", samples)
    print("  OK voice-awesome.wav")

def generate_unbelievable():
    """Unbelievable - Epic bell cascade"""
    print("Generating 'Unbelievable' voice...")
    
    # Bell cascade: C5 -> E5 -> G5 -> C6 -> E6
    bell_notes = [523, 659, 784, 1047, 1319]
    all_samples = []
    
    for i, freq in enumerate(bell_notes):
        duration = 0.08 if i < 4 else 0.30  # Last note longer
        bell_samples = generate_bell_tone(freq, duration)
        all_samples.extend(bell_samples)
    
    save_wav("voice-unbelievable.wav", all_samples)
    print("  OK voice-unbelievable.wav")

def main():
    print("=" * 60)
    print("Generating Voice Feedback Audio Files")
    print("=" * 60)
    print()
    
    SOUNDS_DIR.mkdir(parents=True, exist_ok=True)
    
    try:
        generate_good()
        generate_perfect()
        generate_awesome()
        generate_unbelievable()
        
        print()
        print("=" * 60)
        print("Voice feedback audio files generated successfully!")
        print("=" * 60)
        print()
        print("Files created:")
        print("  - voice-good.wav        (Good! feedback)")
        print("  - voice-perfect.wav     (Perfect! feedback)")
        print("  - voice-awesome.wav     (Awesome! feedback)")
        print("  - voice-unbelievable.wav (Unbelievable! feedback)")
        print()
        print("These files will play when the player achieves:")
        print("  • Good:         1 line cleared")
        print("  • Perfect:      2 lines cleared")
        print("  • Awesome:      3 lines cleared")
        print("  • Unbelievable: 4+ lines cleared")
        
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
