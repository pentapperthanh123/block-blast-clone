# Task: Full App Flow + Drag/Drop FX

## Objective

Loading → Home → Classic gameplay with reference-matching UI, drag-drop placement, place + line-clear effects.

## Scope

1. App navigation (`loading` | `home` | `classic`)
2. LoadingScreen, HomeScreen (Adventure/More stub; Classic playable)
3. GameScreen UI: crown/best, score, settings, tray, footer mood text
4. Drag-drop with ghost preview
5. Place pulse + clear flash particles
6. Viewport remains locked (web preview)

## Assumptions

- Adventure / More Games: UI only + toast/alert stub
- Cell colors tracked in store (parallel to grid)
- Clear animation 400ms before committing cleared grid
- View-based board (drag overlays work on web + native)

## Done when

- Full flow works on web preview and native
- Can drag piece, see ghost, place with effect, clear with effect
- `tsc` passes; engine tests still pass
