/**
 * Block Blast Clone - Main Entry Point
 */

import React, { useLayoutEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppStore } from './src/store/appStore';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { lockWebViewport } from './src/utils/lockWebViewport';
import { UI_COLORS } from './src/constants';

lockWebViewport();

const App = (): React.JSX.Element => {
  const route = useAppStore((s) => s.route);

  useLayoutEffect(() => {
    lockWebViewport();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      {route === 'loading' && <LoadingScreen />}
      {route === 'home' && <HomeScreen />}
      {route === 'classic' && <GameScreen />}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: Platform.select({
    web: {
      flex: 1,
      height: '100%' as unknown as number,
      maxHeight: '100%' as unknown as number,
      overflow: 'hidden',
      backgroundColor: UI_COLORS.BACKGROUND,
    },
    default: {
      flex: 1,
      backgroundColor: UI_COLORS.BACKGROUND,
    },
  }),
});

export default App;
