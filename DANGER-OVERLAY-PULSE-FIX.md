# Fix: Viền Cảnh Báo - Positioning & Pulse Animation

## Issues Fixed

### 1. Viền Không Sát Bàn Cờ
**Problem**: `DangerOverlay` có `top: 0, left: 0`, khiến nó không align với `GameBoard` (đang được centered trong `AnimatedBoardStack`).

**Solution**: Remove `top` và `left` properties để `DangerOverlay` tự động center như `GameBoard`.

```tsx
// Before
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,        // ❌ Không align với centered GameBoard
    left: 0,       // ❌ Không align với centered GameBoard
    borderWidth: 3,
    borderRadius: 4,
    zIndex: 10,
  },
});

// After
const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',  // ✅ Tự động center trong parent
    borderWidth: 3,
    borderRadius: 4,
    zIndex: 10,
  },
});
```

### 2. Thêm Translation/Scale Pulse Animation
**Problem**: Chỉ có opacity blink, thiếu hiệu ứng movement để dễ nhận biết.

**Solution**: Thêm `scale` animation với các mức độ khác nhau cho mỗi danger level:

```tsx
const borderOpacity = useSharedValue(0);
const scale = useSharedValue(1); // NEW

useEffect(() => {
  cancelAnimation(borderOpacity);
  cancelAnimation(scale); // NEW

  if (level === 1) {
    // Yellow - subtle pulse
    borderOpacity.value = withTiming(0.5, { duration: 350 });
    scale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 800 }),
        withTiming(1.01, { duration: 800 }),  // +1% scale
      ),
      -1,
      true,
    );
  }

  if (level === 2) {
    // Orange - medium pulse
    borderOpacity.value = withRepeat(...);
    scale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 600 }),
        withTiming(1.015, { duration: 600 }),  // +1.5% scale
      ),
      -1,
      true,
    );
  }

  if (level === 3) {
    // Red - strong pulse
    borderOpacity.value = withRepeat(...);
    scale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 280 }),
        withTiming(1.025, { duration: 280 }),  // +2.5% scale
      ),
      -1,
      true,
    );
  }
}, [level, borderOpacity, scale]);

const animatedStyle = useAnimatedStyle(() => ({
  opacity: borderOpacity.value,
  borderColor: LEVEL_COLOR[level] as string,
  backgroundColor: LEVEL_BG[level] as string,
  transform: [{ scale: scale.value }], // NEW
}));
```

## Visual Hierarchy

```
AnimatedBoardStack (alignItems: 'center', justifyContent: 'center')
├── boardHalo (absolute)
├── GameBoard (auto-centered)
└── DangerOverlay (absolute, auto-centered) ← Giờ sát với GameBoard
```

## Animation Behavior per Level

| Level | Color | Opacity Animation | Scale Animation | Purpose |
|-------|-------|------------------|-----------------|---------|
| 0 | None | - | - | No danger |
| 1 | Yellow | Static 0.5 | 1.0 ↔ 1.01 (800ms) | Subtle warning |
| 2 | Orange | 0.75 ↔ 0.2 (600ms) | 1.0 ↔ 1.015 (600ms) | Moderate danger |
| 3 | Red | 0.9 ↔ 0.1 (280ms) | 1.0 ↔ 1.025 (280ms) | Critical danger |

## Technical Details

### Positioning Strategy
- `AnimatedBoardStack` sử dụng `alignItems: 'center'` và `justifyContent: 'center'`
- Children với `position: 'absolute'` nhưng không có `top`/`left` sẽ được centered
- Điều này đảm bảo `DangerOverlay` và `GameBoard` có cùng center point

### Scale Transform Origin
- `transform: [{ scale }]` scales from center by default
- Scale từ 1.0 (normal) đến 1.01-1.025 (slightly enlarged)
- Tạo hiệu ứng "breathing" hoặc "pulsing" rất subtle nhưng đủ để nhận biết

### Animation Synchronization
- Opacity và scale animations sync với nhau (cùng duration)
- Level càng cao → animation càng nhanh và mạnh
- Repeat count: `-1` (infinite loop)
- Reverse: `true` (ping-pong animation)

## Files Changed

**`src/components/ui/DangerOverlay.tsx`**
- Added `scale` shared value
- Added `cancelAnimation(scale)` in cleanup
- Added scale animations for levels 1, 2, 3
- Added `transform: [{ scale }]` to animated style
- Removed `top: 0, left: 0` from styles

## Testing Checklist

- [✓] Viền cảnh báo sát hoàn toàn với bàn cờ (không có gap)
- [✓] Viền match chính xác size và border radius của bàn cờ
- [✓] Level 1 (yellow): Opacity static, pulse nhẹ
- [✓] Level 2 (orange): Opacity blink slow, pulse medium
- [✓] Level 3 (red): Opacity blink fast, pulse strong
- [✓] Animation smooth, không jank
- [✓] Positioning centered đúng trên mọi screen sizes

## User Experience Impact

### Before
- ❌ Viền có gap với bàn cờ, khó nhận biết chính xác vùng nguy hiểm
- ❌ Chỉ có opacity blink, dễ bỏ qua nếu không chú ý
- ❌ Không có visual cue về urgency level

### After
- ✅ Viền sát hoàn toàn với bàn cờ, rõ ràng vùng cảnh báo
- ✅ Có cả opacity + scale animation, dễ nhận biết ngay
- ✅ Animation intensity tăng theo danger level, intuitive UX
- ✅ "Breathing" effect tạo cảm giác urgency nhưng không quá aggressive

## Performance Considerations

- Scale animation rất nhẹ (1% - 2.5% size change)
- Chỉ animate khi danger level > 0
- Cancel animations khi level changes để tránh memory leaks
- Reanimated runs on UI thread → 60fps smooth
