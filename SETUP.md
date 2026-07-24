# Block Blast Clone - Setup Guide

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 18.x
- **React Native CLI**: Latest
- **Android Studio** (cho Android development)
- **Xcode** (cho iOS development - macOS only)

## 🚀 Cài đặt Dependencies

### Bước 1: Cài đặt Node Modules

```powershell
npm install
# hoặc
yarn install
```

### Bước 2: Cài đặt iOS Pods (chỉ cho macOS)

```bash
cd ios
pod install
cd ..
```

### Bước 3: Verify Babel Configuration

File `babel.config.js` đã được cấu hình với plugin `react-native-reanimated/plugin` ở vị trí cuối cùng (bắt buộc).

**⚠️ Quan trọng**: Plugin Reanimated PHẢI là plugin cuối cùng trong array!

## 🔧 Cấu hình bổ sung

### React Native Gesture Handler

Thêm vào `MainActivity.java` (Android):

```java
package com.blockblastclone;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
// Thêm import này
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactActivity {
  
  @Override
  protected String getMainComponentName() {
    return "blockblastclone";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
      this,
      getMainComponentName(),
      DefaultNewArchitectureEntryPoint.getFabricEnabled()
    );
  }

  // Thêm method này
  @Override
  protected ReactRootView createRootView() {
    return new RNGestureHandlerEnabledRootView(this);
  }
}
```

## 📱 Chạy ứng dụng

### Android

```powershell
npm run android
```

### iOS (macOS only)

```bash
npm run ios
```

### Development Server

Trong terminal riêng:

```powershell
npm start
```

## 🏗️ Cấu trúc Clean Architecture

```
src/
├── components/        # UI Layer (Presentation)
│   ├── game/         # Game-specific components
│   ├── blocks/       # Skia block rendering
│   └── ui/           # Reusable UI components
├── engine/           # Business Logic Layer (Pure functions)
│   ├── MatrixUtils.ts
│   ├── ScoreCalculator.ts
│   └── CollisionDetector.ts
├── state/            # State Management (Zustand)
│   └── gameStore.ts
├── hooks/            # Custom React Hooks
├── types/            # TypeScript type definitions
├── utils/            # Utility functions
└── constants/        # Configuration constants
```

## 🧪 Verification

Sau khi cài đặt, chạy:

```powershell
# Check TypeScript
npx tsc --noEmit

# Check linting
npm run lint
```

## 📚 Core Dependencies

- **react-native-reanimated** (^3.10.0): Smooth animations
- **react-native-gesture-handler** (^2.16.0): Touch gestures
- **@shopify/react-native-skia** (^1.2.0): High-performance 2D rendering
- **zustand** (^4.5.0): Lightweight state management

## 🐛 Troubleshooting

### Issue: Metro bundler cache issues

```powershell
npm start -- --reset-cache
```

### Issue: Reanimated not working

1. Verify `babel.config.js` has the plugin at the end
2. Clear cache: `npm start -- --reset-cache`
3. Rebuild app

### Issue: Skia rendering issues

Ensure you've run `npm install` sau khi add @shopify/react-native-skia.
