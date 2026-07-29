/**
 * ScaledBlockPiece — board-scale piece; memoized for DragOverlay stability.
 */

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BlockShape } from '../../types';
import { getThemePaintColor, resolveTheme } from '../../constants/themes';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { useGameStore } from '../../store/gameStore';
import { BlockCell } from './BlockCell';

interface ScaledBlockPieceProps {
  block: BlockShape;
  cellSize?: number;
  elevated?: boolean;
}

export const ScaledBlockPiece: React.FC<ScaledBlockPieceProps> = React.memo(({
  block,
  cellSize: cellSizeProp,
  elevated = false,
}) => {
  const { cellVisual: defaultCellVisual } = getBoardMetrics();
  const cellSize = cellSizeProp ?? defaultCellVisual;
  const radius = Math.max(4, cellSize * 0.12);
  const themeId = useGameStore((s) => s.currentTheme);
  const theme = resolveTheme(themeId);
  const paint = getThemePaintColor(theme, block.color);
  const skinMode = theme.skinMode ?? (theme.lockedBaseColor ? 'replace' : 'overlay');

  const cells = useMemo(() => {
    const out: React.ReactNode[] = [];
    block.shape.forEach((row, ri) => {
      out.push(
        <View key={ri} style={styles.row}>
          {row.map((cell, ci) =>
            cell ? (
              <View key={ci} style={{ width: cellSize, height: cellSize }}>
                <BlockCell
                  size={cellSize}
                  color={paint}
                  borderRadius={radius}
                  skinSource={theme.source}
                  skinMode={skinMode}
                  elevated={elevated}
                />
              </View>
            ) : (
              <View
                key={ci}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: 'transparent',
                }}
              />
            ),
          )}
        </View>,
      );
    });
    return out;
  }, [
    block.shape,
    cellSize,
    elevated,
    paint,
    radius,
    skinMode,
    theme.source,
  ]);

  return <View style={styles.piece}>{cells}</View>;
});
ScaledBlockPiece.displayName = 'ScaledBlockPiece';

export function getBoardPieceSize(block: BlockShape, cellSize?: number) {
  const { cellVisual } = getBoardMetrics();
  const size = cellSize ?? cellVisual;
  const cols = block.shape[0]?.length ?? 0;
  const rows = block.shape.length;
  return {
    width: cols * size,
    height: rows * size,
    cellSize: size,
  };
}

const styles = StyleSheet.create({
  piece: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
});
