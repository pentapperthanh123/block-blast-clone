# Plan: Refactor Modern Dynamic Audio System for Block Blast Clone

## 🎯 Goal
Overhaul the game's audio architecture to deliver modern, punchy, adaptive, and theme-immersive sound design matching top-tier titles like *Block Blast!* and *Tetris Effect*. Eliminate classic/static sound playback in favor of dynamic pitch scaling, multi-sample variety, low-latency pooling, and multi-line clear chord arpeggios.

---

## 🏗️ Architecture & Component Breakdown

### 1. Audio Engine & Manager Core (`src/constants/themeSounds.ts` & `src/engine/AudioEngine.ts`)
- **Dynamic Pitch Scaling (Combo Escalation)**:
  - Implement dynamic playback rate / pitch shifting on combo streaks (e.g. Combo 1: base pitch 1.0, Combo 2: 1.06, Combo 3: 1.12, up to Combo 8+: 1.5 pitch or semitone progression C-D-E-F-G-A-B-C).
- **Multi-Sample Sound Variety (Anti-Robotic)**:
  - Add 3-4 random micro-variations for high-frequency events (`place`, `dragTick`, `drop`) so placing blocks rapidly feels natural and non-repetitive.
- **Multi-Line Clear Progression (Crescendo & Chords)**:
  - Distinguish 1-line, 2-line, 3-line, and 4+-line clears with unique crescendo chord layers and sub-bass impact drops.
- **Low-Latency Sound Pool**:
  - Optimize `expo-av` preloading and sound instance reuse to minimize playback latency to <15ms.

### 2. Theme Sound Personas (`assets/sounds/` & `src/constants/themeSounds.ts`)
- **Watermelon (Juicy & Crisp)**: Pop, splash, fruity crunch, bubble bursts.
- **Ice Cream (Sweet & Sparkly)**: Chimes, soft plops, bell chimes.
- **Ocean (Deep & Fluid)**: Sub-bass water drops, wave bursts, bubble pops.
- **Sunset (Warm Acoustic)**: Marimba chords, wooden taps, warm kalimba tones.
- **Gem (Crystal & Resonance)**: Glass chimes, crystal resonance, high-frequency sparkle.
- **Milktea (Cozy Bouncy)**: Boba pops, straw squeaks, warm wooden blocks.
- **Love (Charming & Warm)**: Soft harp plucks, sweet chord swells.
- **Jollibee (Arcade & Energetic)**: Retro synth pops, energetic brass chimes.

### 3. State & Event Integration (`src/store/gameStore.ts` & `src/components/game/DraggableBlock.tsx`)
- Trigger pitch-scaled clear sounds based on `combo` and `linesCleared` in `commitPendingClear` and `placeBlock`.
- Trigger subtle tile-snap tick sound on drag move across grid cells.
- Trigger voice feedback + audio fanfare on Perfect Clear & New High Score.

---

## 📋 Implementation Steps

### Phase 1: Sound Asset Inventory & Categorization
- Create structured sound asset directories for each theme (`clear_1line`, `clear_multiline`, `place_variations`, `drag_tick`, `game_over_fanfare`).
- Import and map multi-sample variations per event in `themeSounds.ts`.

### Phase 2: Dynamic Audio Pitch & Combo Pitch System
- Implement `getComboPitch(comboCount: number): number` formula using semitone ratio ($2^{n/12}$).
- Extend `playThemeSound` to accept `{ pitch?: number, variation?: number, linesCount?: number }`.

### Phase 3: Game Store & UI Layer Integration
- Update `placeBlock` to pass lines count & current combo to `playThemeSound`.
- Add drag snap micro-sound in `DraggableBlock.tsx` when snapping to valid target cells.
- Enhance Game Over and High Score audio stingers with multi-layer fanfare.

### Phase 4: Performance & Latency Optimization
- Ensure async pre-warming of sound pools on theme change.
- Test memory footprint and cleanup logic to prevent memory leaks on theme switching.

---

## 🧪 Verification Plan

### Automated / Logic Verification
- Run `npm test` or typecheck `npx tsc --noEmit` to verify type safety of audio function signatures.

### Manual UX Verification
- **Combo Test**: Clear 3+ lines in consecutive turns and verify the pitch ramps up harmoniously on each clear.
- **Multi-Line Test**: Clear 1 line vs 3 lines at once and verify distinct chord intensity.
- **Theme Swap Test**: Change themes mid-game and verify audio switches seamlessly without lag or audio popping.
- **Placement Repetition**: Place 5 blocks rapidly and confirm variation prevents machine-gun effect.
