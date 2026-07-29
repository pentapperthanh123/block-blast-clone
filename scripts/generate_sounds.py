import math
import struct
import wave
import os
import random

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

def gen_rich_note(freq, duration, type='bell'):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    
    # Define harmonic profiles
    if type == 'bell':
        # Crystalline chime: fundamental + high partials
        harmonics = [(1.0, 1.0), (2.0, 0.45), (2.76, 0.5), (3.0, 0.35), (4.0, 0.2), (5.4, 0.25)]
        decay_rate = 6.0
    elif type == 'arcade':
        # Bright square/saw synth chord note
        harmonics = [(1.0, 0.8), (2.0, 0.55), (3.0, 0.4), (4.0, 0.25)]
        decay_rate = 7.0
    elif type == 'warm':
        # Soft sine-like bell with low harmonics
        harmonics = [(1.0, 1.0), (2.0, 0.3), (3.0, 0.1)]
        decay_rate = 5.0
    else: # default sine-harmonic
        harmonics = [(1.0, 1.0), (2.0, 0.3)]
        decay_rate = 6.0

    for i in range(num_samples):
        t = i / SAMPLE_RATE
        val = 0.0
        for ratio, amp in harmonics:
            val += amp * math.sin(2 * math.pi * freq * ratio * t)
        
        # Exponential decay
        env = math.exp(-decay_rate * (i / num_samples))
        # Fade in (5ms)
        fade_in = min(1.0, i / (0.005 * SAMPLE_RATE))
        samples.append(val * env * fade_in)
    return samples

def gen_rich_arpeggio(notes, note_duration=0.32, delay_sec=0.04, note_type='bell', volume=0.5):
    total_duration = delay_sec * (len(notes) - 1) + note_duration
    total_samples = int(SAMPLE_RATE * total_duration)
    mix = [0.0] * total_samples
    
    for idx, freq in enumerate(notes):
        start_sample = int(idx * delay_sec * SAMPLE_RATE)
        samples = gen_rich_note(freq, note_duration, note_type)
        for i, val in enumerate(samples):
            pos = start_sample + i
            if pos < total_samples:
                mix[pos] += val * 0.35 * volume
                
    return mix

def gen_pop(freq_start=380, freq_end=100, duration=0.08, tone_type='sine'):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    phase = 0.0
    random.seed(42) # Deterministic noise
    
    for i in range(num_samples):
        t = i / num_samples
        # Rapid exponential frequency drop
        current_freq = freq_start * math.pow(freq_end / freq_start, t)
        phase += 2 * math.pi * current_freq / SAMPLE_RATE
        
        if tone_type == 'square':
            s = 1.0 if math.sin(phase) > 0 else -1.0
            s += 0.4 * (1.0 if math.sin(phase * 2.0) > 0 else -1.0)
        elif tone_type == 'triangle':
            s = 2.0 * abs(2.0 * (phase / (2 * math.pi) - math.floor(phase / (2 * math.pi) + 0.5))) - 1.0
        else:
            s = math.sin(phase) + 0.4 * math.sin(phase * 2.0)
            
        # Click sound (filtered noise transient at the start)
        noise = 0.0
        if i < int(SAMPLE_RATE * 0.006): # 6ms click
            noise = (random.random() * 2 - 1) * 0.4 * (1.0 - i / (SAMPLE_RATE * 0.006))
            
        env = math.exp(-8.0 * t) # fast decay
        samples.append((s + noise) * env * 0.6)
    return samples

def gen_wooden_impact(freq=260, duration=0.09):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    random.seed(42)
    
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Body (fundamental + 2.76x and 5.4x partials for realistic wood block)
        body = (math.sin(2 * math.pi * freq * t) * 0.75 + 
                math.sin(2 * math.pi * freq * 2.76 * t) * 0.3 +
                math.sin(2 * math.pi * freq * 5.4 * t) * 0.15)
        
        # Click transient at start
        click = 0.0
        if i < int(SAMPLE_RATE * 0.004):
            click = (random.random() * 2 - 1) * 0.5 * (1.0 - i / (SAMPLE_RATE * 0.004))
            
        env = math.exp(-32.0 * t) # very fast decay
        samples.append((body + click) * env * 0.8)
    return samples

def gen_crystal_clink(freq=880, duration=0.14):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    for i in range(num_samples):
        t = i / SAMPLE_RATE
        # Crystal shimmer: fundamental + high harmonics (2.0x, 3.01x, 5.2x, 7.8x)
        tone = (math.sin(2 * math.pi * freq * t) * 0.5 +
                math.sin(2 * math.pi * freq * 2.0 * t) * 0.35 +
                math.sin(2 * math.pi * freq * 3.01 * t) * 0.25 +
                math.sin(2 * math.pi * freq * 5.2 * t) * 0.15 +
                math.sin(2 * math.pi * freq * 7.8 * t) * 0.1)
        env = math.exp(-14.0 * t)
        samples.append(tone * env * 0.75)
    return samples

def gen_bubble_pop(freq=300, duration=0.08):
    num_samples = int(SAMPLE_RATE * duration)
    samples = []
    phase = 0.0
    for i in range(num_samples):
        t = i / num_samples
        # Bubble pitch rises rapidly
        pitch = freq * (1.0 + 1.2 * math.sin(0.5 * math.pi * t))
        phase += 2 * math.pi * pitch / SAMPLE_RATE
        s = math.sin(phase) + 0.3 * math.sin(phase * 2.0)
        env = math.exp(-12.0 * t) # fast pop decay
        samples.append(s * env * 0.8)
    return samples

