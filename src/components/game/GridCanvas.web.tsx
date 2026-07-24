/**
 * GridCanvas (web) - View fallback for local preview only.
 * Production target is mobile; Skia WASM is not required on web.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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
    <View style={styles.canvas}>
      {cells.map((cell) => (
        <View
          key={cell.key}
          style={[
            styles.cell,
            {
              left: cell.x,
              top: cell.y,
              width: cell.size,
              height: cell.size,
              backgroundColor: cell.color,
              opacity: cell.opacity,
              borderRadius: CELL_RADIUS,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    width: GRID_WIDTH,
    height: GRID_HEIGHT,
    backgroundColor: UI_COLORS.BACKGROUND,
    position: 'relative',
    overflow: 'hidden',
  },
  cell: {
    position: 'absolute',
  },
});
