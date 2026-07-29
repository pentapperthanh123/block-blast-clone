/**
 * ClearBurst — Vibrant line-targeted particle bursts & laser beams on line clear
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Ellipse, Rect, Polygon } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { resolveTheme, type ClearParticleShape } from '../../constants/themes';

interface ParticleData {
  id: string;
  left: number;
  top: number;
  delay: number;
  color: string;
  shape: ClearParticleShape;
  size: number;
  burstX: number;
  burstY: number;
}

interface BeamData {
  id: string;
  isRow: boolean;
  index: number;
  color: string;
}

export const ClearBurst = React.memo(() => {
  const clearingRows = useGameStore((s) => s.clearingRows);
  const clearingColumns = useGameStore((s) => s.clearingColumns);
  const themeId = useGameStore((s) => s.currentTheme);
  const theme = resolveTheme(themeId);
  const fx = theme.clearFx;
  const active = clearingRows.length > 0 || clearingColumns.length > 0;
  const { cellStep, boardSize } = getBoardMetrics();

  const { particles, beams } = useMemo(() => {
    if (!active || !fx?.colors?.length) return { particles: [], beams: [] };

    const colors = fx.colors;
    const pList: ParticleData[] = [];
    const bList: BeamData[] = [];

    // 1. Generate Glowing Energy Beams for each cleared row & column
    clearingRows.forEach((r) => {
      bList.push({
        id: `beam-row-${r}`,
        isRow: true,
        index: r,
        color: colors[r % colors.length],
      });
    });

    clearingColumns.forEach((c) => {
      bList.push({
        id: `beam-col-${c}`,
        isRow: false,
        index: c,
        color: colors[c % colors.length],
      });
    });

    // 2. Generate Particles targeted along cleared Rows
    clearingRows.forEach((r) => {
      const rowY = r * cellStep + cellStep / 2;
      const count = 10;
      for (let i = 0; i < count; i++) {
        const posX = (i / (count - 1)) * (boardSize - 16) + 8;
        const angle = (i % 2 === 0 ? -1 : 1) * (Math.PI / 3 + (i % 3) * 0.2);
        const dist = 18 + (i % 4) * 8;
        pList.push({
          id: `p-row-${r}-${i}`,
          left: posX,
          top: rowY,
          delay: (i % 4) * 20,
          color: colors[i % colors.length],
          shape: fx.shape,
          size: fx.size + (i % 3) * 2.5,
          burstX: Math.cos(angle) * dist * 1.2,
          burstY: Math.sin(angle) * dist * 1.2,
        });
      }
    });

    // 3. Generate Particles targeted along cleared Columns
    clearingColumns.forEach((c) => {
      const colX = c * cellStep + cellStep / 2;
      const count = 10;
      for (let i = 0; i < count; i++) {
        const posY = (i / (count - 1)) * (boardSize - 16) + 8;
        const angle = (i % 2 === 0 ? -1 : 1) * (Math.PI / 6 + (i % 3) * 0.2);
        const dist = 18 + (i % 4) * 8;
        pList.push({
          id: `p-col-${c}-${i}`,
          left: colX,
          top: posY,
          delay: (i % 4) * 20,
          color: colors[(i + 2) % colors.length],
          shape: fx.shape,
          size: fx.size + (i % 3) * 2.5,
          burstX: Math.sin(angle) * dist * 1.2,
          burstY: Math.cos(angle) * dist * 1.2,
        });
      }
    });

    // 4. Extra Star Burst at Row-Column Intersections
    clearingRows.forEach((r) => {
      clearingColumns.forEach((c) => {
        const cx = c * cellStep + cellStep / 2;
        const cy = r * cellStep + cellStep / 2;
        // Add a giant flash at intersection
        pList.push({
          id: `p-flash-${r}-${c}`,
          left: cx,
          top: cy,
          delay: 0,
          color: '#FFFFFF',
          shape: 'star',
          size: cellStep * 1.5,
          burstX: 0,
          burstY: 0,
        });

        // 8 directional starburst instead of 6
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * Math.PI * 2;
          pList.push({
            id: `p-x-${r}-${c}-${i}`,
            left: cx,
            top: cy,
            delay: 0,
            color: fx.colors[i % fx.colors.length], // use theme colors
            shape: fx.shape,
            size: fx.size + 4 + Math.random() * 4,
            burstX: Math.cos(angle) * (35 + Math.random() * 20),
            burstY: Math.sin(angle) * (35 + Math.random() * 20),
          });
        }
      });
    });

    return { particles: pList, beams: bList };
  }, [active, boardSize, cellStep, clearingRows, clearingColumns, fx]);

  if (!active) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.layer, { width: boardSize, height: boardSize }]}
    >
      {/* Laser Beams */}
      {beams.map((b) => (
        <LineBeam key={b.id} {...b} cellStep={cellStep} boardSize={boardSize} />
      ))}

      {/* Burst Particles */}
      {particles.map((p) => (
        <Spark key={p.id} {...p} />
      ))}
    </View>
  );
});
ClearBurst.displayName = 'ClearBurst';

