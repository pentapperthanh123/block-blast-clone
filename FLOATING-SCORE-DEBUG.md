# FloatingScore Z-Index Debug

## Changes Made

### 1. Increased Z-Index
**File:** `src/components/game/FloatingScore.tsx`

```tsx
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    // ...
    zIndex: 100,      // Increased from 20
    elevation: 100,   // Added for Android
  },
});
```

### 2. Added Debug Logging
```tsx
console.log('FloatingScore render:', { 
  active, 
  points, 
  position, 
  left, 
  top,
  cellSize 
});
```

## Debug Steps

### 1. Open Browser Console
- Press F12 or Right-click → Inspect
- Go to Console tab
- Filter for "FloatingScore"

### 2. Place a Block
- Drag and drop any block
- Check console for logs

### 3. Expected Output
```
FloatingScore render: {
  active: true,
  points: 1,
  position: { row: 3, col: 4 },
  left: 160,
  top: 120,
  cellSize: 40
}
```

### 4. Troubleshooting

**If NO logs appear:**
- `placedCellScores` array is empty
- Check: `useGameStore((s) => s.placedCellScores)` in GameScreen
- Verify: `placeBlock` function sets `placedCellScores`

**If logs appear but NO visual:**
- Z-index issue (should be fixed now with z-index: 100)
- Position calculation wrong
- Opacity animation not working
- Component outside visible area

**If visual appears briefly then disappears:**
- Timing issue (should be fixed with 800ms timeout)
- Animation duration mismatch

## Layer Order (Bottom to Top)

```
1. CandyBackground
2. GameHeader
3. AnimatedBoardStack:
   - boardHalo (z: 0)
   - GameBoard
   - DangerOverlay
   - ClearBurst (z: 5)
   - FloatingScore (z: 100) ← Should be on top now
4. BlockTray
5. FeedbackOverlay
6. DragOverlay
7. CuteMascot
8. GameOverModal
```

## Next Steps

1. Check browser console for logs
2. Take screenshot if visual issues persist
3. Share console output

---

**Status:** Debugging
**Z-Index:** 100 (increased from 20)
**Elevation:** 100 (added for Android)
