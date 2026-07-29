#!/usr/bin/env python3
"""
Download free CC0 game sounds from Kenney.nl (via GitHub mirror)
and map them to Block Blast game sound categories.

Source: https://github.com/Calinou/kenney-ui-audio (CC0 License)
All sounds are from Kenney.nl - Public Domain (CC0)
"""

import urllib.request
import os
import shutil
from pathlib import Path

SOUNDS_DIR = Path("assets/sounds")
BASE_URL = "https://raw.githubusercontent.com/Calinou/kenney-ui-audio/master/addons/kenney_ui_audio"

# Available Kenney UI Audio files
KENNEY_FILES = [
    "click1.wav", "click2.wav", "click3.wav", "click4.wav", "click5.wav",
    "mouseclick1.wav", "mouserelease1.wav",
    "rollover1.wav", "rollover2.wav", "rollover3.wav", "rollover4.wav", "rollover5.wav", "rollover6.wav",
    "switch1.wav", "switch2.wav", "switch3.wav", "switch4.wav", "switch5.wav",
    "switch6.wav", "switch7.wav", "switch8.wav", "switch9.wav", "switch10.wav",
    "switch11.wav", "switch12.wav", "switch13.wav", "switch14.wav", "switch15.wav",
    "switch16.wav", "switch17.wav", "switch18.wav", "switch19.wav", "switch20.wav",
    "switch21.wav", "switch22.wav", "switch23.wav", "switch24.wav", "switch25.wav",
]

# ============================================================
# SOUND MAPPING: game event → Kenney source file
# Carefully chosen for audio-thematic fit
# ============================================================
SOUND_MAP = {
    # === PLACE sounds (block dropped on board) - short, crisp click ===
    "watermelon-place.wav":  "click2.wav",   # light click
    "icecream-place.wav":    "click3.wav",   # sweet light click
    "ocean-place.wav":       "click1.wav",   # soft click
    "sunset-place.wav":      "switch14.wav", # wood-like thud
    "milktea-place.wav":     "click4.wav",   # soft pop
    "love-place.wav":        "click5.wav",   # delicate click
    "jollibee-place.wav":    "mouseclick1.wav", # arcade button
    "coffee-place.wav":      "switch12.wav", # heavier tap
    "matcha-place.wav":      "switch13.wav", # bamboo-like tap
    "beer-place.wav":        "mouserelease1.wav", # satisfying thud

    # === DROP sounds (block placed permanently) - medium, satisfying ===
    "watermelon-drop.wav":   "switch3.wav",  # solid medium
    "icecream-drop.wav":     "switch7.wav",  # sweet medium
    "ocean-drop.wav":        "switch9.wav",  # deeper
    "sunset-drop.wav":       "switch5.wav",  # warm
    "milktea-drop.wav":      "switch11.wav", # bubbly
    "love-drop.wav":         "switch15.wav", # melodic
    "jollibee-drop.wav":     "switch1.wav",  # loud arcade
    "coffee-drop.wav":       "switch4.wav",  # robust
    "matcha-drop.wav":       "switch6.wav",  # zen
    "beer-drop.wav":         "switch8.wav",  # fizzy

    # === CLEAR sounds (line cleared - satisfying!) - longer, rewarding ===
    "watermelon-clear.wav":  "switch20.wav", # ascending bright
    "icecream-clear.wav":    "switch22.wav", # sweet chime
    "ocean-clear.wav":       "switch25.wav", # wave-like
    "sunset-clear.wav":      "switch18.wav", # warm melodic
    "milktea-clear.wav":     "switch17.wav", # bubbly cascade
    "love-clear.wav":        "switch24.wav", # romantic
    "jollibee-clear.wav":    "switch16.wav", # arcade fanfare
    "coffee-clear.wav":      "switch19.wav", # roasted warm
    "matcha-clear.wav":      "switch21.wav", # zen chime
    "beer-clear.wav":        "switch23.wav", # celebratory

    # === DRAGSTART sounds (picking up a block) - very short/subtle ===
    "watermelon-dragstart.wav":  "rollover2.wav",  # subtle
    "icecream-dragstart.wav":    "rollover3.wav",  # delicate
    "ocean-dragstart.wav":       "rollover1.wav",  # light
    "sunset-dragstart.wav":      "rollover4.wav",  # warm hover
    "milktea-dragstart.wav":     "rollover5.wav",  # soft
    "love-dragstart.wav":        "rollover6.wav",  # gentle
    "jollibee-dragstart.wav":    "click1.wav",     # quick click
    "coffee-dragstart.wav":      "rollover2.wav",  # muted
    "matcha-dragstart.wav":      "rollover3.wav",  # subtle
    "beer-dragstart.wav":        "rollover1.wav",  # light

    # === GLOBAL sounds ===
    "game-start.wav":        "switch10.wav",  # uplifting switch on
    "game-over.wav":         "switch2.wav",   # descending game over
    "new-record.wav":        "switch16.wav",  # celebration fanfare

    # === COMBO FEEDBACK chimes ===
    "good.wav":              "switch15.wav",  # 1 line: simple pleasant
    "perfect.wav":           "switch20.wav",  # 2 lines: brighter
    "awesome.wav":           "switch22.wav",  # 3 lines: even brighter
    "unbelievable.wav":      "switch24.wav",  # 4+ lines: max celebration

    # === WARNING sounds ===
    "warning-light.wav":     "rollover6.wav", # subtle warning
    "warning-medium.wav":    "click3.wav",    # moderate alert
    "warning-critical.wav":  "click1.wav",    # urgent (will be used rapidly)
}


