/**
 * Block Blast Clone - Main Entry Point
 * Clean Architecture - Presentation Layer
 */

import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// TODO: Import main game screen when implemented
// import GameScreen from './src/screens/GameScreen';

const App = (): React.JSX.Element => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#2E3C8F" />
        {/* TODO: Render GameScreen */}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#2E3C8F',
  },
});

export default App;
