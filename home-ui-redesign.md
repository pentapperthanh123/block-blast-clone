# Home / Loading / Gameplay UI Redesign

## Goal
Casual candy style, keep royal blue, light motion — synced across Home, Loading, and Classic gameplay.

## Decisions
- Style: casual puzzle candy
- Palette: keep `#2563EB` family (`CandyBackground`)
- Center Home: block mascot / mini board (Views)
- Loading: same title + hero + candy progress bar
- Gameplay: subtle background, chip header, board halo, tray cradles
- Motion: light float + entrance (respect reduce-motion)

## Scope
- `src/screens/HomeScreen.tsx`
- `src/screens/LoadingScreen.tsx`
- `src/screens/GameScreen.tsx`
- `src/components/home/*`
- `src/components/ui/GameHeader.tsx`, `GameOverModal.tsx`
- `src/components/game/BlockTray.tsx`, `GameBoard.tsx`, `BlockCell.tsx` (style only)
