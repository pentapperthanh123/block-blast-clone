# 🎵 Sound Asset Generation Guide

## Quick Start - 3 Methods to Get Sounds

### Method 1: Free Sound Libraries (FASTEST - Recommended)

#### 🔊 Freesound.org
**Best for**: Real, organic sounds

```
Search Terms:
- Watermelon: "splash water juicy" "fruit squish" "juice splash"
- Ice Cream: "bell chime" "sparkle" "sweet sound"
- Ocean: "wave splash" "water drop" "bubble pop"
- Sunset: "wood chime" "knock wood" "bamboo tap"
- Gem: "glass clink" "crystal" "shimmer"
```

**Steps:**
1. Go to freesound.org
2. Search term (e.g., "splash water")
3. Filter: Duration < 1s, License: CC0 (Public Domain)
4. Download MP3
5. Rename to match our naming (e.g., `watermelon-clear.mp3`)

#### 🎶 Zapsplat.com
**Best for**: High-quality game sounds

```
Categories:
- Clear sounds: "Game UI" > "Success" > "Positive Feedback"
- Drop sounds: "Game Objects" > "Impact" > "Soft"
- Place sounds: "Game UI" > "Click" > "Subtle"
```

#### 🎯 Mixkit.co/free-sound-effects
**Best for**: Pre-made game assets

Browse: "Game Assets" section

---

### Method 2: AI Sound Generation

#### ElevenLabs Sound Effects (FREE tier available)
**URL**: elevenlabs.io/sound-effects

**Prompts to use:**

**Watermelon Theme:**
```
Clear: "Juicy watermelon splash with seeds, refreshing summer fruit sound"
Drop: "Soft watermelon thud on surface, gentle impact"
Place: "Light tap on fresh watermelon rind"
```

**Ice Cream Theme:**
```
Clear: "Sparkly ice cream bell chime, magical dessert sound with sweet shimmer"
Drop: "Soft ice cream scoop plop, creamy gentle squish"
Place: "Gentle ice cream cone tap, light dessert sound"
```

**Ocean Theme:**
```
Clear: "Ocean wave crashing on beach, powerful water splash"
Drop: "Water splash in ocean, medium impact"
Place: "Small bubble popping underwater, subtle sound"
```

**Sunset Theme:**
```
Clear: "Wooden wind chime melody, warm resonant tones"
Drop: "Wood block knock, warm organic sound"
Place: "Soft bamboo tap, gentle percussion"
```

**Gem Theme:**
```
Clear: "Crystal glass shimmer with magical sparkle, luxurious sound"
Drop: "Gemstone clinking on glass surface, elegant impact"
Place: "Diamond tapping crystal, subtle precious sound"
```

---

### Method 3: Record & Edit (ADVANCED)

#### Tools Needed:
- **Audacity** (Free) - audacityteam.org
- Microphone (smartphone OK)

#### Recording Tips:

1. **Watermelon Sounds:**
   - Record: Squeeze sponge in water for splash
   - Drop: Tap pillow with soft object
   
2. **Ice Cream Sounds:**
   - Record: Small bell or wine glass tap
   - Drop: Squeeze marshmallow
   
3. **Ocean Sounds:**
   - Record: Pour water from bottle
   - Drop: Water splash in sink

4. **Sunset Sounds:**
   - Record: Tap wooden spoon on cutting board
   - Drop: Knock on wooden table

5. **Gem Sounds:**
   - Record: Tap wine glass edge
   - Drop: Glass beads in jar

#### Editing in Audacity:
1. Import recording
2. Select best 0.1-0.6s segment
3. Effects > Normalize (to -1.0 dB)
4. Effects > Fade In/Fade Out (smooth edges)
5. File > Export > MP3 (128kbps)

---

## 📋 Sound Specifications Checklist

| Property | Value | Why |
|----------|-------|-----|
| Format | MP3 | Universal, small size |
| Bitrate | 128kbps | Good quality, <50KB per file |
| Sample Rate | 44.1kHz | Standard audio |
| Channels | Mono | Save space, sufficient for SFX |
| Duration | 0.1-0.6s | Quick feedback, no overlap |
| Volume | Normalized to -1dB | Consistent loudness |

---

## 🎯 Quick Action Plan (20 minutes)

### Step 1: Download from Freesound (10 min)

1. Go to freesound.org
2. Search "splash" → Download 3 variations
3. Search "chime" → Download 3 variations  
4. Search "click" → Download 3 variations
5. You now have base sounds for all themes

### Step 2: Batch Rename (2 min)

```bash
# In assets/sounds/ folder
# Rename downloaded files to match our naming:

splash-1.mp3 → watermelon-clear.mp3
splash-2.mp3 → ocean-clear.mp3
chime-1.mp3 → icecream-clear.mp3
# ... etc
```

### Step 3: Quick Edit if Needed (8 min)

- Open in Audacity
- Trim to 0.1-0.6s
- Normalize
- Export as MP3

### Step 4: Test in App

```bash
# Uncomment require() statements in themeSounds.ts
# Run: npm start
```

---

## 🔊 Sound Pairing Strategy

Since we have 5 themes × 3 events = 15 files, you can **reuse variations**:

### Efficient Pairing:

**Find 5 "Clear" sounds** (longest, most prominent):
1. Splash (watermelon)
2. Chime (ice cream)
3. Wave (ocean)
4. Wood chime (sunset)
5. Crystal (gem)

**Find 5 "Drop" sounds** (medium):
- Same categories, shorter/softer versions

**Find 5 "Place" sounds** (shortest):
- Quick taps from same categories

---

## 🎼 Example Full Set (Copy-Paste Search Terms)

### Freesound.org Search Queue:

```
1. "juice splash short" → watermelon-clear.mp3
2. "bell chime sparkle" → icecream-clear.mp3
3. "wave crash short" → ocean-clear.mp3
4. "wood chime" → sunset-clear.mp3
5. "crystal glass ping" → gem-clear.mp3

6. "soft thud" → watermelon-drop.mp3
7. "squish soft" → icecream-drop.mp3
8. "water splash small" → ocean-drop.mp3
9. "wood knock" → sunset-drop.mp3
10. "glass clink" → gem-drop.mp3

11. "tap soft short" → watermelon-place.mp3
12. "plop" → icecream-place.mp3
13. "bubble pop" → ocean-place.mp3
14. "tap wood light" → sunset-place.mp3
15. "tap crystal" → gem-place.mp3
```

---

## ✅ Verification

After adding files, verify:

```bash
# Check all files exist
ls assets/sounds/*.mp3 | wc -l
# Should output: 15

# Uncomment require() in themeSounds.ts (lines 16-41)
# Run type check
npx tsc --noEmit

# Test in app
npm start
```

---

**Estimated Total Time**: 20-30 minutes for full set using freesound.org

**Budget Option**: All sounds are FREE (CC0 license)

**Pro Option**: ElevenLabs AI ($5/month for premium quality)
