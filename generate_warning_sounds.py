#!/usr/bin/env python3
"""
Generate warning sounds for danger levels
- Light: Single gentle beep (level 1)
- Medium: Repeating moderate beep (level 2)
- Critical: Fast urgent beep (level 3)
"""

import wave
import math
import struct

def generate_warning_sound(filename, frequency, duration_ms, volume=0.5, beep_count=1, beep_gap_ms=0):
    """
    Generate warning sound with specified parameters
    
    Args:
        filename: Output WAV filename
        frequency: Beep frequency in Hz
        duration_ms: Duration of each beep in milliseconds
        volume: Volume (0.0 to 1.0)
        beep_count: Number of beeps
        beep_gap_ms: Gap between beeps in milliseconds
    """
    sample_rate = 44100
    channels = 1
    sample_width = 2
    
    # Calculate samples
    beep_samples = int(sample_rate * duration_ms / 1000)
    gap_samples = int(sample_rate * beep_gap_ms / 1000)
    
    # Open WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(sample_rate)
        
        for beep_idx in range(beep_count):
            # Generate beep with envelope
            for i in range(beep_samples):
                # Sine wave
                sine_value = math.sin(2.0 * math.pi * frequency * i / sample_rate)
                
                # Envelope (fade in/out for smooth sound)
                envelope = 1.0
                fade_duration = int(beep_samples * 0.1)  # 10% fade
                if i < fade_duration:
                    envelope = i / fade_duration
                elif i > beep_samples - fade_duration:
                    envelope = (beep_samples - i) / fade_duration
                
                # Apply volume and envelope
                sample = int(sine_value * volume * envelope * 32767)
                wav_file.writeframes(struct.pack('<h', sample))
            
            # Add gap between beeps (if not last beep)
            if beep_idx < beep_count - 1 and gap_samples > 0:
                for i in range(gap_samples):
                    wav_file.writeframes(struct.pack('<h', 0))

# Generate warning sounds
print("Generating warning sounds...")

# Level 1: Light warning - single gentle beep
print("Generating warning-light.wav...")
generate_warning_sound(
    'assets/sounds/warning-light.wav',
    frequency=800,      # Medium-low frequency (gentle)
    duration_ms=200,    # Short beep
    volume=0.4,         # Lower volume
    beep_count=1        # Single beep
)
print("OK warning-light.wav")

# Level 2: Medium warning - double beep, repeatable
print("Generating warning-medium.wav...")
generate_warning_sound(
    'assets/sounds/warning-medium.wav',
    frequency=1000,     # Medium frequency
    duration_ms=150,    # Short beeps
    volume=0.5,         # Medium volume
    beep_count=2,       # Double beep
    beep_gap_ms=100     # Short gap
)
print("OK warning-medium.wav")

# Level 3: Critical warning - triple fast beep, repeatable
print("Generating warning-critical.wav...")
generate_warning_sound(
    'assets/sounds/warning-critical.wav',
    frequency=1400,     # Higher frequency (urgent)
    duration_ms=100,    # Very short beeps
    volume=0.6,         # Higher volume
    beep_count=3,       # Triple beep
    beep_gap_ms=80      # Very short gap
)
print("OK warning-critical.wav")

print("\nAll warning sounds generated successfully!")
print("\nSound characteristics:")
print("- Light (Lv1): Single gentle beep, 800Hz, 200ms, non-looping")
print("- Medium (Lv2): Double beep, 1000Hz, 150ms each, loops")
print("- Critical (Lv3): Triple fast beep, 1400Hz, 100ms each, loops")
