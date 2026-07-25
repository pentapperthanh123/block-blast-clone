"""Generate Jollibee theme sounds + new record fanfare."""

import math
import struct
import wave
from pathlib import Path

SOUNDS_DIR = Path("assets/sounds")


def generate_tone(frequency, duration, sample_rate=44100, fade_ms=20, volume=0.5):
    num_samples = int(sample_rate * duration)
    fade_samples = int(sample_rate * fade_ms / 1000)
    samples = []
    for i in range(num_samples):
        sample = math.sin(2 * math.pi * frequency * i / sample_rate)
        decay = math.exp(-2.2 * i / num_samples)
        sample *= decay
        if i < fade_samples:
            sample *= i / fade_samples
        if i > num_samples - fade_samples:
            sample *= (num_samples - i) / fade_samples
        samples.append(int(sample * 32767 * volume))
    return samples


def generate_chord(frequencies, duration, volume=0.35):
    num_samples = int(44100 * duration)
    fade_samples = int(44100 * 0.02)
    samples = []
    for i in range(num_samples):
        sample = sum(
            math.sin(2 * math.pi * f * i / 44100) for f in frequencies
        ) / len(frequencies)
        decay = math.exp(-2.5 * i / num_samples)
        sample *= decay
        if i < fade_samples:
            sample *= i / fade_samples
        if i > num_samples - fade_samples:
            sample *= (num_samples - i) / fade_samples
        samples.append(int(sample * 32767 * volume))
    return samples


def save_wav(filename, samples, sample_rate=44100):
    filepath = SOUNDS_DIR / filename
    with wave.open(str(filepath), "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        for sample in samples:
            wav_file.writeframes(struct.pack("<h", sample))
    print(f"  OK {filename} ({filepath.stat().st_size / 1024:.1f} KB)")


def main():
    SOUNDS_DIR.mkdir(parents=True, exist_ok=True)
    print("Generating Jollibee + new-record sounds...")

    # Cheerful mid-high tones (fast-food sparkle)
    save_wav("jollibee-clear.wav", generate_tone(720, 0.38, volume=0.48))
    save_wav("jollibee-drop.wav", generate_tone(520, 0.24, volume=0.42))
    save_wav("jollibee-place.wav", generate_tone(640, 0.14, volume=0.4))

    # Record fanfare — ascending major arpeggio + sparkle chord
    record = []
    record.extend(generate_chord([523.25, 659.25, 783.99], 0.22, volume=0.42))
    record.extend(generate_chord([659.25, 783.99, 987.77], 0.22, volume=0.45))
    record.extend(generate_chord([783.99, 987.77, 1174.66], 0.35, volume=0.5))
    save_wav("new-record.wav", record)

    print("Done.")


if __name__ == "__main__":
    main()
