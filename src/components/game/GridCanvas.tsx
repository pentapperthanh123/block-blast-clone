/**
 * GridCanvas - Game grid renderer using Skia
 * Presentation Layer - 60fps rendering
 */

import React, { useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Canvas, Rect, RoundedRect, Group } from '@shopify/react-native-skia';
import { useGameStore } from '../../store/gameStore';
import { GRID_SIZE, CELL_SIZE, UI_COLORS, BLOCK_COLORS_ARRAY } from '../../constants';
import { CellState } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_WIDTH = GRID_SIZE * CELL_SIZE;
const GRID_HEIGHT = GRID_SIZE * CELL_SIZE;
const GRID_PADDING = 2;
const CELL_RADIUS = 4;

export const GridCanvas: React.FC = () => {
  const { grid } = useGameStore();

  // Memoize grid cells rendering
  const cells = useMemo(() => {
    const cellElements: JSX.Element[] = [];

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const x = col * CELL_SIZE + GRID_PADDING;
        const y = row * CELL_SIZE + GRID_PADDING;
        const size = CELL_SIZE - GRID_PADDING * 2;

        const isFilled = grid[row][col] === CellState.Filled;
        const color = isFilled
          ? BLOCK_COLORS_ARRAY[row % BLOCK_COLORS_ARRAY.length] // Simple color distribution
          : UI_COLORS.GRID_BACKGROUND;

        cellElements.push(
          <RoundedRect
            key={`${row}-${col}`}
            x={x}
            y={y}
            width={size}
            height={size}
            r={CELL_RADIUS}
            color={color}
            opacity={isFilled ? 1 : 0.3}
          />
        );
      }
    }

    return cellElements;
  }, [grid]);

  return (
    <Canvas style={styles.canvas}>
      {/* Background */}
      <Rect
        x={0}
        y={0}
        width={GRID_WIDTH}
        height={GRID_HEIGHT}
        color={UI_COLORS.BACKGROUND}
      />

      {/* Grid cells */}
      <Group>{cells}</Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    backgroundColor: UI_COLORS.BACKGROUND,
  },
});
