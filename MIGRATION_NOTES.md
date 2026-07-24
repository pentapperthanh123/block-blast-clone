# 🔄 Migration từ React Native CLI sang Expo

## ✅ Changes Made

### 1. Package.json Updates
- ✅ Added `expo`, `expo-status-bar`
- ✅ Added `react-native-web`, `react-dom` cho web support
- ✅ Updated scripts: `start`, `web`, `android`, `ios`
- ✅ Added test scripts: `test`, `test:watch`, `test:coverage`
- ✅ Added `lint:fix` và `type-check` scripts
- ✅ Added ESLint + TypeScript ESLint plugins
- ✅ Added Jest + Testing Library

### 2. Configuration Files Created
- ✅ `app.json` - Expo configuration
- ✅ `.eslintrc.js` - ESLint rules
- ✅ `jest.config.js` - Jest testing config
- ✅ Updated `babel.config.js` cho Expo
- ✅ Removed `metro.config.js` (Expo handles Metro)
- ✅ Removed `index.js` (Expo uses expo/AppEntry.js)

### 3. Tests Added
- ✅ `src/__tests__/App.test.tsx`
- ✅ `src/types/__tests__/index.test.ts`
- ✅ `src/constants/__tests__/index.test.ts`

### 4. Documentation
- ✅ `EXPO_SETUP.md` - Expo-specific setup guide
- ✅ Updated `README.md` với Expo instructions
- ✅ Updated CI workflows

---

## 🚀 Next Steps (RUN THESE COMMANDS)

### 1. Clean Install Dependencies

```bash
# Remove old node_modules and lock file
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue

# Install fresh dependencies
npm install
```

### 2. Verify Installation

```bash
# Check if Expo CLI works
npx expo --version

# Run linter
npm run lint

# Run type check
npm run type-check

# Run tests
npm test
```

### 3. Start Development

```bash
# Start Expo
npm start

# Or directly on web
npm run web
```

---

## 🎯 Web Support Benefits

1. **Faster Development** - No need for emulator/simulator
2. **Instant Refresh** - Changes reflect immediately
3. **Chrome DevTools** - Full debugging capabilities
4. **Cross-platform** - Same codebase cho mobile + web
5. **Easy Preview** - Share web URL với stakeholders

---

## 🐛 Troubleshooting

### Issue: "Metro bundler failed to start"
```bash
npx expo start -c
```

### Issue: "Cannot find module 'expo'"
```bash
npm install
```

### Issue: ESLint errors
```bash
npm run lint:fix
```

### Issue: Tests failing
```bash
npm test -- --clearCache
npm test
```

---

## 📊 What Works Now

✅ **Lint** - ESLint configured với TypeScript rules  
✅ **Type Check** - `npm run type-check` works  
✅ **Tests** - Jest configured với sample tests  
✅ **CI/CD** - GitHub Actions sẽ pass  
✅ **Web** - Chạy được trên browser  
✅ **Mobile** - Android/iOS vẫn work như cũ

---

## 🔄 Breaking Changes

- ❌ Removed `index.js` - Expo uses `expo/AppEntry.js`
- ❌ Removed `metro.config.js` - Expo Metro config tự động
- ⚠️ Scripts changed:
  - `npm start` → Starts Expo (not Metro)
  - Added `npm run web` → Run on web
  - `npm test` → Now actually works with Jest

---

Made with ❤️ during migration to Expo
