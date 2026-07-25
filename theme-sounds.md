# Theme-Specific Sound Effects

## 📋 Overview

Mỗi theme có bộ âm thanh riêng biệt, tạo cảm giác đặc trưng cho từng chủ đề:
- **clear**: Âm thanh khi xóa row/column
- **dragEnd**: Âm thanh khi thả block
- **place**: Âm thanh khi block chạm board

## 🎵 Sound Characteristics

### 1. Watermelon 🍉
- **Clear**: Juicy splash (0.3s) - Tiếng nước bắn tung tóe
- **Drop**: Soft thud (0.2s) - Tiếng dưa rơi mềm
- **Place**: Light tap (0.1s) - Tiếng chạm nhẹ

**Mood**: Fresh, summery, organic

### 2. Ice Cream 🍦
- **Clear**: Sparkly chime (0.4s) - Tiếng leng keng lấp lánh
- **Drop**: Soft squish (0.2s) - Tiếng kem mềm
- **Place**: Gentle plop (0.15s) - Tiếng rơi nhẹ

**Mood**: Sweet, playful, childhood

### 3. Ocean 🌊
- **Clear**: Wave crash (0.5s) - Tiếng sóng vỗ
- **Drop**: Water splash (0.3s) - Tiếng nước bắn
- **Place**: Bubble pop (0.1s) - Tiếng bong bóng vỡ

**Mood**: Calming, fluid, natural

### 4. Sunset 🌅
- **Clear**: Wood chime (0.4s) - Tiếng chuông gỗ
- **Drop**: Wooden knock (0.2s) - Tiếng gõ gỗ
- **Place**: Soft tap (0.1s) - Tiếng chạm nhẹ

**Mood**: Warm, rustic, earthy

### 5. Gem 💎
- **Clear**: Crystal shimmer (0.6s) - Tiếng pha lê lấp lánh
- **Drop**: Glass clink (0.3s) - Tiếng thủy tinh
- **Place**: Gem tap (0.15s) - Tiếng đá quý

**Mood**: Luxurious, mystical, premium

## 🔧 Implementation

### API Usage

```typescript
import { playThemeSound, preloadThemeSounds } from '../constants/themeSounds';
import { useGameStore } from '../store/gameStore';

// Play sound
const currentTheme = useGameStore.getState().currentTheme;
await playThemeSound(currentTheme, 'clear');

// Preload when theme changes
useEffect(() => {
  preloadThemeSounds(currentTheme);
}, [currentTheme]);
```

### Integration Points

1. **Clear Sound** - Khi xóa lines
   - File: `gameStore.ts` → `commitPendingClear`
   - Trigger: Sau khi clear animation

2. **Drag End Sound** - Khi thả block
   - File: `DraggableBlock.tsx` → `onEnd` callback
   - Trigger: Khi gesture kết thúc

3. **Place Sound** - Khi block đặt thành công
   - File: `gameStore.ts` → `placeBlock`
   - Trigger: Ngay sau khi place successful

## 📁 Sound Assets Structure

```
assets/
  sounds/
    watermelon-clear.mp3
    watermelon-drop.mp3
    watermelon-place.mp3
    icecream-clear.mp3
    icecream-drop.mp3
    icecream-place.mp3
    ocean-clear.mp3
    ocean-drop.mp3
    ocean-place.mp3
    sunset-clear.mp3
    sunset-drop.mp3
    sunset-place.mp3
    gem-clear.mp3
    gem-drop.mp3
    gem-place.mp3
```

## 🎚️ Volume Guidelines

| Event | Volume | Rationale |
|-------|--------|-----------|
| clear | 0.8 | Prominent reward sound |
| dragEnd | 0.6 | Moderate feedback |
| place | 0.5 | Subtle confirmation |

## 🚀 Performance Optimization

### Sound Caching
- Sounds cached sau lần play đầu tiên
- Avoid reload mỗi lần play
- Cache key: `${theme}-${event}`

### Preloading Strategy
- Preload khi theme changes
- Background loading để không block UI
- Unload old sounds khi memory tight

### Error Handling
- Graceful fallback nếu sound file missing
- Console warning thay vì crash
- Silent fail để game vẫn playable

## 🔊 Sound Design Tips

### Duration
- **Clear**: 0.3-0.6s (có thể dài vì là reward)
- **Drop**: 0.2-0.3s (vừa phải)
- **Place**: 0.1-0.15s (nhanh, không gây phiền)

### Frequency
- **Clear**: Mid-high (celebratory)
- **Drop**: Mid (neutral feedback)
- **Place**: Low-mid (subtle confirmation)

### Format
- **MP3** (compressed, small size)
- **Bitrate**: 128kbps (good quality, reasonable size)
- **Sample Rate**: 44.1kHz (standard)

## 📝 TODO: Sound Creation

Để tạo sounds thực tế, bạn có thể:

1. **Free Resources:**
   - Freesound.org
   - Zapsplat.com
   - Mixkit.co

2. **Generate with AI:**
   - ElevenLabs Sound Effects
   - Adobe Podcast Enhance

3. **Record & Edit:**
   - Audacity (free)
   - Adobe Audition (pro)

### Search Keywords:

- Watermelon: "splash", "juicy", "fruit"
- Ice Cream: "chime", "bell", "sweet"
- Ocean: "wave", "splash", "bubble"
- Sunset: "wood", "chime", "knock"
- Gem: "crystal", "glass", "shimmer"

## ✅ Integration Checklist

- [ ] Create `assets/sounds/` folder
- [ ] Download/create 15 sound files (5 themes × 3 events)
- [ ] Integrate `playThemeSound` in gameStore
- [ ] Integrate `playThemeSound` in DraggableBlock
- [ ] Add preloading on theme change
- [ ] Test all sounds on mobile & web
- [ ] Adjust volumes based on user feedback
- [ ] Add settings toggle for sound on/off

---

**Created**: 2026-07-24  
**Status**: Ready for sound asset creation
