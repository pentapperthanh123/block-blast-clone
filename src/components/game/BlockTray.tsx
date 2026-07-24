/**
 * BlockTray — 3 fixed slots; empty slots stay put (no re-order)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { DraggableBlock } from './DraggableBlock';
import type { BoardLayout } from './GameBoard';
import { getBoardMetrics } from '../../utils/boardMetrics';

interface BlockTrayProps {
  boardLayout: BoardLayout | null;
}

export const BlockTray: React.FC<BlockTrayProps> = ({ boardLayout }) => {
  const currentPieces = useGameStore((s) => s.currentPieces);
  const isAnimatingClear = useGameStore((s) => s.isAnimatingClear);
  const { traySlotSize } = getBoardMetrics();

  // Always render 3 slots in fixed order
  const slots = [0, 1, 2].map((index) => currentPieces[index] ?? null);

  return (
    <View style={[styles.tray, { minHeight: traySlotSize + 8 }]}>
      {slots.map((block, index) =>
        block ? (
          <DraggableBlock
            key={block.id}
            block={block}
            boardLayout={boardLayout}
            disabled={isAnimatingClear}
          />
        ) : (
          <View
            key={`empty-slot-${index}`}
            style={[
              styles.emptySlot,
              { width: traySlotSize, height: traySlotSize },
            ]}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tray: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  emptySlot: {
    backgroundColor: 'transparent',
  },
});
