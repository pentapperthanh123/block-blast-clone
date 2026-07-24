# Task: Block Blast Game Engine Foundation

## 🎯 Objective

Implement core game engine for Block Blast clone following Clean Architecture principles.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────┐
│         PRESENTATION LAYER (React)          │
│  • GameScreen                               │
│  • GridCanvas (Skia)                        │
│  • BlockPicker                              │
│  • ScoreDisplay                             │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      INTERFACE ADAPTERS (Zustand)           │
│  • GameStore                                │
│  • GridViewModel                            │
│  • BlockViewModel                           │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         BUSINESS LOGIC (Pure)               │
│  • GameEngine                               │
│  • GridManager                              │
│  • BlockGenerator                           │
│  • LineDetector                             │
│  • ScoreCalculator                          │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│            DOMAIN LAYER                      │
│  • Types (Grid, Block, GameState)           │
│  • Constants                                │
└─────────────────────────────────────────────┘
```

---

## 📦 Phase 1: Domain Layer (Types & Constants) ✅

**Status:** Already completed in initial setup

**Files:**
- `src/types/index.ts` - Core type definitions
- `src/constants/index.ts` - Game constants

---

## 🎮 Phase 2: Business Logic Layer

### 2.1 Grid Manager (`src/engine/GridManager.ts`)

**Purpose:** Pure functions for grid operations

```typescript
class GridManager {
  createEmptyGrid(): Grid
  canPlaceBlock(grid: Grid, block: BlockShape, position: Position): boolean
  placeBlock(grid: Grid, block: BlockShape, position: Position): Grid
  getFilledPositions(grid: Grid): Position[]
}
```

**Tests:** `src/engine/__tests__/GridManager.test.ts`

---

### 2.2 Line Detector (`src/engine/LineDetector.ts`)

**Purpose:** Detect completed rows/columns

```typescript
class LineDetector {
  detectLines(grid: Grid): { rows: number[]; columns: number[] }
  clearLines(grid: Grid, lines: { rows: number[]; columns: number[] }): Grid
  countClearedCells(lines: { rows: number[]; columns: number[] }): number
}
```

**Tests:** `src/engine/__tests__/LineDetector.test.ts`

---

### 2.3 Block Generator (`src/engine/BlockGenerator.ts`)

**Purpose:** Generate random block shapes

```typescript
class BlockGenerator {
  generateBlock(): BlockShape
  generateBlockSet(count: number): BlockShape[]
  validateBlockShape(shape: BlockShape): boolean
}
```

**Block Shapes (Tetromino-inspired):**
- I: 4x1 line
- L: L-shape
- T: T-shape  
- Square: 2x2
- Small: 1x1, 2x1, 3x1

**Tests:** `src/engine/__tests__/BlockGenerator.test.ts`

---

### 2.4 Score Calculator (`src/engine/ScoreCalculator.ts`)

**Purpose:** Calculate points and combos

```typescript
class ScoreCalculator {
  calculateBlockPlacementPoints(block: BlockShape): number
  calculateLineClearPoints(linesCleared: number, combo: number): number
  calculateComboMultiplier(consecutiveClears: number): number
}
```

**Scoring Rules:**
- Block placement: 10 points per cell
- Line clear: 100 points per line
- Combo multiplier: 1.5x, 2x, 2.5x, 3x

**Tests:** `src/engine/__tests__/ScoreCalculator.test.ts`

---

### 2.5 Game Engine (`src/engine/GameEngine.ts`)

**Purpose:** Orchestrate all game logic

```typescript
class GameEngine {
  constructor(
    private gridManager: GridManager,
    private lineDetector: LineDetector,
    private blockGenerator: BlockGenerator,
    private scoreCalculator: ScoreCalculator
  )

  initializeGame(): GameState
  placeBlock(state: GameState, block: BlockShape, position: Position): GameState
  checkGameOver(state: GameState, availableBlocks: BlockShape[]): boolean
  processLineClear(state: GameState): GameState
}
```

**Tests:** `src/engine/__tests__/GameEngine.test.ts`

---

## 🗄️ Phase 3: State Management (Zustand)

### 3.1 Game Store (`src/store/gameStore.ts`)

```typescript
interface GameStore {
  // State
  gameState: GameState
  availableBlocks: BlockShape[]
  selectedBlock: BlockShape | null
  isGameOver: boolean

