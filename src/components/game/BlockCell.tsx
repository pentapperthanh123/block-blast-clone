/**
 * BlockCell — theme skin fills the cell. Memo-friendly: no inline style objects
 * passed to ThemeIcon; no store; ghost is a flat View (no SVG).
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemeIcon } from '../ui/ThemeIcon';
import { BOARD_CONSTANTS } from '../../constants';

interface BlockCellProps {
  size: number;
  color: string;
  borderRadius?: number;
  isEmpty?: boolean;
  isGhost?: boolean;
  isValidGhost?: boolean;
  ghostColor?: string;
  skinSource: string;
  skinMode?: 'replace' | 'overlay';
  elevated?: boolean;
  style?: ViewStyle | ViewStyle[];
}

function blockCellPropsEqual(
  prev: Readonly<BlockCellProps>,
  next: Readonly<BlockCellProps>,
): boolean {
  return (
    prev.size === next.size &&
    prev.color === next.color &&
    prev.borderRadius === next.borderRadius &&
    prev.isEmpty === next.isEmpty &&
    prev.isGhost === next.isGhost &&
    prev.isValidGhost === next.isValidGhost &&
    prev.ghostColor === next.ghostColor &&
    prev.skinSource === next.skinSource &&
    prev.skinMode === next.skinMode &&
    prev.elevated === next.elevated &&
    prev.style === next.style
  );
}

export const BlockCell: React.FC<BlockCellProps> = React.memo(({
  size,
  color,
  borderRadius,
  isEmpty = false,
  isGhost = false,
  isValidGhost = true,
  ghostColor,
  skinSource,
  skinMode = 'overlay',
  elevated = false,
  style,
}) => {
  const radius =
    borderRadius ??
    Math.max(BOARD_CONSTANTS.MIN_RADIUS, size * BOARD_CONSTANTS.CELL_RADIUS_RATIO);
  const fillColor = isGhost ? (ghostColor ?? color) : color;

  if (isEmpty && !isGhost) {
    return (
      <View
        style={[
          styles.emptyCell,
          { width: size, height: size, borderRadius: radius },
          style,
        ]}
      />
    );
  }

  // Flat scout — no SVG (keeps ThemeIcon memo stable on the board)
  if (isGhost && isValidGhost) {
    return (
      <View
        style={[
          styles.ghostCell,
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: fillColor,
          },
          style,
        ]}
      />
    );
  }

  const activeContent = (
    <View
      style={[
        styles.activeCell,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor:
            skinMode === 'replace' ? 'transparent' : fillColor,
        },
        style,
      ]}
    >
      <View style={styles.skinLayer}>
        <ThemeIcon source={skinSource} size={size} />
      </View>
      <View
        pointerEvents="none"
        style={[
          styles.glossyGlare,
          {
            borderTopLeftRadius: radius,
            borderTopRightRadius: radius,
          },
        ]}
      />
    </View>
  );

  if (elevated) {
    return (
      <View
        style={[
          { width: size, height: size, borderRadius: radius },
          styles.elevatedShadow,
        ]}
      >
        {activeContent}
      </View>
    );
  }

  return activeContent;
}, blockCellPropsEqual);

const styles = StyleSheet.create({
  emptyCell: {
    backgroundColor: 'rgba(30, 42, 102, 0.85)',
  },
  ghostCell: {
    opacity: BOARD_CONSTANTS.GHOST_OPACITY,
  },
  activeCell: {
    position: 'relative',
    overflow: 'hidden',
  },
  skinLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  elevatedShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
