/**
 * ClearBurst — simple spark particles when lines clear
 */

import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useGameStore } from '../../store/gameStore';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { UI_COLORS } from '../../constants';

export const ClearBurst: React.FC = () => {
  const clearingRows = useGameStore((s) => s.clearingRows);
  const clearingColumns = useGameStore((s) => s.clearingColumns);
  const active =
    clearingRows.length > 0 || clearingColumns.length > 0;
  const { boardSize } = getBoardMetrics();

  const sparks = useMemo(() => {
    if (!active) return [];
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: 8 + ((i * 47) % (boardSize - 16)),
      top: 8 + ((i * 73) % (boardSize - 16)),
      delay: (i % 5) * 40,
      color: i % 2 === 0 ? UI_COLORS.TEXT_SCORE : '#FFF',
    }));
  }, [active, boardSize, clearingRows, clearingColumns]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={[styles.layer, { width: boardSize, height: boardSize }]}>
      {sparks.map((s) => (
        <Spark key={`${s.id}-${clearingRows.join()}-${clearingColumns.join()}`} {...s} />
      ))}
    </View>
  );
};

const Spark: React.FC<{
  left: number;
  top: number;
  delay: number;
  color: string;
}> = ({ left, top, delay, color }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.4);
  const ty = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 80 }));
    scale.value = withDelay(delay, withTiming(1.4, { duration: 220 }));
    ty.value = withDelay(delay, withTiming(-18, { duration: 320 }));
    opacity.value = withDelay(delay + 180, withTiming(0, { duration: 200 }));
  }, [delay, opacity, scale, ty]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: ty.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.spark,
        { left, top, backgroundColor: color },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  spark: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