/** Expanding glowing laser line across cleared row/col */
const LineBeam = React.memo<{
  isRow: boolean;
  index: number;
  color: string;
  cellStep: number;
  boardSize: number;
}>(({ isRow, index, color, cellStep, boardSize }) => {
  const opacity = useSharedValue(0.9);
  const scale = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withTiming(0, { duration: 450, easing: Easing.out(Easing.quad) });
    scale.value = withTiming(2.5, { duration: 380, easing: Easing.out(Easing.back(1.5)) });
  }, [opacity, scale]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { scaleX: isRow ? scale.value : 1 },
      { scaleY: isRow ? 1 : scale.value },
    ],
  }));

  const posStyle = isRow
    ? {
        left: 0,
        top: index * cellStep,
        width: boardSize,
        height: cellStep,
      }
    : {
        left: index * cellStep,
        top: 0,
        width: cellStep,
        height: boardSize,
      };

  return (
    <Animated.View style={[styles.beam, posStyle, animStyle]}>
      <View style={[styles.beamCore, { backgroundColor: color, borderColor: '#FFFFFF' }]} />
    </Animated.View>
  );
});
LineBeam.displayName = 'LineBeam';

const Spark = React.memo<ParticleData>(
  ({ left, top, delay, color, shape, size, burstX, burstY }) => {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.4);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
      opacity.value = withDelay(delay, withTiming(1, { duration: 60 }));
      scale.value = withDelay(
        delay,
        withTiming(1.5, {
          duration: 200,
          easing: Easing.out(Easing.back(1.5)),
        }),
      );
      tx.value = withDelay(
        delay,
        withTiming(burstX, { duration: 320, easing: Easing.out(Easing.cubic) }),
      );
      ty.value = withDelay(
        delay,
        withTiming(burstY, {
          duration: 320,
          easing: Easing.out(Easing.cubic),
        }),
      );
      rotate.value = withDelay(
        delay,
        withTiming(45 + (delay % 4) * 30, { duration: 340 }),
      );
      opacity.value = withDelay(delay + 220, withTiming(0, { duration: 240 }));
      scale.value = withDelay(delay + 200, withTiming(0.2, { duration: 200 }));
    }, [delay, opacity, scale, tx, ty, rotate, burstX, burstY]);

    const style = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
    }));

    return (
      <Animated.View style={[{ left: left - size / 2, top: top - size / 2, position: 'absolute' }, style]}>
        {shape === 'heart' ? (
          <Svg width={size * 1.3} height={size * 1.3} viewBox="0 0 24 24">
            <Path
              d="M12 21s-7-4.5-9.5-9C.5 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4.5 2.7C11.5 5.7 13 4.5 15 4.5c3.5 0 5.5 3.5 3.5 7.5C19 16.5 12 21 12 21z"
              fill={color}
            />
          </Svg>
        ) : shape === 'chicken' ? (
          <ChickenDrumstick size={size} color={color} />
        ) : shape === 'bean' ? (
          <CoffeeBeanParticle size={size} color={color} />
        ) : shape === 'leaf' ? (
          <MatchaLeafParticle size={size} color={color} />
        ) : shape === 'foam' ? (
          <BeerFoamParticle size={size} color={color} />
        ) : shape === 'star' ? (
          <StarParticle size={size} color={color} />
        ) : shape === 'sprinkle' ? (
          <SprinkleParticle size={size} color={color} />
        ) : shape === 'pearl' ? (
          <PearlParticle size={size} color={color} />
        ) : shape === 'seed' ? (
          <WatermelonSeedParticle size={size} color={color} />
        ) : shape === 'bubble' ? (
          <OceanBubbleParticle size={size} color={color} />
        ) : shape === 'diamond' ? (
          <GemShardParticle size={size} color={color} />
        ) : (
          <View style={shapeStyle(shape, size, color)} />
        )}
      </Animated.View>
    );
  },
);
Spark.displayName = 'Spark';

