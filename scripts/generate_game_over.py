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
        
        raw_data = bytearray()
        for s in samples:
            clamped = max(-1.0, min(1.0, s))
            val = int(clamped * 32767)
            raw_data.extend(struct.pack('<h', val))
        wav_file.writeframes(raw_data)

def gen_sad_game_over():
    """
    Generates a classic 4-note sad game-over sound ('wah-wah-wah-waaah')
    Eb4 (311Hz) -> D4 (293Hz) -> Db4 (277Hz) -> C4 with pitch drop (261Hz -> 220Hz)
    """
    notes = [
        (311.13, 0.22, 1.0), # Eb4
        (293.66, 0.22, 1.0), # D4
        (277.18, 0.22, 1.0), # Db4
        (261.63, 0.65, 1.2), # C4 ending with pitch slide down to 200Hz
    ]
    
    all_samples = []
    
    for idx, (freq, duration, decay_mult) in enumerate(notes):
        num_samples = int(SAMPLE_RATE * duration)
        for i in range(num_samples):
            t = i / SAMPLE_RATE
            norm_t = i / num_samples
            
            # Pitch slide on last note
            curr_freq = freq
            if idx == 3:
                curr_freq = freq * (1.0 - 0.25 * (norm_t ** 1.5))
                
            # Rich retro synth waveform (sawtooth + square + harmonics)
            phase = 2 * math.pi * curr_freq * t
            val = 0.5 * math.sin(phase) + 0.25 * math.sin(phase * 2) + 0.15 * math.sin(phase * 3)
            
            # Add subtle wah-wah vibrato
            vibrato = 1.0 + 0.03 * math.sin(2 * math.pi * 6.0 * t)
            val *= vibrato
            
            # Envelope (attack + sustain + decay)
            if norm_t < 0.08:
                env = norm_t / 0.08
            else:
                env = math.exp(-3.5 * norm_t * decay_mult)
                
            all_samples.append(val * env * 0.7)
            
        # Brief 30ms silence gap between notes (except last)
        if idx < 3:
            gap_samples = int(SAMPLE_RATE * 0.03)
            all_samples.extend([0.0] * gap_samples)
            
    return all_samples

if __name__ == '__main__':
    samples = gen_sad_game_over()
    create_wav('assets/sounds/game-over.wav', samples)
    print("Generated sad game-over sound at assets/sounds/game-over.wav")
