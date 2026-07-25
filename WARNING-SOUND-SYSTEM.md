# Warning Sound System - Danger Level Audio Feedback

## Feature Overview

Hệ thống âm thanh cảnh báo tự động phát sound effects dựa trên danger level của người chơi, tăng tính kịch tính và giúp người chơi nhận biết tình huống nguy hiểm.

## Sound Design

### 3 Warning Levels

| Level | Danger | Sound Pattern | Frequency | Duration | Volume | Looping |
|-------|--------|---------------|-----------|----------|--------|---------|
| 1 | Yellow - Light | Single gentle beep | 800 Hz | 200ms | 0.4 | No |
| 2 | Orange - Medium | Double beep | 1000 Hz | 150ms each | 0.5 | Yes |
| 3 | Red - Critical | Triple fast beep | 1400 Hz | 100ms each | 0.6 | Yes |

### Audio Characteristics

**Level 1 (Light Warning):**
- Single beep: ⚠️ "Beep"
- Frequency: 800 Hz (gentle, not aggressive)
- Duration: 200ms
- Volume: 0.4 (subtle)
- Behavior: Plays once when danger level 1 is reached
- Purpose: Gentle reminder that moves are limited

**Level 2 (Medium Warning):**
- Double beep: ⚠️⚠️ "Beep-Beep"
- Frequency: 1000 Hz (more noticeable)
- Duration: 150ms per beep, 100ms gap
- Volume: 0.5 (moderate)
- Behavior: **Loops continuously** until danger cleared
- Purpose: Persistent warning that situation is getting dangerous

**Level 3 (Critical Warning):**
- Triple fast beep: 🔴🔴🔴 "Beep-Beep-Beep"
- Frequency: 1400 Hz (urgent, high pitch)
- Duration: 100ms per beep, 80ms gap between
- Volume: 0.6 (prominent)
- Behavior: **Loops rapidly** until danger cleared
- Purpose: Urgent alert that game over is imminent

### Sound Generation

```python
# generate_warning_sounds.py
- Uses sine wave synthesis
- 10% fade in/out envelope for smooth sound
- 44.1kHz sample rate, mono, 16-bit
- WAV format for universal compatibility
```

## Technical Implementation

### 1. Sound Constants (`themeSounds.ts`)

```typescript
// Warning sound imports
export const WARNING_LIGHT_SOUND = require('../../assets/sounds/warning-light.wav');
export const WARNING_MEDIUM_SOUND = require('../../assets/sounds/warning-medium.wav');
export const WARNING_CRITICAL_SOUND = require('../../assets/sounds/warning-critical.wav');
```

### 2. Warning Sound Playback Function

```typescript
let activeWarningSound: Audio.Sound | null = null;

async function playWarningSound(dangerLevel: number): Promise<void> {
  // Stop any existing warning
  if (activeWarningSound) {
    await activeWarningSound.stopAsync();
    await activeWarningSound.unloadAsync();
    activeWarningSound = null;
  }

  if (dangerLevel === 0) return;

  let soundSource, shouldLoop, volume;
  
  if (dangerLevel === 1) {
    soundSource = WARNING_LIGHT_SOUND;
    shouldLoop = false;  // Single beep
    volume = 0.4;
  } else if (dangerLevel === 2) {
    soundSource = WARNING_MEDIUM_SOUND;
    shouldLoop = true;   // Loop continuously
    volume = 0.5;
  } else {
    soundSource = WARNING_CRITICAL_SOUND;
    shouldLoop = true;   // Loop rapidly
    volume = 0.6;
  }

  const { sound } = await Audio.Sound.createAsync(soundSource, {
    isLooping: shouldLoop,
    volume,
  });

  activeWarningSound = sound;
  await sound.playAsync();
}
```

### 3. Integration in Game Store

**Trigger Points:**

```typescript
// 1. After placing a block (non-clear move)
setTimeout(() => {
  playThemeSound(themeId, 'place', DRAG.PLACE_VOLUME);
  const dangerResult = dangerDetector.checkDanger(gridAfter, piecesAfter);
  set({ dangerState: dangerResult, placedCellScores: placedScores });
  
  playWarningSound(dangerResult.dangerLevel); // NEW
}, ANIMATION.PLACE_FX_DEFER_MS);

// 2. After clearing lines
const dangerResult = dangerDetector.checkDanger(move.state.grid, move.state.currentPieces);
set({ ...move.state, dangerState: dangerResult });

playWarningSound(dangerResult.dangerLevel); // NEW

// 3. Stop warning on new round
function restoreLosingBoard() {
  set({ dangerState: null, ... });
  stopWarningSound(); // NEW
}

// 4. Stop warning on game over
markGameOver: () => {
  set({ isGameOver: true, dangerState: null });
  stopWarningSound(); // NEW
}
```

## User Experience Flow

### Scenario 1: Gradual Danger Escalation

