import math
import struct
import wave
import os

SAMPLE_RATE = 44100

def create_wav(filename, samples, num_channels=1, sample_width=2):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with wave.open(filename, 'wb') as wav_file:
        wav_file.setnchannels(num_channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(SAMPLE_RATE)
        
        # Clamp & pack 16-bit PCM
        raw_data = bytearray()
        for s in samples:
            clamped = max(-1.0, min(1.0, s))
            val = int(clamped * 32767)
            raw_data.extend(struct.pack('<h', val))
        wav_file.writeframes(raw_data)

def gen_sine(freq, duration, start_phase=0.0):
    num_samples = int(SAMPLE_RATE * duration)
    return [math.sin(2 * math.pi * freq * i / SAMPLE_RATE + start_phase) for i in range(num_samples)]

def apply_envelope(samples, attack_sec=0.005, decay_sec=0.05, release_sec=0.05, sustain_level=0.3):
    total = len(samples)
    attack_s = int(attack_sec * SAMPLE_RATE)
    decay_s = int(decay_sec * SAMPLE_RATE)
    release_s = int(release_sec * SAMPLE_RATE)
    sustain_s = max(0, total - attack_s - decay_s - release_s)

    out = []
    for i, s in enumerate(samples):
        if i < attack_s:
            env = i / attack_s if attack_s > 0 else 1.0
        elif i < attack_s + decay_s:
            t = (i - attack_s) / decay_s if decay_s > 0 else 1.0
            env = 1.0 - (1.0 - sustain_level) * t
        elif i < attack_s + decay_s + sustain_s:
            env = sustain_level
        else:
            t = (i - attack_s - decay_s - sustain_s) / release_s if release_s > 0 else 1.0
            env = sustain_level * (1.0 - max(0.0, min(1.0, t)))
        out.append(s * env)
    return out

def gen_pop(freq_start=350, freq_end=80, duration=0.08, tone_type='sine'):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    phase = 0.0
    for i in range(num_samples):
        t = i / num_samples
        # Exponential pitch drop
        current_freq = freq_start * math.pow(freq_end / freq_start, t)
        phase += 2 * math.pi * current_freq / SAMPLE_RATE
        if tone_type == 'square':
            s = 1.0 if math.sin(phase) > 0 else -1.0
        elif tone_type == 'triangle':
            s = 2.0 * abs(2.0 * (phase / (2 * math.pi) - math.floor(phase / (2 * math.pi) + 0.5))) - 1.0
        else:
            s = math.sin(phase)
        
        # Fast exponential decay envelope
        env = math.exp(-6.0 * t)
        samples.append(s * env * 0.8)
    return samples

def gen_wooden_impact(freq=260, duration=0.09):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Body (fundamental + 2.7x harmonic for wood block characteristic)
        body = math.sin(2 * math.pi * freq * t) * 0.7 + math.sin(2 * math.pi * freq * 2.76 * t) * 0.3
        # Fast thud envelope
        env = math.exp(-35.0 * t)
        samples.append(body * env)
    return samples

def gen_crystal_clink(freq=880, duration=0.14):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Crystal shimmer: fundamental + high harmonics (2x, 3.01x, 5.2x)
        tone = (math.sin(2 * math.pi * freq * t) * 0.5 +
                math.sin(2 * math.pi * freq * 2.0 * t) * 0.3 +
                math.sin(2 * math.pi * freq * 3.01 * t) * 0.2 +
                math.sin(2 * math.pi * freq * 5.2 * t) * 0.15)
        env = math.exp(-18.0 * t)
        samples.append(tone * env * 0.7)
    return samples

def gen_bubble_pop(freq=300, duration=0.08):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(num_samples):
        t = i / num_samples
        # Pitch rises slightly then drops
        pitch = freq * (1.0 + 0.3 * math.sin(math.pi * t))
        s = math.sin(2 * math.pi * pitch * (i / SAMPLE_RATE))
        env = math.exp(-8.0 * t)
        samples.append(s * env)
    return samples

def gen_chord(notes, duration=0.35, arpeggio_delay=0.04):
    total_len = int(SAMPLE_RATE * (duration + len(notes) * arpeggio_delay))
    mix = [0.0] * total_len
    
    for idx, freq in enumerate(notes):
        start_sample = int(idx * arpeggio_delay * SAMPLE_RATE)
        note_samples = int(duration * SAMPLE_RATE)
        for i in range(note_samples):
            if start_sample + i < total_len:
                t = i / SAMPLE_RATE
                s = math.sin(2 * math.pi * freq * t) + 0.3 * math.sin(2 * math.pi * freq * 2.0 * t)
                env = math.exp(-6.0 * (i / note_samples))
                mix[start_sample + i] += s * env * 0.3
    return mix

def main():
    sounds_dir = 'assets/sounds'

    themes = {
        'watermelon': {
            'place': gen_pop(380, 110, 0.08, 'sine'),
            'drop': gen_pop(220, 90, 0.09, 'sine'),
            'clear': gen_chord([523.25, 659.25, 783.99, 1046.50], 0.32, 0.035), # C5-E5-G5-C6
            'dragstart': gen_pop(520, 180, 0.05, 'sine'),
        },
        'icecream': {
            'place': gen_crystal_clink(587.33, 0.09), # D5 sweet chime
            'drop': gen_pop(320, 150, 0.08, 'sine'),
            'clear': gen_chord([659.25, 830.61, 987.77, 1318.51], 0.35, 0.04), # E5-G#5-B5-E6
            'dragstart': gen_crystal_clink(987.77, 0.06),
        },
        'ocean': {
            'place': gen_bubble_pop(240, 0.08),
            'drop': gen_pop(180, 65, 0.10, 'sine'),
            'clear': gen_chord([392.00, 493.88, 587.33, 783.99], 0.38, 0.045), # G4-B4-D5-G5
            'dragstart': gen_bubble_pop(480, 0.05),
        },
        'sunset': {
            'place': gen_wooden_impact(320, 0.08),
            'drop': gen_wooden_impact(220, 0.09),
            'clear': gen_chord([440.00, 554.37, 659.25, 880.00], 0.35, 0.04), # A4-C#5-E5-A5
            'dragstart': gen_wooden_impact(440, 0.05),
        },
        'gem': {
            'place': gen_crystal_clink(880, 0.10),
            'drop': gen_crystal_clink(659.25, 0.11),
            'clear': gen_chord([587.33, 739.99, 880.00, 1174.66], 0.40, 0.03), # D5-F#5-A5-D6
            'dragstart': gen_crystal_clink(1174.66, 0.06),
        },
        'milktea': {
            'place': gen_bubble_pop(340, 0.07),
            'drop': gen_pop(260, 120, 0.08, 'sine'),
            'clear': gen_chord([493.88, 622.25, 739.99, 987.77], 0.35, 0.04), # B4-D#5-F#5-B5
            'dragstart': gen_bubble_pop(520, 0.05),
        },
        'love': {
            'place': gen_crystal_clink(698.46, 0.09), # F5 warm chime
            'drop': gen_pop(280, 140, 0.08, 'sine'),
            'clear': gen_chord([349.23, 440.00, 523.25, 698.46], 0.38, 0.04), # F4-A4-C5-F5
            'dragstart': gen_crystal_clink(880.00, 0.06),
        },
        'jollibee': {
            'place': gen_pop(440, 180, 0.07, 'square'), # Arcade synth pop
            'drop': gen_pop(300, 100, 0.08, 'triangle'),
            'clear': gen_chord([523.25, 659.25, 783.99, 1046.50], 0.30, 0.025), # Fast arcade arpeggio
            'dragstart': gen_pop(659.25, 300, 0.05, 'square'),
        },
        'coffee': {
            'place': gen_wooden_impact(240, 0.09), # Warm roasted espresso thud
            'drop': gen_pop(200, 110, 0.08, 'sine'),
            'clear': gen_chord([329.63, 415.30, 493.88, 659.25], 0.38, 0.04), # Cozy cafe E4-G#4-B4-E5 chord
            'dragstart': gen_wooden_impact(380, 0.05),
        },
        'matcha': {
            'place': gen_wooden_impact(380, 0.08), # Bamboo whisk tap
            'drop': gen_pop(300, 140, 0.07, 'sine'),
            'clear': gen_chord([440.00, 523.25, 659.25, 880.00], 0.36, 0.045), # Zen matcha chime
            'dragstart': gen_wooden_impact(480, 0.05),
        },
        'beer': {
            'place': gen_bubble_pop(450, 0.06), # Fizzy beer bubble pop
            'drop': gen_crystal_clink(784, 0.08), # Bottle clink
            'clear': gen_chord([523.25, 659.25, 783.99, 1046.50], 0.32, 0.03), # Celebratory cheer
            'dragstart': gen_bubble_pop(620, 0.05),
        },
    }

    for theme_name, events in themes.items():
        for event_name, samples in events.items():
            filename = f"{sounds_dir}/{theme_name}-{event_name}.wav"
            create_wav(filename, samples)
            print(f"Generated: {filename}")

    # Generate global sounds
    create_wav(f"{sounds_dir}/game-start.wav", gen_chord([523.25, 659.25, 783.99, 1046.50], 0.4, 0.05))
    create_wav(f"{sounds_dir}/game-over.wav", gen_chord([440.00, 415.30, 392.00, 349.23], 0.6, 0.08))
    create_wav(f"{sounds_dir}/new-record.wav", gen_chord([523.25, 659.25, 783.99, 1046.50, 1318.51], 0.6, 0.03))

    print("All theme audio generated successfully!")

if __name__ == '__main__':
    main()
