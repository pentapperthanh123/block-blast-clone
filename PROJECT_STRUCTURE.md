# Block Blast Clone - Project Structure

## 📁 Complete Folder Structure

```
block-blast-clone/
├── .gitignore
├── package.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── .prettierrc.js
├── BLUEPRINT.md              # Master architecture document
├── SETUP.md                  # Installation guide
├── PROJECT_STRUCTURE.md      # This file
├── index.js                  # React Native entry point
├── App.tsx                   # Main app component
│
├── src/
│   ├── types/
│   │   └── index.ts          # Core type definitions (Grid, BlockShape, GameState)
│   │
│   ├── constants/
│   │   └── index.ts          # Game constants (GRID_SIZE, COLORS, SCORES)
│   │
│   ├── engine/               # 🧠 BUSINESS LOGIC LAYER (Pure Functions)
│   │   ├── index.ts          # Module exports
│   │   ├── MatrixUtils.ts    # [TODO Step 3] Grid operations
│   │   ├── ScoreCalculator.ts # Score computation
│   │   └── CollisionDetector.ts # Placement validation
│   │
│   ├── state/                # 🔄 STATE MANAGEMENT LAYER
│   │   ├── index.ts          # Module exports
│   │   └── gameStore.ts      # [TODO Step 2] Zustand store
│   │
│   ├── hooks/                # 🎣 CUSTOM HOOKS
│   │   ├── index.ts          # Module exports
│   │   ├── useGameEngine.ts  # Game logic hook
│   │   └── useBlockDrag.ts   # Drag & drop hook
│   │
│   ├── utils/                # 🛠️ UTILITIES
│   │   ├── index.ts          # Module exports
│   │   ├── colorUtils.ts     # Color manipulation
│   │   └── animationHelpers.ts # Animation utilities
│   │
│   ├── components/           # 🎨 UI LAYER
│   │   ├── game/             # Game-specific components
│   │   │   ├── index.ts
│   │   │   ├── GameBoard.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   └── PieceSelector.tsx
│   │   │
│   │   ├── blocks/           # Skia rendering components
│   │   │   ├── index.ts
│   │   │   ├── SkiaBlock.tsx
│   │   │   └── SkiaGrid.tsx
│   │   │
│   │   └── ui/               # Reusable UI components
│   │       ├── index.ts
│   │       ├── Button.tsx
│   │       └── ComboText.tsx
│   │
│   └── assets/               # Images, fonts, sounds
│       ├── images/
│       ├── fonts/
│       └── sounds/
│
├── android/                  # Android native code
│   └── ...
│
└── ios/                      # iOS native code
    └── ...
```

## 📊 Layer Dependencies

```
┌─────────────────────┐
│   App.tsx           │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Components/       │
│   - GameBoard       │
│   - SkiaGrid        │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Hooks/            │
│   - useGameEngine   │
│   - useBlockDrag    │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   State/            │
│   - gameStore       │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│   Engine/           │    ┌──────────────┐
│   - MatrixUtils     │◄───│   Types/     │
│   - ScoreCalc       │    │   Constants/ │
└─────────────────────┘    └──────────────┘
```

**Dependency Rules:**

✅ **ALLOWED:**
- Components → Hooks
- Hooks → State
- State → Engine
- Engine → Types/Constants
- Everyone → Types/Constants

❌ **FORBIDDEN:**
- Engine → State (breaks decoupling)
- Engine → Hooks (breaks purity)
- Engine → Components (breaks architecture)
- State → Components (use hooks as bridge)

## 🎯 Module Responsibilities

### Types (`src/types/`)
- **Purpose**: Define domain models
- **Dependencies**: None
- **Exports**: Interfaces, type aliases, enums

### Constants (`src/constants/`)
- **Purpose**: Configuration values
- **Dependencies**: None
- **Exports**: Const objects, numbers, strings

### Engine (`src/engine/`)
- **Purpose**: Core game logic (PURE FUNCTIONS)
- **Dependencies**: Types, Constants only
- **Exports**: Pure functions for game operations
- **Rules**:
  - NO side effects
  - NO state mutations
  - NO React/RN imports
  - 100% testable

### State (`src/state/`)
- **Purpose**: Centralized state management
- **Dependencies**: Engine, Types, Constants
- **Exports**: Zustand stores
- **Rules**:
  - Calls engine functions
  - Manages app state
  - Provides actions to UI

### Hooks (`src/hooks/`)
- **Purpose**: Bridge between React and State
- **Dependencies**: State, Engine (optional), Types
- **Exports**: Custom React hooks
- **Rules**:
  - Connect UI to state
  - Handle side effects
  - Manage component lifecycle

### Components (`src/components/`)
- **Purpose**: UI rendering
- **Dependencies**: Hooks, Types, Constants
- **Exports**: React components
- **Rules**:
  - Presentation logic only
  - Use hooks for data/logic
  - Skia for high-performance rendering

## 🔄 Data Flow

```
User Interaction (Touch)
        │
        ▼
Component (GameBoard)
        │
        ▼
Hook (useGameEngine)
        │
        ▼
Store Action (gameStore.placeBlock)
        │
        ▼
Engine Function (MatrixUtils.placeBlock)
        │
        ▼
New State (updated grid)
        │
        ▼
Hook (re-renders component)
        │
        ▼
UI Update (Skia re-draws)
```

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase.tsx | `GameBoard.tsx` |
| Hooks | camelCase.ts | `useGameEngine.ts` |
| Utils | camelCase.ts | `colorUtils.ts` |
| Types | PascalCase or camelCase | `GameState` interface |
| Constants | UPPER_SNAKE_CASE | `GRID_SIZE` |

## ✅ Step 1 Completion Status

- [x] Folder structure created
- [x] Configuration files (babel, tsconfig, metro)
- [x] Package.json with dependencies
- [x] Type definitions
- [x] Constants
- [x] Module index files (placeholders)
- [x] Entry point (App.tsx)
- [x] Documentation (BLUEPRINT, SETUP, this file)
- [x] Git configuration (.gitignore)