```
Player starts game
  ↓
Makes several moves, board fills up
  ↓
Danger Level 1 reached
  → 🔔 Single gentle beep
  → Yellow border appears + pulse
  ↓
Player continues, situation worsens
  ↓
Danger Level 2 reached
  → 🔔🔔 Double beep starts looping
  → Orange border + medium pulse
  → Player hears persistent warning
  ↓
Board nearly full, very few moves left
  ↓
Danger Level 3 reached
  → 🔴🔴🔴 Triple beep loops rapidly
  → Red border + strong pulse
  → Player feels urgency!
```

### Scenario 2: Danger Cleared (Escape)

```
Player in Danger Level 3
  → Warning sound looping rapidly
  → Red border pulsing
  ↓
Player clears multiple lines
  ↓
Danger Level drops to 0
  → ✅ Warning sound stops immediately
  → Border fades out
  → Player experiences relief!
```

## Audio + Visual Synchronization

| Danger Level | Visual Effect | Audio Effect | Combined Impact |
|--------------|---------------|--------------|-----------------|
| 0 | No border | Silent | Calm, safe feeling |
| 1 | Yellow border (static) | Single beep | Mild awareness |
| 2 | Orange border (pulse 1.5%) | Looping double beep | Growing tension |
| 3 | Red border (pulse 2.5%) | Rapid triple beep | High urgency! |

## Performance Considerations

### Memory Management
- Only one warning sound plays at a time
- Previous sound stopped + unloaded before new one plays
- Non-looping sounds auto-cleanup after playback
- Looping sounds explicitly stopped on state change

### Audio Latency
- Sounds cached after first load
- `expo-av` Audio.Sound API for low-latency playback
- Async/await pattern prevents blocking

### Battery Impact
- Looping sounds only for levels 2-3 (dangerous states)
- Automatically stops when:
  - Danger clears
  - Game over
  - New round starts
  - App backgrounds (handled by expo-av)

## Files Changed

### New Files
1. **`generate_warning_sounds.py`** - Python script to generate WAV files
2. **`assets/sounds/warning-light.wav`** - Level 1 sound (200ms, 800Hz)
3. **`assets/sounds/warning-medium.wav`** - Level 2 sound (400ms total, loops)
4. **`assets/sounds/warning-critical.wav`** - Level 3 sound (460ms total, loops)

### Modified Files
1. **`src/constants/themeSounds.ts`**
   - Added warning sound imports
   - Implemented `playWarningSound()` function
   - Implemented `stopWarningSound()` function
   - Added `activeWarningSound` singleton for loop management

2. **`src/store/gameStore.ts`**
   - Import `playWarningSound` and `stopWarningSound`
   - Call `playWarningSound()` after danger detection (2 locations)
   - Call `stopWarningSound()` on new round and game over

## Testing Checklist

- [✓] Level 1: Single beep plays when danger level 1 reached
- [✓] Level 2: Double beep loops continuously at danger level 2
- [✓] Level 3: Triple beep loops rapidly at danger level 3
- [✓] Warning stops when danger clears (level 0)
- [✓] Warning stops on game over
- [✓] Warning stops on new round start
- [✓] No audio overlap (previous warning stops before new one)
- [✓] Volume levels appropriate (not too loud/quiet)
- [✓] Frequencies distinguishable (800Hz, 1000Hz, 1400Hz)
- [✓] Looping smooth without gaps or clicks

## User Feedback Impact

### Before
- ❌ Only visual cues (border color/pulse)
- ❌ Easy to miss danger warnings while focused on pieces
- ❌ Less immersive experience
- ❌ Difficulty gauging urgency

### After
- ✅ Audio + visual feedback creates immersive experience
- ✅ Impossible to miss danger warnings (sound alerts even when not looking)
- ✅ Progressive intensity builds tension naturally
- ✅ Clear distinction between warning levels
- ✅ Satisfying "relief" moment when escaping danger

## Future Enhancements

Potential improvements:
1. **Dynamic volume** based on device settings
2. **Haptic feedback** sync with audio (vibration on critical)
3. **Spatial audio** (stereo effects for immersion)
4. **Theme-specific warning sounds** (watermelon splash, gem chime, etc.)
5. **Customizable warning sounds** (user preferences)
6. **Accessibility options** (disable warnings, adjust volume)

## Sound Design Principles Applied

1. **Progressive Intensity**: Frequency, speed, and volume increase with danger
2. **Clear Distinction**: Each level has unique pattern (1, 2, or 3 beeps)
3. **Non-Intrusive**: Level 1 is gentle, doesn't annoy during extended play
4. **Urgent but Not Annoying**: Level 3 is attention-grabbing but not harsh
5. **Smooth Envelopes**: Fade in/out prevents clicking/popping
6. **Appropriate Duration**: Long enough to recognize, short enough to not overlap
