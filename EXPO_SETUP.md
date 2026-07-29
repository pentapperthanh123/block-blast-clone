# Expo Setup Guide - Block Blast

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.x
- npm hoặc yarn

### Installation

```bash
# Install dependencies
npm install

# Start Expo dev server
npm start
```

Sau đó chọn platform:
- Press `w` - Run on **Web** (Chrome/Firefox)
- Press `a` - Run on **Android** (emulator/device)
- Press `i` - Run on **iOS** (simulator - macOS only)

---

## 📱 Run on Different Platforms

### Web
```bash
npm run web
```
Opens browser tại `http://localhost:8081` (hoặc port khác nếu bận)

### Android
```bash
npm run android
```
Yêu cầu: Android Studio + emulator đang chạy, hoặc device đã kết nối

### iOS (macOS only)
```bash
npm run ios
```
Yêu cầu: Xcode + iOS Simulator

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 🔍 Linting & Type Checking

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# TypeScript type check
npm run type-check
```

---

## 🎨 Assets

Expo yêu cầu các assets sau trong folder `assets/`:

- `icon.png` - App icon (1024x1024px)
- `splash.png` - Splash screen (1284x2778px recommended)
- `adaptive-icon.png` - Android adaptive icon (1024x1024px)
- `favicon.png` - Web favicon (48x48px or 32x32px)

Generate tại: https://www.appicon.co/

---

## 📦 Dependencies

### Core
- **expo** - Expo SDK
- **react-native-web** - Web support
- **react-dom** - React DOM for web

### Game Libraries
- **@shopify/react-native-skia** - 2D rendering
- **react-native-reanimated** - Animations
- **react-native-gesture-handler** - Touch gestures
- **zustand** - State management

### Dev Tools
- **eslint** + **@typescript-eslint** - Linting
- **jest** + **@testing-library/react-native** - Testing
- **prettier** - Code formatting

---

## 🏗️ Project Structure

```
block-blast-clone/
├── app.json                 # Expo configuration
├── App.tsx                  # Root component
├── assets/                  # Images, fonts, etc.
├── src/
│   ├── components/          # UI components
│   ├── engine/              # Game logic
│   ├── state/               # Zustand stores
│   ├── hooks/               # Custom hooks
│   ├── types/               # TypeScript types
│   ├── constants/           # Constants
│   ├── utils/               # Utilities
│   └── __tests__/           # Tests
├── .eslintrc.js             # ESLint config
├── jest.config.js           # Jest config
└── tsconfig.json            # TypeScript config
```

---

## 🌐 Web-Specific Notes

### Responsive Design
Web version cần handle different screen sizes:
- Desktop: Full game grid
- Tablet: Scaled down
- Mobile: Portrait orientation recommended

### Performance
- Skia rendering works on web via WebGL
- Reanimated animations optimized for 60fps
- Consider lazy loading for large assets

### Browser Support
- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🐛 Troubleshooting

### "Metro bundler failed to start"
```bash
# Clear cache
npx expo start -c
```

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### ESLint errors
```bash
# Auto-fix
npm run lint:fix
```

### Tests failing
```bash
# Clear Jest cache
npm test -- --clearCache
npm test
```

---

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [React Native Skia](https://shopify.github.io/react-native-skia/)
- [Reanimated Docs](https://docs.swmansion.com/react-native-reanimated/)

---

## 🚀 Deployment

### Web
```bash
# Build for production
npx expo export:web

# Output: web-build/
# Deploy to Netlify, Vercel, GitHub Pages, etc.
```

### Mobile (EAS Build)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Build iOS
eas build --platform ios --profile preview
```

---

Made with ❤️ using Expo + React Native
