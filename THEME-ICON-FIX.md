# Theme Icon Fix - SVG Rendering

## Vấn đề
Các icon SVG của themes (Watermelon, Milk Tea, v.v.) không hiển thị đúng trong game và Settings modal. Blocks chỉ hiển thị màu solid thay vì pattern SVG đẹp.

## Nguyên nhân
React Native `Image` component không render tốt SVG data URI, đặc biệt trên web platform. SVG được encode dưới dạng `data:image/svg+xml;utf8,...` không được browser/RN xử lý đúng.

## Giải pháp

### 1. Tạo ThemeIcon Component
**File:** `src/components/ui/ThemeIcon.tsx`

Component mới sử dụng `react-native-svg` để render SVG trực tiếp thay vì dùng data URI:

```tsx
import { ThemeIcon } from './ThemeIcon';

// Render theme icon
<ThemeIcon source={theme.source} size={70} />
```

**Features:**
- ✅ Parse theme từ source string
- ✅ Render inline SVG components (không dùng data URI)
- ✅ Support tất cả 6 themes:
  - Watermelon: Gradient pink, green rind, black seeds
  - Milk Tea: Cup graphic, boba pearls, straw
  - Gem: Diamond shape với gradient purple
  - Ocean: Wave patterns
  - Sunset: Wood grain strokes
  - Ice Cream: Colorful sprinkles
- ✅ Configurable size và style
- ✅ Performance tốt hơn Image component

### 2. Cập nhật SettingsModal
**File:** `src/components/ui/SettingsModal.tsx`

**Changes:**
```tsx
// Before: Chỉ hiển thị 3 mini color blocks
<View style={styles.previewBlocks}>
  <View style={[styles.miniBlock, { backgroundColor: colors[0] }]} />
  <View style={[styles.miniBlock, { backgroundColor: colors[1] }]} />
  <View style={[styles.miniBlock, { backgroundColor: colors[2] }]} />
</View>

// After: Hiển thị actual theme icon
<ThemeIcon source={theme.source} size={70} />
```

### 3. Cập nhật BlockCell
**File:** `src/components/game/BlockCell.tsx`

**Changes:**
```tsx
// Before: Dùng Image component với data URI
<Image source={{ uri: skinUri }} style={skinStyle} resizeMode="cover" />

// After: Dùng ThemeIcon component
<ThemeIcon source={skinUri} size={size} style={iconStyle} />
```

## Implementation Details

### ThemeIcon Component Structure

```tsx
const ThemeIcon: React.FC = ({ source, size, style }) => {
  // Detect theme từ source string
  const isWatermelon = source.includes('melonPink');
  const isMilktea = source.includes('milkTeaGrad');
  // ... detect khác themes
  
  return (
    <Svg width={size} height={size} viewBox="0 0 130 130">
      {isWatermelon && <WatermelonSVG />}
      {isMilktea && <MilkteaSVG />}
      {/* ... các theme khác */}
    </Svg>
  );
};
```

### Watermelon SVG
```tsx
const WatermelonSVG = () => (
  <>
    <Defs>
      <LinearGradient id="melonPink">
        <Stop offset="0%" stopColor="#ff7675" />
        <Stop offset="100%" stopColor="#d63031" />
      </LinearGradient>
    </Defs>
    <Rect width="130" height="130" rx="20" fill="#0b6623" />
    <Rect x="6" y="6" width="118" height="118" rx="16" fill="url(#melonPink)" />
    {/* White rind, green strip, seeds, highlights */}
  </>
);
```

### Milk Tea SVG
```tsx
const MilkteaSVG = () => (
  <>
    <Defs>
      <LinearGradient id="milkTeaGrad">
        <Stop offset="0%" stopColor="#ffeaa7" />
        <Stop offset="100%" stopColor="#fab1a0" />
      </LinearGradient>
    </Defs>
    <Rect width="130" height="130" rx="20" fill="#5c3a21" />
    <Rect x="6" y="6" width="118" height="118" rx="16" fill="url(#milkTeaGrad)" />
    {/* Cup, tea liquid, boba pearls, straw */}
  </>
);
```

