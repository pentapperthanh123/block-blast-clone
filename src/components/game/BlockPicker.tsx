/**
 * BlockPicker - Display available blocks
 * Presentation Layer
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { BlockShape } from '../../types';
import { UI_COLORS, CELL_SIZE } from '../../constants';

interface BlockPreviewProps {
  block: BlockShape;
  onSelect: () => void;
}

const BlockPreview: React.FC<BlockPreviewProps> = ({ block, onSelect }) => {
  const blockHeight = block.shape.length;
  const blockWidth = block.shape[0].length;
  const previewSize = 80;
  const cellSize = Math.min(
    previewSize / Math.max(blockWidth, blockHeight),
    CELL_SIZE * 0.6
  );

  return (
    <TouchableOpacity style={styles.blockContainer} onPress={onSelect}>
      <View style={styles.blockPreview}>
        {block.shape.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.blockRow}>
            {row.map((cell, colIndex) => {
              if (cell === 0) {
                return <View key={colIndex} style={{ width: cellSize, height: cellSize }} />;
              }

              return (
                <View
                  key={colIndex}
                  style={[
                    styles.blockCell,
                    {
                      width: cellSize,
                      height: cellSize,
                      backgroundColor: block.color,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export const BlockPicker: React.FC = () => {
  const { currentPieces, placeBlock } = useGameStore();

  const handleBlockSelect = (block: BlockShape) => {
    // TODO: Implement drag & drop
    // For now, just try to place at (0,0)
    placeBlock(block, { row: 0, col: 0 });
  };

  const pieces = currentPieces.filter((p): p is BlockShape => p !== null);

  if (pieces.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No blocks available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pieces.map((block) => (
        <BlockPreview
          key={block.id}
          block={block}
          onSelect={() => handleBlockSelect(block)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
  blockContainer: {
    padding: 12,
    backgroundColor: UI_COLORS.GRID_BACKGROUND,
    borderRadius: 12,
    minWidth: 100,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockPreview: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  blockRow: {
    flexDirection: 'row',
  },
  blockCell: {
    borderRadius: 2,
    margin: 1,
  },
  emptyText: {
    color: UI_COLORS.TEXT_PRIMARY,
    fontSize: 16,
    opacity: 0.5,
  },
});
