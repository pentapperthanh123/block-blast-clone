/**
 * ClearBurst — theme-specific particles when lines clear
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { CLEAR_PARTICLE_CAP } from '../../constants';
import { resolveTheme, type ClearParticleShape } from '../../constants/themes';

export const ClearBurst: React.FC = () => {
  const clearingRows = useGameStore((s) => s.clearingRows);
  const clearingColumns = useGameStore((s) => s.clearingColumns);
  const themeId = useGameStore((s) => s.currentTheme);
  const theme = resolveTheme(themeId);
  const fx = theme.clearFx;
  const active = clearingRows.length > 0 || clearingColumns.length > 0;
  const { boardSize } = getBoardMetrics();

  const sparks = useMemo(() => {
    if (!active || !fx?.colors?.length) return [];
    const colors = fx.colors;
    const count = Math.min(fx.particleCount, CLEAR_PARTICLE_CAP);
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        id: i,
        left: 10 + ((i * 53) % (boardSize - 20)),
        top: 10 + ((i * 79) % (boardSize - 20)),
        delay: (i % 6) * 35,
        color: colors[i % colors.length],
        shape: fx.shape,
        size: fx.size + (i % 3),
        rise: fx.rise + (i % 4) * 4,
        burstX: Math.cos(angle) * fx.burst,
        burstY: Math.sin(angle) * (fx.burst * 0.55),
      };
    });
  }, [active, boardSize, clearingRows, clearingColumns, fx]);

  if (!active) return null;

  return (
    <View
      pointerEvents="none"
      style={[styles.layer, { width: boardSize, height: boardSize }]}
    >
      {sparks.map((s) => (
        <Spark
          key={`${s.id}-${themeId}-${clearingRows.join()}-${clearingColumns.join()}`}
          {...s}
        />
      ))}
    </View>
  );
};

const Spark: React.FC<{
  left: number;
  top: number;
  delay: number;
  color: string;
  shape: ClearParticleShape;
  size: number;
  rise: number;
  burstX: number;
  burstY: number;
}> = ({ left, top, delay, color, shape, size, rise, burstX, burstY }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.35);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 70 }));
    scale.value = withDelay(
      delay,
      withTiming(shape === 'chicken' ? 1.55 : 1.35, {
        duration: 240,
        easing: Easing.out(Easing.quad),
      }),
    );
    tx.value = withDelay(
      delay,
      withTiming(burstX, { duration: 380, easing: Easing.out(Easing.cubic) }),
    );
    ty.value = withDelay(
      delay,
      withTiming(-rise + burstY, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
      }),
    );
    rotate.value = withDelay(
      delay,
      withTiming(
        shape === 'chicken'
          ? 35 + (delay % 3) * 15
          : shape === 'diamond' || shape === 'seed'
            ? 55
            : 20,
        { duration: 420 },
      ),
    );
    opacity.value = withDelay(delay + 200, withTiming(0, { duration: 220 }));
    scale.value = withDelay(delay + 220, withTiming(0.2, { duration: 200 }));
  }, [
    delay,
    opacity,
    scale,
    tx,
    ty,
    rotate,
    rise,
    burstX,
    burstY,
    shape,
  ]);

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
    <Animated.View style={[{ left, top, position: 'absolute' }, style]}>
      {shape === 'heart' ? (
        <Svg width={size * 1.2} height={size * 1.2} viewBox="0 0 24 24">
          <Path
            d="M12 21s-7-4.5-9.5-9C.5 8 2.5 4.5 6 4.5c2 0 3.5 1.2 4.5 2.7C11.5 5.7 13 4.5 15 4.5c3.5 0 5.5 3.5 3.5 7.5C19 16.5 12 21 12 21z"
            fill={color}
          />
        </Svg>
      ) : shape === 'chicken' ? (
        <ChickenDrumstick size={size} color={color} />
      ) : (
        <View style={shapeStyle(shape, size, color)} />
      )}
    </Animated.View>
  );
};

const ChickenDrumstick: React.FC<{ size: number; color: string }> = ({
  size,
  color,
}) => (
  <Svg width={size * 1.15} height={size * 1.15} viewBox="0 0 24 24">
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
      };
    case 'seed':
      return {
        width: size * 0.55,
        height: size * 1.35,
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
        backgroundColor: 'transparent',
      };
    case 'spark':
      return {
        width: size * 0.45,
        height: size * 1.5,
        backgroundColor: color,
        borderRadius: 1,
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
    zIndex: 5,
  },
});