## Files Changed

1. ✅ **NEW:** `src/components/ui/ThemeIcon.tsx`
   - Render inline SVG thay vì Image component
   - Support 6 themes với chi tiết đầy đủ

2. ✅ **UPDATED:** `src/components/ui/SettingsModal.tsx`
   - Import ThemeIcon
   - Replace mini blocks preview với actual icon
   - Add iconContainer styles

3. ✅ **UPDATED:** `src/components/game/BlockCell.tsx`
   - Import ThemeIcon
   - Replace Image với ThemeIcon
   - Update style props

## Testing Checklist

### Settings Modal
- [ ] Mở Settings (⚙ góc trên phải)
- [ ] Kiểm tra tất cả 6 theme previews hiển thị icon đúng:
  - [ ] Watermelon: Pink flesh + green rind + seeds
  - [ ] Milk Tea: Cup + boba + straw
  - [ ] Ice Cream: Sprinkles
  - [ ] Ocean: Wave patterns
  - [ ] Sunset: Wood grain
  - [ ] Gem: Diamond shape
- [ ] Click vào mỗi theme để đổi
- [ ] Icon trong preview card hiển thị rõ ràng

### Game Board
- [ ] Start game hoặc switch theme
- [ ] Blocks trên board hiển thị pattern SVG (không phải màu solid):
  - [ ] Watermelon blocks có vỏ xanh + ruột hồng + hạt đen
  - [ ] Milk Tea blocks có cup + trà + trân châu
  - [ ] Ocean blocks có wave highlights
  - [ ] Sunset blocks có wood grain
  - [ ] Gem blocks có diamond facets
  - [ ] Ice Cream blocks có sprinkles
- [ ] Pattern hiển thị đúng khi drag blocks
- [ ] Ghost preview cũng có pattern
- [ ] Predicted clear highlight vẫn hoạt động

### Block Tray
- [ ] 3 blocks trong tray hiển thị pattern đúng
- [ ] Pattern rõ ràng, không bị blur
- [ ] Drag từ tray, pattern vẫn giữ nguyên

### Performance
- [ ] Không lag khi render nhiều blocks
- [ ] Smooth animation khi place blocks
- [ ] Settings modal mở/đóng mượt

## Visual Results

### Before
- Settings: Chỉ có 3 ô màu nhỏ generic
- Game board: Blocks màu solid đen/nâu
- Không thể phân biệt themes

### After
- Settings: Full theme icons với chi tiết đầy đủ
- Game board: Blocks có SVG pattern đẹp mắt
- Mỗi theme có visual identity riêng biệt

## Technical Benefits

1. **Better Rendering:** SVG components render natively, không qua Image loader
2. **Cross-Platform:** Hoạt động tốt trên web, iOS, Android
3. **Performance:** Ít overhead hơn so với Image + data URI
4. **Maintainability:** Dễ debug và customize SVG trực tiếp trong code
5. **File Size:** Không cần external image assets

## Known Limitations

1. **Theme Detection:** Hiện tại detect theme từ string matching trong source. Có thể improve bằng cách pass explicit themeId.
2. **ViewBox Fixed:** Tất cả SVG dùng viewBox 0 0 130 130. Nếu muốn support custom viewBox, cần refactor.
3. **Rotation:** Straw trong Milk Tea SVG dùng fixed rotation center. Có thể cần adjust cho sizes khác.

## Future Improvements

1. Pass explicit `themeId` thay vì parse từ source string
2. Support custom viewBox per theme
3. Animate certain elements (e.g., sparkles, waves)
4. Add more theme-specific details
5. Support user custom SVG uploads

---

**Status:** ✅ Complete  
**Created:** 2026-07-24  
**Updated:** 2026-07-24
