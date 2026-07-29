# Block Blast - Master Blueprint

## 🎯 Project Overview

Clone của game mobile "Block Blast" được xây dựng với React Native, TypeScript, và React Native Skia.

## 🏛️ Clean Architecture Principles

### Layered Architecture

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI)           │
│   - React Components                │
│   - Skia Rendering                  │
│   - Gesture Handlers                │
├─────────────────────────────────────┤
│   Interface Adapters                │
│   - Zustand Store                   │
│   - Custom Hooks                    │
│   - State Management                │
├─────────────────────────────────────┤
│   Business Logic (Pure Functions)   │
│   - Game Engine                     │
│   - Matrix Operations               │
│   - Score Calculator                │
│   - Collision Detection             │
├─────────────────────────────────────┤
│   Domain Layer                      │
│   - Type Definitions                │
│   - Constants                       │
│   - Game Rules                      │
└─────────────────────────────────────┘
```

### Core Principles

1. **Separation of Concerns**
   - UI logic ≠ Business logic
   - State management là cầu nối giữa UI và Engine
   - Engine functions phải PURE (no side effects)

2. **Dependency Rule**
   - Dependencies chỉ point inward
   - Engine KHÔNG import từ state/components
   - Components CÓ THỂ import từ engine

3. **Testability**
   - Pure functions dễ test
   - Mock state store cho component tests
   - Integration tests cho hooks

## 🎮 Game Mechanics

### Grid System
- **Size**: 8x8 matrix
- **Cell State**: 0 (empty) | 1 (filled)
- **Coordinate System**: (x, y) với origin tại top-left (0, 0)

### Block Placement
1. User drags một piece từ "next pieces" area
2. Validate placement position (no overlap)
3. Place block → update grid state
4. Check for completed lines
5. Clear lines → calculate score
6. Generate new pieces if all 3 used

### Scoring System
```typescript
Base Score = POINTS_PER_BLOCK * blocksPlaced
Line Clear = POINTS_PER_LINE * linesCleared
Combo Bonus = baseScore * (COMBO_MULTIPLIER ^ comboCount)
```

### Line Clearing Rules
- **Row Clear**: Entire row (all 8 cells) filled
- **Column Clear**: Entire column (all 8 cells) filled
- **Multi-clear**: Can clear multiple rows/columns simultaneously
- **Combo**: Sequential clears without breaking

## 🎨 Visual Design (từ Reference Images)

### Color Palette
```typescript
BLOCK_COLORS = {
  PURPLE: '#B565D8',
  CYAN: '#4DD3E8',
  ORANGE: '#FF8C42',
  YELLOW: '#FFD93D',
  GREEN: '#6BCF7F',
  RED: '#FF6B6B',
  BLUE: '#5B7CFF',
}

UI_COLORS = {
  BACKGROUND: '#2E3C8F',      // Deep blue
  GRID_BACKGROUND: '#1E2870', // Navy
  TEXT_SCORE: '#FFD93D',      // Yellow
}
```

### Pseudo-3D Block Effect
- **Gradient**: Top-left lighter → bottom-right darker
- **Shadow**: Bottom-right offset
- **Highlight**: Top-left edge shine
- **Border**: Subtle inner border for depth

### Animations
- **Block Placement**: Scale + fade-in (200ms)
- **Line Clear**: Flash + shrink (400ms)
- **Combo Text**: Slide-up + fade-out (800ms)

## 🧩 Core Modules

### 1. MatrixUtils (Pure Logic)
```typescript
// Generate standard Tetromino shapes
generateTetrominoes(): BlockShape[]

// Validate placement
canPlaceBlock(grid: Grid, block: BlockShape, position: Position): boolean

// Place block (returns new grid, no mutation)
placeBlock(grid: Grid, block: BlockShape, position: Position): Grid

// Find completed lines
findCompletedLines(grid: Grid): { rows: number[], columns: number[] }

// Clear lines (returns new grid)
clearLines(grid: Grid, rows: number[], columns: number[]): Grid
```

### 2. ScoreCalculator (Pure Logic)
```typescript
calculateBlockScore(blockSize: number): number
calculateLineScore(linesCleared: number): number
calculateComboBonus(baseScore: number, comboCount: number): number
calculateTotalScore(blockSize: number, linesCleared: number, combo: number): number
```

### 3. Game Store (Zustand)
```typescript
interface GameStore {
  // State
  grid: Grid;
  score: number;
  highScore: number;
  currentPieces: BlockShape[];
  combo: number;
  isGameOver: boolean;

  // Actions
  placeBlock: (block: BlockShape, position: Position) => void;
  clearLines: () => ClearLinesResult;
  generateNewPieces: () => void;
  resetGame: () => void;
}
```

### 4. Skia Rendering
- Use `<Canvas>` from @shopify/react-native-skia
- Custom shaders for gradients
- Hardware-accelerated drawing
- Smooth 60fps animations

## 🚀 Development Phases

### Phase 1: Foundation (Current)
- [x] Project scaffold
- [x] Dependencies setup
- [x] Type definitions
- [ ] Game engine pure functions
- [ ] Zustand store

### Phase 2: Core Gameplay
- [ ] Grid rendering (Skia)
- [ ] Block rendering (Skia with pseudo-3D)
- [ ] Drag & drop gestures
- [ ] Placement validation
- [ ] Line clearing logic

### Phase 3: Polish
- [ ] Animations (Reanimated)
- [ ] Combo system
- [ ] Score display
- [ ] Sound effects (optional)
- [ ] Particle effects

### Phase 4: Game Features
- [ ] High score persistence
- [ ] Game over detection
- [ ] Restart functionality
- [ ] Main menu
- [ ] Settings screen

## 🧪 Testing Strategy

### Unit Tests (Jest)
- MatrixUtils functions
- ScoreCalculator functions
- Collision detection

### Integration Tests
- Store actions + engine integration
- Hook behaviors

### E2E Tests (Detox - optional)
- Full gameplay flow
- UI interactions

## 📐 Performance Targets

- **FPS**: 60fps minimum
- **Frame Budget**: < 16.67ms per frame
- **Memory**: < 100MB RAM usage
- **Startup**: < 2s cold start

## 🔒 Code Quality Rules

1. **TypeScript Strict Mode**: Always enabled
2. **No `any` types**: Use proper types or `unknown`
3. **Pure Functions**: No mutations in engine layer
4. **Functional Composition**: Prefer composition over inheritance
5. **ESLint**: No warnings allowed in production
6. **Prettier**: Auto-format on save

## 📚 Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | React Native | 0.74.0 | Mobile framework |
| Language | TypeScript | 5.0.4 | Type safety |
| Rendering | React Native Skia | 1.2.0 | 2D graphics |
| Animation | Reanimated | 3.10.0 | Smooth animations |
| Gestures | Gesture Handler | 2.16.0 | Touch interactions |
| State | Zustand | 4.5.0 | State management |

## 🎯 Success Criteria

- [ ] 8x8 grid renders correctly with Skia
- [ ] Blocks có pseudo-3D effect chính xác
- [ ] Drag & drop mượt mà (60fps)
- [ ] Line clearing animation flow tự nhiên
- [ ] Scoring system chính xác
- [ ] Game logic hoàn toàn decoupled và testable
- [ ] Code coverage > 80% cho engine layer