const ChickenDrumstick: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <Svg width={size * 1.2} height={size * 1.2} viewBox="0 0 24 24">
    <Ellipse cx="9" cy="11" rx="7.5" ry="6.5" fill={color} />
    <Path
      d="M4 12 Q2 8 5 5 Q9 2 12 5 Q14 8 12 11 Q10 14 6 13 Z"
      fill={color}
      opacity={0.92}
    />
    <Circle cx="7" cy="8" r="1.1" fill="#B45309" opacity={0.45} />
    <Circle cx="10" cy="10" r="0.9" fill="#B45309" opacity={0.4} />
    <Circle cx="8.5" cy="12" r="0.8" fill="#92400E" opacity={0.35} />
    <Path
      d="M15 14 L19 18 L17.5 20 L14 16 Z"
      fill="#FFFBEB"
      stroke="#E7E5E4"
      strokeWidth={0.6}
    />
    <Circle cx="18.5" cy="19" r="2.2" fill="#FFFBEB" />
    <Circle cx="18.5" cy="19" r="1.2" fill="#F5F5F4" />
  </Svg>
);

const CoffeeBeanParticle: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <Svg width={size * 1.2} height={size * 1.4} viewBox="0 0 24 30">
    <Ellipse cx="12" cy="15" rx="10" ry="13" fill={color} />
    <Path
      d="M12 4 Q6 15 12 26"
      fill="none"
      stroke="#3E2723"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

const MatchaLeafParticle: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <Svg width={size * 1.3} height={size * 1.3} viewBox="0 0 24 24">
    <Path
      d="M2 12 C2 4 12 2 22 2 C22 12 20 22 12 22 C4 22 2 20 2 12 Z"
      fill={color}
    />
    <Path
      d="M2 12 Q12 12 22 2"
      fill="none"
      stroke="#1B5E20"
      strokeWidth="1.5"
      opacity={0.6}
    />
  </Svg>
);

const BeerFoamParticle: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <Svg width={size * 1.3} height={size * 1.3} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Circle cx="9" cy="9" r="3" fill="#FFFFFF" opacity={0.6} />
    <Circle cx="12" cy="12" r="9.5" fill="none" stroke="#FFE082" strokeWidth="1" />
  </Svg>
);

const StarParticle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size * 1.5} height={size * 1.5} viewBox="0 0 24 24">
    <Path
      d="M12 1L15.39 8.26L23 9.27L17.5 14.14L18.79 21.36L12 17.27L5.21 21.36L6.5 14.14L1 9.27L8.61 8.26L12 1Z"
      fill={color}
    />
  </Svg>
);

const SprinkleParticle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size * 1.4} height={size * 1.4} viewBox="0 0 24 24">
    <Rect x="4" y="10" width="16" height="4" rx="2" fill={color} transform="rotate(30 12 12)" />
    <Rect x="4" y="10" width="16" height="4" rx="2" fill="#FFFFFF" opacity={0.3} transform="rotate(30 12 12)" />
  </Svg>
);

const PearlParticle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size * 1.2} height={size * 1.2} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={color} />
    <Circle cx="8" cy="8" r="3" fill="#FFFFFF" opacity={0.4} />
  </Svg>
);

const WatermelonSeedParticle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size * 1.2} height={size * 1.2} viewBox="0 0 24 24">
    <Path
      d="M12 2C8 9 6 15 6 18C6 21 8.68629 23 12 23C15.3137 23 18 21 18 18C18 15 16 9 12 2Z"
      fill={color}
    />
    <Path
      d="M10 8C9.5 12 9.5 15 10.5 18"
      stroke="#FFFFFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity={0.3}
    />
  </Svg>
);

const OceanBubbleParticle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size * 1.2} height={size * 1.2} viewBox="0 0 24 24">
    <Circle cx="12" cy="12" r="10" fill={color} opacity={0.5} />
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" fill="none" />
    <Path d="M 6 12 A 6 6 0 0 1 12 6" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" opacity={0.8} />
  </Svg>
);

const GemShardParticle: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <Svg width={size * 1.4} height={size * 1.4} viewBox="0 0 24 24">
    <Polygon points="12,2 22,12 12,22 2,12" fill={color} />
    <Polygon points="12,4 19,12 12,20 5,12" fill="#FFFFFF" opacity={0.4} />
  </Svg>
);

function shapeStyle(
  shape: ClearParticleShape,
  size: number,
  color: string,
): object {
  switch (shape) {
    case 'diamond':
      return {
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{ rotate: '45deg' }],
        boxShadow: `0 0 8px ${color}`,
      };
    case 'seed':
      return {
        width: size * 0.6,
        height: size * 1.4,
        backgroundColor: color,
        borderRadius: size,
      };
    case 'bubble':
      return {
        width: size,
        height: size,
        borderRadius: size,
        borderWidth: 2,
        borderColor: color,
        backgroundColor: 'rgba(255,255,255,0.3)',
      };
    case 'spark':
      return {
        width: size * 0.5,
        height: size * 1.6,
        backgroundColor: color,
        borderRadius: 2,
      };
    case 'circle':
    default:
      return {
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: color,
      };
  }
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  beam: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  beamCore: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    borderWidth: 2,
    opacity: 0.85,
  },
});
