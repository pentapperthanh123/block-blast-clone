/**
 * ScorePopup — animated score numbers flying up from cleared lines
 */

import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { UI_COLORS } from '../../constants';

interface ScorePopupProps {
  points: number;
  feedbackTier: 'Good' | 'Awesome' | 'Unbelievable';
  comboMultiplier: number;
  clearingRows: number[];
  clearingColumns: number[];
  active: boolean;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  points,
  feedbackTier,
  comboMultiplier,
  clearingRows,
  clearingColumns,
  active,
}) => {
  const { boardSize, cellSize } = getBoardMetrics();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.8);

  // Calculate popup position (center of cleared area)
  const centerRow = clearingRows.length > 0 
    ? clearingRows.reduce((a, b) => a + b, 0) / clearingRows.length 
    : 3.5;
  const centerCol = clearingColumns.length > 0
    ? clearingColumns.reduce((a, b) => a + b, 0) / clearingColumns.length
    : 3.5;

  const popupX = centerCol * cellSize;
  const popupY = centerRow * cellSize;

  useEffect(() => {
    if (!active) {
      opacity.value = 0;
      translateY.value = 0;
      scale.value = 0.8;
      return;
    }

    // Explosive entrance + float up + fade out
    opacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withDelay(600, withTiming(0, { duration: 400 }))
    );
    
    scale.value = withSequence(
      withSpring(1.2, { damping: 10 }),
      withDelay(200, withSpring(1, { damping: 15 }))
    );
    
    translateY.value = withDelay(
      300, 
      withTiming(-cellSize * 2, { duration: 700 })
    );
  }, [active, opacity, translateY, scale, cellSize]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  if (!active || points <= 0) return null;

  const color = feedbackTier === 'Unbelievable' 
    ? '#FF6B6B' 
    : feedbackTier === 'Awesome' 
    ? '#FFD93D' 
    : '#4DD3E8';

  const fontSize = feedbackTier === 'Unbelievable' ? 32 : 24;

  return (
    <Animated.View
      style={[
        styles.popup,
        {
          left: popupX - 60,
          top: popupY - 20,
        },
        animStyle,
      ]}
      pointerEvents="none"
    >
      <Animated.Text style={[styles.points, { color, fontSize }]}>
        +{points.toLocaleString()}
      </Animated.Text>
      {comboMultiplier > 1 && (
        <Animated.Text style={[styles.combo, { color }]}>
          {comboMultiplier.toFixed(1)}x
        </Animated.Text>
      )}
      <Animated.Text style={[styles.feedback, { color }]}>
        {feedbackTier}!
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  popup: {
    position: 'absolute',
    alignItems: 'center',
    width: 120,
    zIndex: 10,
  },
  points: {
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  combo: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  feedback: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});