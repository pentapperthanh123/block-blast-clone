# 🎵 DIRECT DOWNLOAD LINKS - Sound Files

## ✅ Quick Download Guide (15 files, ~20 minutes)

### 📥 How to Download from Freesound:
1. Click link → Login (free account) if needed
2. Click **"Download"** button
3. Save with new name (see below)
4. Place all files in `assets/sounds/`

---

## 🍉 WATERMELON THEME

### 1. watermelon-clear.mp3
**Link:** https://freesound.org/people/RNAn_SoundDesign/sounds/725876/
- **Original:** splash1.wav by RNAn_SoundDesign
- **License:** CC0
- **Duration:** 2.5s
- **Rename to:** `watermelon-clear.mp3`

### 2. watermelon-drop.mp3
**Link:** https://bigsoundbank.com/splash-small-1-s1529.html
- **Original:** Splash, Small #1
- **License:** CC0
- **Duration:** 3s
- **Direct MP3 download, rename to:** `watermelon-drop.mp3`

### 3. watermelon-place.mp3
**Link:** https://freesound.org/people/qubodup/sounds/737233/
- **Original:** Small Water Splash by qubodup
- **License:** CC BY (credit: qubodup)
- **Duration:** 0.5s
- **Rename to:** `watermelon-place.mp3`

---

## 🍦 ICE CREAM THEME

### 4. icecream-clear.mp3
**Link:** https://bigsoundbank.com/small-bell-2-s0293.html
- **Original:** Small bell #2
- **License:** CC0
- **Duration:** 5s
- **Direct MP3 download, rename to:** `icecream-clear.mp3`

### 5. icecream-drop.mp3
**Link:** https://freesound.org/people/Khrinx/sounds/333696/
- **Original:** Thin bell ding 1 by Khrinx
- **License:** CC0
- **Duration:** 2s
- **Rename to:** `icecream-drop.mp3`

### 6. icecream-place.mp3
**Link:** https://soundspool.com/sounds/bell003mono
- **Original:** bell003mono
- **License:** CC0
- **Duration:** 4s (trim to 0.15s in Audacity if needed)
- **Rename to:** `icecream-place.mp3`

---

## 🌊 OCEAN THEME

### 7. ocean-clear.mp3
**Link:** https://freesound.org/people/YouMightLikeThis/sounds/789888/
- **Original:** Ocean Roars And Splashes by YouMightLikeThis
- **License:** CC0
- **Duration:** 31s (trim 0:19 timestamp - nice wave splash)
- **Rename to:** `ocean-clear.mp3`

**Alternative (shorter):**
**Link:** https://freesound.org/people/qubodup/sounds/442944/
- **Original:** Ocean Wave by qubodup
- **Duration:** 7.5s
- **License:** CC BY

### 8. ocean-drop.mp3
**Link:** https://freesound.org/people/VacekH/sounds/189504/
- **Original:** water splash.wav by VacekH
- **License:** CC BY
- **Duration:** 2s
- **Rename to:** `ocean-drop.mp3`

### 9. ocean-place.mp3
**SAME AS #3** (reuse Small Water Splash)
- Copy `watermelon-place.mp3` → `ocean-place.mp3`
- Or download from: https://soundspool.com/sounds/tiny-splash
- **License:** CC0

---

## 🌅 SUNSET THEME

### 10. sunset-clear.mp3
**Link:** https://freesound.org/people/Oldome/sounds/856792/
- **Original:** Musical, percussion, wood, wood-chimes by Oldome
- **License:** CC0
- **Duration:** 1:50 (trim to best 0.4s section)
- **Rename to:** `sunset-clear.mp3`

**Alternative (cleaner):**
**Link:** https://freesound.org/people/andrescompovigo/sounds/219636/
- **Original:** woodchimes.wav
- **License:** CC BY
- **Duration:** 10s

### 11. sunset-drop.mp3
**Link:** https://freesound.org/people/Geoff-Bremner-Audio/sounds/670316/
- **Original:** Wood Knock Clean Close by Geoff-Bremner-Audio
- **License:** CC BY
- **Duration:** 0.25s
- **Rename to:** `sunset-drop.mp3`

### 12. sunset-place.mp3
**Link:** https://freesound.org/people/Flem0527/sounds/629987/
- **Original:** Knocking on Wood Door (1) by Flem0527
- **License:** CC0
- **Duration:** 0.7s
- **Rename to:** `sunset-place.mp3`

---

## 💎 GEM THEME

### 13. gem-clear.mp3
**Link:** https://soundspool.com/sounds/glasimpt-int-crystal-wine-glass-5-jvz-owsfx
- **Original:** GLASImpt-Int_Crystal Wine Glass 5 by Joshua_van_Zyl
- **License:** CC0
- **Duration:** 9s (trim to best 0.6s section)
- **Rename to:** `gem-clear.mp3`

### 14. gem-drop.mp3
**Link:** https://soundspool.com/sounds/glasimpt-int-crystal-wine-glass-2-jvz-owsfx
- **Original:** GLASImpt-Int_Crystal Wine Glass 2 by Joshua_van_Zyl
- **License:** CC0
- **Duration:** 8s (trim to 0.3s)
- **Rename to:** `gem-drop.mp3`

### 15. gem-place.mp3
**Link:** https://freesound.org/people/Halleck/sounds/4098/
- **Original:** clinks1.ogg by Halleck
- **License:** CC0
- **Duration:** 1:05 (trim to shortest 0.15s clink)
- **Rename to:** `gem-place.mp3`

---

## ⚡ SPEED OPTIMIZATION

### Reuse Strategy (Save Time):
You don't need 15 unique files. Reuse variations:

```bash
# After downloading
cp watermelon-place.mp3 ocean-place.mp3     # Both water-based
cp icecream-drop.mp3 icecream-place.mp3      # Similar bell sounds
```

**Minimum Download:** 10-12 unique files, then copy/rename for similar sounds.

---

## 🛠️ Quick Trimming (Optional)

If file too long, trim in Audacity:
1. Open file
2. Select best 0.1-0.6s segment
3. `Ctrl+T` (trim)
4. `File → Export → MP3`

---

## 📋 Final Checklist

After downloading all files:

```bash
# Verify count
ls assets/sounds/*.mp3 | wc -l
# Should output: 15

# List files
ls assets/sounds/
```

Expected files:
```
watermelon-clear.mp3  icecream-clear.mp3  ocean-clear.mp3  sunset-clear.mp3  gem-clear.mp3
watermelon-drop.mp3   icecream-drop.mp3   ocean-drop.mp3   sunset-drop.mp3   gem-drop.mp3
watermelon-place.mp3  icecream-place.mp3  ocean-place.mp3  sunset-place.mp3  gem-place.mp3
```

Then uncomment lines 16-41 in `src/constants/themeSounds.ts`

---

## 🚀 Test

```bash
npm start
# Play game and listen for sounds!
```

---

**Estimated Time:** 20-30 minutes (with trimming)
**Estimated Time (no trimming):** 10-15 minutes (use files as-is)
