/**
 * Block Blast Clone - Main Entry Point
 * Clean Architecture - Presentation Layer
 */

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameScreen } from './src/screens/GameScreen';

const App = (): React.JSX.Element => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameScreen />
    </GestureHandlerRootView>
  );
};

export default App;
