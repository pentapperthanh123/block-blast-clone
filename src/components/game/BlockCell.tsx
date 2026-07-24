/**
 * BlockCell — 3D Glossy/Bevel block cell component
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface BlockCellProps {
  size: number;
  color: string;
  borderRadius?: number;
  isEmpty?: boolean;
  isGhost?: boolean;
  isValidGhost?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export const BlockCell: React.FC<BlockCellProps> = ({
  size,
  color,
  borderRadius,
  isEmpty = false,
  isGhost = false,
  isValidGhost = true,
  style,
}) => {
  const radius = borderRadius ?? Math.max(4, size * 0.16);
  const borderWidth = Math.max(1.5, Math.floor(size * 0.09));

  if (isEmpty) {
    return (
      <View
        style={[
          styles.emptyCell,
          {
            width: size,
            height: size,
            borderRadius: radius,
          },
          style,
        ]}
      />
    );
  }

  if (isGhost) {
    const ghostBg = isValidGhost ? 'rgba(255,255,255,0.45)' : 'rgba(239,68,68,0.35)';
    const ghostBorder = isValidGhost ? 'rgba(255,255,255,0.8)' : 'rgba(239,68,68,0.7)';
    return (
      <View
        style={[
          styles.ghostCell,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: ghostBg,
            borderColor: ghostBorder,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.activeCell,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color,
          borderWidth,
          borderTopColor: 'rgba(255,255,255,0.5)',
          borderLeftColor: 'rgba(255,255,255,0.4)',
          borderBottomColor: 'rgba(0,0,0,0.35)',
          borderRightColor: 'rgba(0,0,0,0.25)',
        },
        style,
      ]}
    >
      {/* Top glossy inner glare overlay */}
      <View
        style={[
          styles.glossyGlare,
          {
            borderTopLeftRadius: Math.max(2, radius - borderWidth),
            borderTopRightRadius: Math.max(2, radius - borderWidth),
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emptyCell: {
    backgroundColor: '#1E2A66',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  ghostCell: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  activeCell: {
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  glossyGlare: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '42%',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});
