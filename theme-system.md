# Theme System Documentation

## 📋 Tổng Quan

Hệ thống multi-theme cho Block Blast clone với 5 themes độc đáo, mỗi theme có:
- Palette màu riêng biệt (background, glows, board)
- SVG patterns đặc trưng cho blocks
- Visual identity hoàn chỉnh

## 🎨 Danh Sách Themes

### 1. **Watermelon** (Dưa Hấu)
- **Background**: Xanh lá mint (#6EE7B7)
- **Board**: Xanh đậm (#065F46)
- **Block Pattern**: Gradient hồng đỏ + chấm đen (seeds) + vỏ xanh
- **Cảm giác**: Tươi mát, mùa hè, trái cây

### 2. **Ice Cream** (Kem Que)
- **Background**: Cam chocolate (#FB923C)
- **Board**: Nâu đậm (#78350F)
- **Block Pattern**: Gradient đa lớp (cam → vanilla → xanh) + topping vàng
- **Cảm giác**: Ngọt ngào, dessert, childhood

### 3. **Ocean** (Đại Dương) ⭐ Default
- **Background**: Xanh dương (#3B82F6)
- **Board**: Navy đậm (#1E3A8A)
- **Block Pattern**: Gradient xanh + sóng trắng mờ
- **Cảm giác**: Bình yên, sâu thẳm, professional

### 4. **Sunset** (Hoàng Hôn)
- **Background**: Cam (#F97316)
- **Board**: Nâu gỗ (#78350F)
- **Tôi sẽ tiếp tục viết**: Gradient cam + texture gỗ
- **Cảm giác**: Ấm áp, vintage, rustic

### 5. **Gem** (Ngọc Quý)
- **Background**: Tím (#8B5CF6)
- **Board**: Tím đậm (#4C1D95)
- **Block Pattern**: Hexagon facets + gradient tím + shine highlights
- **Cảm giác**: Quý phái, luxury, mystical

## 🔧 Implementation Details

### Theme Config Structure

```typescript
export interface ThemeConfig {
  id: ThemeName;
  name: string;
  source: string; // SVG pattern data URI
  palette: ThemePalette;
  boardColor?: string; // Optional custom board background
}

export interface ThemePalette {
  background: string;       // Main screen background
  backgroundDeep: string;   // Status bar, darker areas
  glowMid: string;          // Mid-level glow effects
  glowBottom: string;       // Bottom glow effects
}
```

### SVG Pattern Design Principles

**Watermelon Pattern:**
- Linear gradient hồng → đỏ
- 5 dots đen (seeds) phân tán
- Green cap ở top 25% (vỏ dưa)

**Ice Cream Pattern:**
- 4-stop vertical gradient: Cam → Vàng nhạt → Xanh nhạt → Xanh
- 5 circles màu vàng/cam (topping) ở top 35%
- Border radius 12px (softer than others)

**Ocean Pattern:**
- Blue gradient với glossy highlight ở top
- 2 layers sóng trắng mờ (wave effect)
- Border radius 16px (rounded)

**Sunset Pattern:**
- Warm orange gradient
- 3 curved lines (wood grain texture)
- Border radius 10px

**Gem Pattern:**
- Hexagon shape (6 sides)
- Purple gradient diagonal
- Facet highlights + center diamond shape
- No border radius (sharp edges)

## 📂 Files Changed

1. **`src/constants/themes.ts`**: Core theme definitions
2. **`src/components/game/BlockCell.tsx`**: Render SVG patterns on blocks
3. **`src/components/game/GameBoard.tsx`**: Apply board colors
4. **`src/store/gameStore.ts`**: Default theme = 'ocean'
5. **`src/screens/*.tsx`**: Update fallback references

## 🎯 Theme Randomization

Themes rotate randomly khi:
- App load (in `appStore.finishLoading`)
- New game start (in `gameStore.beginClassicSession`)
- New round after game over (in `gameStore.finishNewRoundTransition`)

```typescript
export function pickRandomTheme(current?: ThemeName): ThemeName {
  const pool = current
    ? THEME_LIST.filter((t) => t.id !== current)
    : THEME_LIST;
  return pool[Math.floor(Math.random() * pool.length)]?.id ?? 'ocean';
}
```

## 🚀 How to Add New Themes

1. **Create SVG Pattern:**
   ```typescript
   const SVG_MYTHEME = `data:image/svg+xml;utf8,<svg>...</svg>`;
   ```

2. **Add to ThemeName type:**
   ```typescript
   export type ThemeName = '...' | 'mytheme';
   ```

3. **Add to THEMES object:**
   ```typescript
   mytheme: {
     id: 'mytheme',
     name: 'My Theme',
     source: SVG_MYTHEME,
     palette: { ... },
     boardColor: '...',
   }
   ```

## 🎨 Design Tips

- **Contrast**: Ensure patterns are visible on colored backgrounds
- **Simplicity**: Avoid overly complex SVGs (performance on mobile)
- **Opacity**: Use semi-transparent elements for depth
- **Consistency**: Match pattern style to theme emotion
- **Border Radius**: Sharp = tech/luxury, Round = friendly/casual

## ✅ Testing Checklist

- [ ] All themes load without errors
- [ ] SVG patterns render on all block cells
- [ ] Board colors match theme palette
- [ ] Background glows reflect theme colors
- [ ] Theme randomization works on app load
- [ ] Theme cycles correctly after game over
- [ ] Patterns visible during drag-and-drop
- [ ] Ghost blocks show patterns correctly

---

**Created**: 2026-07-24
**Version**: 1.0.0
