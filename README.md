# 🎮 Block Blast Clone

[![CI](https://github.com/pentapperthanh123/block-blast-clone/workflows/CI/badge.svg)](https://github.com/pentapperthanh123/block-blast-clone/actions/workflows/ci.yml)
[![Security Audit](https://github.com/pentapperthanh123/block-blast-clone/workflows/Security%20Audit/badge.svg)](https://github.com/pentapperthanh123/block-blast-clone/actions/workflows/security.yml)
[![Build Check](https://github.com/pentapperthanh123/block-blast-clone/workflows/Build%20Check/badge.svg)](https://github.com/pentapperthanh123/block-blast-clone/actions/workflows/build.yml)

Clone của game mobile "Block Blast" được xây dựng với **React Native**, **TypeScript**, và **React Native Skia** theo kiến trúc **Clean Architecture**.

![Block Blast Gameplay](https://via.placeholder.com/800x400/2E3C8F/FFFFFF?text=Block+Blast+Clone)

---

## 🚀 Features

- ✅ **8x8 Grid System** - Tetris-like puzzle mechanics
- ✅ **Pseudo-3D Blocks** - Gradient shading với Skia rendering
- ✅ **Line Clearing** - Clear rows/columns với combo system
- ✅ **Smooth Animations** - 60fps với React Native Reanimated
- ✅ **Drag & Drop** - Intuitive gesture controls
- ✅ **Score System** - Points, combos, và high score tracking
- ✅ **Clean Architecture** - Scalable, testable, maintainable code

---

## 🏗️ Architecture

Project tuân theo **Clean Architecture** với 4 layers rõ ràng:

```
┌─────────────────────────────────────┐
│   Presentation Layer (UI)           │  ← React Components, Skia Rendering
├─────────────────────────────────────┤
│   Interface Adapters                │  ← Zustand Store, Custom Hooks
├─────────────────────────────────────┤
│   Business Logic (Pure Functions)   │  ← Game Engine, Matrix Utils
├─────────────────────────────────────┤
│   Domain Layer                      │  ← Types, Constants
└─────────────────────────────────────┘
```

Xem chi tiết trong [BLUEPRINT.md](./BLUEPRINT.md) và [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md).

---

## 📦 Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Expo + React Native | ~51.0.0 |
| **Language** | TypeScript | ~5.3.3 |
| **Web Support** | React Native Web | ~0.19.10 |
| **Rendering** | React Native Skia | 1.2.3 |
| **Animation** | Reanimated | ~3.10.1 |
| **Gestures** | Gesture Handler | ~2.16.1 |
| **State** | Zustand | 4.5.0 |

---

## 🛠️ Setup & Installation

### Prerequisites

- Node.js >= 18.x
- React Native CLI
- Android Studio (cho Android development)
- Xcode (cho iOS development - macOS only)

### Installation

```bash
# Clone repository
git clone https://github.com/pentapperthanh123/block-blast-clone.git
cd block-blast-clone

# Install dependencies
npm install
```

### Run Development

```bash
# Start Expo dev server
npm start

# Then choose platform:
# Press 'w' - Run on Web
# Press 'a' - Run on Android
# Press 'i' - Run on iOS (macOS only)
```

**Or run directly:**

```bash
# Web (recommended for development)
npm run web

# Android
npm run android

# iOS (macOS only)
npm run ios
```

Xem thêm trong [EXPO_SETUP.md](./EXPO_SETUP.md).

---

## 🧪 Testing & Quality

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Lint code
npm run lint

# Type check
npx tsc --noEmit
```

---

## 📊 Project Status

### ✅ Phase 1: Foundation (Complete)
- [x] Project scaffold
- [x] Dependencies setup
- [x] Type definitions
- [x] Constants configuration
- [x] Documentation (Blueprint, Setup, Structure)

### ⏳ Phase 2: Core Gameplay (In Progress)
- [ ] Game engine pure functions (MatrixUtils, ScoreCalculator)
- [ ] Zustand store setup
- [ ] Grid rendering (Skia)
- [ ] Block rendering (pseudo-3D với Skia)
- [ ] Drag & drop gestures
- [ ] Line clearing logic

### 📅 Phase 3: Polish (Planned)
- [ ] Animations (Reanimated)
- [ ] Combo system
- [ ] Score display
- [ ] Sound effects
- [ ] Particle effects

### 📅 Phase 4: Game Features (Planned)
- [ ] High score persistence
- [ ] Game over detection
- [ ] Restart functionality
- [ ] Main menu
- [ ] Settings screen

---

## 🎨 Game Mechanics

### Grid System
- **Size:** 8x8 matrix
- **Cell States:** Empty (0) | Filled (1)
- **Coordinate System:** Top-left origin (0, 0)

### Scoring
```typescript
Base Score = POINTS_PER_BLOCK × blocksPlaced
Line Clear = POINTS_PER_LINE × linesCleared
Combo Bonus = baseScore × (COMBO_MULTIPLIER ^ comboCount)
```

### Color Palette
- 🟣 Purple: `#B565D8`
- 🔵 Cyan: `#4DD3E8`
- 🟠 Orange: `#FF8C42`
- 🟡 Yellow: `#FFD93D`
- 🟢 Green: `#6BCF7F`
- 🔴 Red: `#FF6B6B`
- 🔵 Blue: `#5B7CFF`

---

## 🤝 Contributing

### Branching Strategy

We use a **two-branch workflow**:
- **`dev`** - ⭐ **Default branch** - Development (active development)
- **`master`** - Production (stable releases)

> **Note:** `dev` is the default branch. All PRs automatically target `dev` unless specified otherwise.

### Workflow

1. Fork repository (automatically forks from `dev`)
2. Create feature branch: `git checkout -b feature/YourFeature`
3. Make your changes and commit: `git commit -m 'feat: add amazing feature'`
4. Push to your fork: `git push origin feature/YourFeature`
5. Open Pull Request (automatically targets `dev`)
6. Wait for CI checks to pass ✅
7. Get review approval (if required)
8. Merge! (branch will be automatically deleted after merge)

### Documentation

- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Complete Git workflow guide
- [BRANCH_PROTECTION_SETUP.md](./BRANCH_PROTECTION_SETUP.md) - Branch protection setup
- [Pull Request Template](./.github/PULL_REQUEST_TEMPLATE.md) - PR template

---

## 📝 Documentation

### Architecture & Setup
- [BLUEPRINT.md](./BLUEPRINT.md) - Master architecture document
- [EXPO_SETUP.md](./EXPO_SETUP.md) - Expo setup & platform guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Folder structure & dependencies
- [SETUP.md](./SETUP.md) - Original React Native CLI setup (legacy)

### Development Workflow
- [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) - Git branching strategy & workflow
- [BRANCH_PROTECTION_SETUP.md](./BRANCH_PROTECTION_SETUP.md) - GitHub branch protection guide

### CI/CD
- [.github/README.md](./.github/README.md) - GitHub Actions workflows documentation

---

## 📄 License

This project is a learning/portfolio project. Not for commercial use.

---

## 👨‍💻 Author

**Thanh Nguyen** ([@pentapperthanh123](https://github.com/pentapperthanh123))

---

## 🙏 Acknowledgments

- Original game: Block Blast by Hungry Studio
- Inspired by Tetris mechanics
- Built with love for learning React Native and Clean Architecture

---

<p align="center">Made with ❤️ and TypeScript</p>