def download_kenney_sounds(target_dir: Path) -> dict[str, Path]:
    """Download all needed Kenney sound files to a temp directory."""
    tmp = target_dir / "_kenney_tmp"
    tmp.mkdir(parents=True, exist_ok=True)

    # Collect unique source files we need
    needed = set(SOUND_MAP.values())
    downloaded: dict[str, Path] = {}

    print(f"\n[DL] Downloading {len(needed)} unique source files from Kenney.nl (CC0)...")
    print(f"     Source: github.com/Calinou/kenney-ui-audio\n")

    for filename in sorted(needed):
        dest = tmp / filename
        if dest.exists():
            print(f"   OK {filename} (cached)")
            downloaded[filename] = dest
            continue

        url = f"{BASE_URL}/{filename}"
        try:
            print(f"   -> {filename}...", end=" ", flush=True)
            urllib.request.urlretrieve(url, dest)
            size_kb = dest.stat().st_size / 1024
            print(f"OK ({size_kb:.1f} KB)")
            downloaded[filename] = dest
        except Exception as e:
            print(f"FAILED: {e}")

    return downloaded


def apply_sound_map(downloaded: dict[str, Path], output_dir: Path) -> None:
    """Copy and rename downloaded files to game sound names."""
    print(f"\n[MAP] Mapping sounds to game events...\n")
    success = 0
    skipped = 0

    for game_name, source_name in SOUND_MAP.items():
        dest = output_dir / game_name
        if source_name not in downloaded:
            print(f"   SKIP {game_name} (source {source_name} not downloaded)")
            skipped += 1
            continue

        src = downloaded[source_name]
        shutil.copy2(src, dest)
        print(f"   OK   {game_name}  <- {source_name}")
        success += 1

    print(f"\n   Mapped: {success}/{len(SOUND_MAP)} sounds")
    if skipped:
        print(f"   Skipped: {skipped} (download failed)")


def cleanup_tmp(tmp_dir: Path) -> None:
    if tmp_dir.exists():
        shutil.rmtree(tmp_dir)
        print(f"\n[CLEAN] Removed temp directory.")


def main():
    print("=" * 60)
    print("Block Blast -- Free Sound Download Script")
    print("Source: Kenney.nl (CC0 Public Domain)")
    print("=" * 60)

    SOUNDS_DIR.mkdir(parents=True, exist_ok=True)

    # Step 1: Download from GitHub
    downloaded = download_kenney_sounds(SOUNDS_DIR)

    if not downloaded:
        print("\n[ERROR] No files downloaded. Check your internet connection.")
        return

    # Step 2: Apply sound map (copy to correct filenames)
    apply_sound_map(downloaded, SOUNDS_DIR)

    # Step 3: Cleanup temp
    cleanup_tmp(SOUNDS_DIR / "_kenney_tmp")

    # Summary
    print("\n" + "=" * 60)
    print("DONE! Sound files updated in assets/sounds/")
    print("=" * 60)
    print("\nLicense: All sounds are CC0 (Public Domain) from Kenney.nl")
    print("No attribution required.")
    print("\nNext: restart Metro bundler (Ctrl+C then npm run web)")


if __name__ == "__main__":
    main()
