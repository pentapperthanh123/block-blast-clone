# Fix: Border Cảnh Báo & Hiệu Ứng Sụp Đổ

## Issues Fixed

### 1. Border Cảnh Báo Không Đồng Bộ
**Problem**: `DangerOverlay` dùng `StyleSheet.absoluteFillObject`, fill toàn bộ parent container thay vì match chính xác kích thước bàn cờ.

**Solution**: Thay đổi `DangerOverlay` để sử dụng dimensions chính xác từ `getBoardMetrics()`:

```tsx
// Before
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderRadius: 4,
    zIndex: 10,
  },
});

// After
export const DangerOverlay: React.FC = () => {
  const { boardSize } = getBoardMetrics();
  const totalSize = boardSize + BOARD_CONSTANTS.BORDER_PAD * 2;
  
  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          width: totalSize,
          height: totalSize,
        },
        animatedStyle,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderWidth: 3,
    borderRadius: 4, // Match game board border radius
    zIndex: 10,
  },
});
```

### 2. Hiệu Ứng Sụp Đổ Không Reset Đúng
**Problem**: Khi cells đang falling với Reanimated animations (delays, transforms, fades), việc reset bằng immediate assignment (`value = 0`) không reliably cancel animations đang chạy, dẫn đến cells bị missing hoặc invisible sau khi play again.

**Root Cause**: 
- Cells fall với complex staggered animations (max ~1159ms)
- Khi phase chuyển từ 'falling' → 'idle', grid changes và cells cần reset về position ban đầu
- Immediate assignment không cancel `withDelay` animations đang chạy

**Solution**: Dùng `withTiming` với duration rất ngắn (10ms) để reliably cancel và reset:

```tsx
// Before (in BoardCell useEffect)
useEffect(() => {
  if (!falling || empty) {
    translateY.value = 0;
    translateX.value = 0;
    rotate.value = 0;
    if (!falling) {
      opacity.value = 1;
      scale.value = 1;
    }
    return;
  }
  // ... falling animations
}, [falling, empty, ...]);

// After
useEffect(() => {
  if (!falling || empty) {
    // CRITICAL: Use withTiming to reliably cancel running animations
    translateY.value = withTiming(0, { duration: 10 });
    translateX.value = withTiming(0, { duration: 10 });
    rotate.value = withTiming(0, { duration: 10 });
    if (!falling) {
      opacity.value = withTiming(1, { duration: 10 });
      scale.value = withTiming(1, { duration: 10 });
    }
    return;
  }
  // ... falling animations
}, [falling, empty, ...]);
```

## Files Changed

1. **`src/components/ui/DangerOverlay.tsx`**
   - Import `getBoardMetrics` and `BOARD_CONSTANTS`
   - Calculate `totalSize = boardSize + BOARD_CONSTANTS.BORDER_PAD * 2`
   - Apply dynamic width/height to overlay
   - Change from `absoluteFillObject` to explicit positioning

2. **`src/components/game/GameBoard.tsx`**
   - Replace immediate value assignments with `withTiming(value, { duration: 10 })`
   - Applies to: `translateY`, `translateX`, `rotate`, `opacity`, `scale`

## Technical Details

### New Round Transition Flow
```
beginNewRound() 
  → restoreLosingBoard() [phase: 'recap', old grid restored]
  → scheduleNewRoundTransition()
    → After 1100ms: phase → 'falling'
      → Cells animate: stagger up to 539ms + 620ms duration
    → After 1500ms: finishNewRoundTransition()
      → applyFreshRoundState() [phase: 'idle', new random grid]
```

### Why `withTiming` Works Better
- Immediate assignment (`value = 0`) sets the value but may not cancel queued animations from `withDelay`
- `withTiming(0, { duration: 10 })` explicitly starts a new animation that cancels/replaces any running or queued animations
- Duration of 10ms is fast enough to be imperceptible but ensures proper cancellation

## Testing Checklist

- [✓] Border cảnh báo khớp chính xác với border bàn cờ (borderRadius: 4)
- [✓] Border cảnh báo có đúng kích thước (boardSize + padding * 2)
- [✓] Hiệu ứng sụp đổ hoạt động mượt mà khi thua game
- [✓] Sau "Play Again", tất cả cells hiển thị đầy đủ trên bàn cờ mới
- [✓] Không có cells bị missing hoặc invisible sau falling animation
- [✓] Board overflow đúng ('visible' during falling, 'hidden' sau đó)

## Prevention Guidelines

1. **Overlay Components**: 
   - Luôn match chính xác dimensions của target element
   - Tránh dùng `absoluteFillObject` cho overlays cần precision
   - Calculate exact size từ parent metrics

2. **Reanimated Animation Reset**:
   - Dùng `withTiming(value, {duration: 10})` thay vì immediate assignment
   - Đặc biệt quan trọng khi cancel animations có `withDelay`
   - Test phase transitions kỹ để ensure states reset đúng

3. **Game State Transitions**:
   - Verify grid cloning đúng
   - Check animation dependencies (falling, empty, etc.)
   - Test flow đầy đủ: game over → recap → falling → new round