  // Actions
  initGame: () => void
  selectBlock: (block: BlockShape) => void
  placeBlock: (position: Position) => void
  resetGame: () => void
}
```

**Features:**
- Persist high score to AsyncStorage
- Zustand devtools integration (development)

**Tests:** `src/store/__tests__/gameStore.test.ts`

---

## 🎨 Phase 4: Presentation Layer

### 4.1 Game Screen (`src/screens/GameScreen.tsx`)

**Layout:**
```
┌─────────────────────────────┐
│   Score: 1250   Best: 5000  │ <- Header
├─────────────────────────────┤
│                             │
│     ┌───────────────┐       │
│     │   8x8 Grid    │       │ <- Main Grid (Skia Canvas)
│     │               │       │
│     └───────────────┘       │
│                             │
├─────────────────────────────┤
│   [Block1] [Block2] [Block3]│ <- Block Picker
└─────────────────────────────┘
```

**Components:**
- Header (Score, Best Score, Reset button)
- GridCanvas (Skia)
- BlockPicker (Available blocks)

---

### 4.2 Grid Canvas (`src/components/GridCanvas.tsx`)

**Technology:** React Native Skia

**Features:**
- 8x8 grid rendering
- Pseudo-3D block styling (gradient shading)
- Placement preview (when dragging)
- Line clear animation
- 60fps rendering

**Optimizations:**
- Memoize grid cells
- Use `useCallback` for event handlers
- Skia shader for gradients

---

### 4.3 Block Picker (`src/components/BlockPicker.tsx`)

**Features:**
- Display 3 available blocks
- Drag & drop gesture
- Touch target: minimum 60x60px per block
- Haptic feedback on select

**Gestures:**
- `onPress`: Select block
- `onLongPress + Pan`: Drag to grid

---

### 4.4 Animations (`src/animations/`)

**Line Clear Animation:**
- Fade out cleared cells
- Scale down effect
- Duration: 300ms
- Use `react-native-reanimated`

**Block Placement:**
- Drop animation
- Bounce effect on land
- Duration: 200ms

---

## 🧪 Phase 5: Testing Strategy

### Unit Tests (Priority 1)
- [x] Types & Constants
- [ ] GridManager (pure functions)
- [ ] LineDetector
- [ ] BlockGenerator
- [ ] ScoreCalculator
- [ ] GameEngine (orchestration)

### Integration Tests (Priority 2)
- [ ] GameStore with GameEngine
- [ ] Full game flow (init → place → clear → score)

### E2E Tests (Priority 3)
- [ ] Complete game round
- [ ] Game over scenario
- [ ] High score persistence

---

## 📊 Success Criteria

- [ ] 60fps gameplay on low-end devices
- [ ] Touch targets ≥ 48px
- [ ] Game logic 100% unit tested
- [ ] No memory leaks (Skia cleanup)
- [ ] Clean Architecture layers respected
- [ ] Works on iOS, Android, Web

---

## 🚀 Implementation Order

1. **Phase 2:** Business Logic (Pure functions, fully tested)
2. **Phase 3:** State Management (Zustand store)
3. **Phase 4:** UI Components (Skia rendering)
4. **Phase 5:** Polish (Animations, haptics)

---

## 📝 Notes

- **Performance:** Game loop must be 60fps. Use `useNativeDriver: true` for all animations.
- **State:** Keep game state immutable. Zustand handles updates.
- **Testing:** Business logic is pure → easy to test.
- **Skia:** Use Canvas API, not individual components for grid (better performance).

---

## 🔗 References

- [Clean Architecture](../BLUEPRINT.md)
- [Project Structure](../PROJECT_STRUCTURE.md)
- [React Native Skia Docs](https://shopify.github.io/react-native-skia/)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
