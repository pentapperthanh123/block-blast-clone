/**
 * GridCanvas (native) - Skia renderer for iOS/Android (60fps target)
 */

import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Canvas, Rect, RoundedRect, Group } from '@shopify/react-native-skia';
import { useGameStore } from '../../store/gameStore';
import { UI_COLORS } from '../../constants';
import {
  buildGridCells,
  CELL_RADIUS,
  GRID_WIDTH,
  GRID_HEIGHT,
} from './gridCells';

export const GridCanvas: React.FC = () => {
  const { grid } = useGameStore();
  const cells = useMemo(() => buildGridCells(grid), [grid]);

  return (
    <Canvas style={styles.canvas}>
      <Rect
        x={0}
        y={0}
        width={GRID_WIDTH}
        height={GRID_HEIGHT}
        color={UI_COLORS.BACKGROUND}
      />
      <Group>
        {cells.map((cell) => (
          <RoundedRect
            key={cell.key}
            x={cell.x}
            y={cell.y}
            width={cell.size}
            height={cell.size}
            r={CELL_RADIUS}
            color={cell.color}
            opacity={cell.opacity}
          />
        ))}
      </Group>
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