def main():
    sounds_dir = 'assets/sounds'

    themes = {
        'watermelon': {
            'place': gen_pop(380, 110, 0.08, 'sine'),
            'drop': gen_pop(220, 90, 0.09, 'sine'),
            'clear': gen_rich_arpeggio([523.25, 659.25, 783.99, 1046.50], 0.32, 0.035, 'bell', 0.8), # C5-E5-G5-C6
            'dragstart': gen_pop(520, 180, 0.05, 'sine'),
        },
        'icecream': {
            'place': gen_crystal_clink(587.33, 0.09), # D5 chime
            'drop': gen_pop(320, 150, 0.08, 'sine'),
            'clear': gen_rich_arpeggio([659.25, 830.61, 987.77, 1318.51], 0.35, 0.04, 'bell', 0.8), # E5-G#5-B5-E6
            'dragstart': gen_crystal_clink(987.77, 0.06),
        },
        'ocean': {
            'place': gen_bubble_pop(240, 0.08),
            'drop': gen_pop(180, 65, 0.10, 'sine'),
            'clear': gen_rich_arpeggio([392.00, 493.88, 587.33, 783.99], 0.38, 0.045, 'warm', 0.85), # G4-B4-D5-G5
            'dragstart': gen_bubble_pop(480, 0.05),
        },
        'sunset': {
            'place': gen_wooden_impact(320, 0.08),
            'drop': gen_wooden_impact(220, 0.09),
            'clear': gen_rich_arpeggio([440.00, 554.37, 659.25, 880.00], 0.35, 0.04, 'warm', 0.8), # A4-C#5-E5-A5
            'dragstart': gen_wooden_impact(440, 0.05),
        },
        'milktea': {
            'place': gen_bubble_pop(340, 0.07),
            'drop': gen_pop(260, 120, 0.08, 'sine'),
            'clear': gen_rich_arpeggio([493.88, 622.25, 739.99, 987.77], 0.35, 0.04, 'warm', 0.8), # B4-D#5-F#5-B5
            'dragstart': gen_bubble_pop(520, 0.05),
        },
        'love': {
            'place': gen_crystal_clink(698.46, 0.09), # F5 chime
            'drop': gen_pop(280, 140, 0.08, 'sine'),
            'clear': gen_rich_arpeggio([349.23, 440.00, 523.25, 698.46], 0.38, 0.04, 'bell', 0.8), # F4-A4-C5-F5
            'dragstart': gen_crystal_clink(880.00, 0.06),
        },
        'jollibee': {
            'place': gen_pop(440, 180, 0.07, 'square'), # Arcade synth
            'drop': gen_pop(300, 100, 0.08, 'triangle'),
            'clear': gen_rich_arpeggio([523.25, 659.25, 783.99, 1046.50], 0.30, 0.025, 'arcade', 0.8),
            'dragstart': gen_pop(659.25, 300, 0.05, 'square'),
        },
        'coffee': {
            'place': gen_wooden_impact(240, 0.09),
            'drop': gen_pop(200, 110, 0.08, 'sine'),
            'clear': gen_rich_arpeggio([329.63, 415.30, 493.88, 659.25], 0.38, 0.04, 'warm', 0.8),
            'dragstart': gen_wooden_impact(380, 0.05),
        },
        'matcha': {
            'place': gen_wooden_impact(380, 0.08),
            'drop': gen_pop(300, 140, 0.07, 'sine'),
            'clear': gen_rich_arpeggio([440.00, 523.25, 659.25, 880.00], 0.36, 0.045, 'warm', 0.8),
            'dragstart': gen_wooden_impact(480, 0.05),
        },
        'beer': {
            'place': gen_bubble_pop(450, 0.06),
            'drop': gen_crystal_clink(784, 0.08),
            'clear': gen_rich_arpeggio([523.25, 659.25, 783.99, 1046.50], 0.32, 0.03, 'bell', 0.8),
            'dragstart': gen_bubble_pop(620, 0.05),
        },
    }

    for theme_name, events in themes.items():
        for event_name, samples in events.items():
            filename = f"{sounds_dir}/{theme_name}-{event_name}.wav"
            create_wav(filename, samples)
            print(f"Generated: {filename}")

    # Generate global UI sounds
    create_wav(f"{sounds_dir}/game-start.wav", gen_rich_arpeggio([523.25, 659.25, 783.99, 1046.50, 1318.51], 0.38, 0.05, 'bell', 0.9))
    create_wav(f"{sounds_dir}/game-over.wav", gen_rich_arpeggio([440.00, 415.30, 392.00, 349.23, 293.66], 0.48, 0.07, 'warm', 0.85))
    create_wav(f"{sounds_dir}/new-record.wav", gen_rich_arpeggio([523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98], 0.45, 0.03, 'bell', 0.95))

    # Generate combo sound effects (zero latency chimes)
    create_wav(f"{sounds_dir}/good.wav", gen_rich_arpeggio([523.25, 659.25], 0.30, 0.06, 'bell', 0.85)) # C5 -> E5
    create_wav(f"{sounds_dir}/perfect.wav", gen_rich_arpeggio([523.25, 659.25, 783.99], 0.32, 0.055, 'bell', 0.9)) # C5 -> E5 -> G5
    create_wav(f"{sounds_dir}/awesome.wav", gen_rich_arpeggio([523.25, 659.25, 783.99, 1046.50], 0.34, 0.045, 'bell', 0.95)) # C5-E5-G5-C6
    create_wav(f"{sounds_dir}/unbelievable.wav", gen_rich_arpeggio([523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98], 0.38, 0.035, 'bell', 1.0)) # C5-E5-G5-C6-E6-G6

    print("All theme audio and combo chimes generated successfully!")

if __name__ == '__main__':
    main()
