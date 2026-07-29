/**
 * FloatingScore — +N or like icons float up from placed cells (local board coords)
 */

import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Position } from '../../types';
import { getBoardMetrics } from '../../utils/boardMetrics';
import { BOARD_BORDER_PAD } from './GameBoard';

const LIKE_ICONS = ['thumbs-up', 'heart', 'star'] as const;
const LIKE_COLORS = ['#4ADE80', '#FB7185', '#FACC15'] as const;

interface FloatingScoreProps {
  position: Position;
  points: number;
  active: boolean;
  delay?: number;
  kind?: 'score' | 'like';
  index?: number;
}

export const FloatingScore = React.memo<FloatingScoreProps>(({
  position,
  points,
  active,
  delay = 0,
  kind = 'score',
  index = 0,
}) => {
  const { cellStep, cellVisual } = getBoardMetrics();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(cellVisual * 0.2)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!active) {
      opacity.setValue(0);
      translateY.setValue(cellVisual * 0.2);
      scale.setValue(0.5);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(cellVisual * 0.2);
    scale.setValue(0.5);

    const anim = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 150,
          easing: Easing.out(Easing.back(1.4)),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -cellVisual * 2.0,
          duration: 900,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: kind === 'like' ? 450 : 400,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);

    anim.start();
    return () => anim.stop();
  }, [active, delay, opacity, translateY, scale, cellVisual, position.row, position.col, kind]);

  const isLike = kind === 'like';
  if (!active || (!isLike && points <= 0)) return null;

  const left =
    BOARD_BORDER_PAD +
    position.col * cellStep +
    cellVisual / 2 -
    (isLike ? 14 : 20);
  const top =
    BOARD_BORDER_PAD +
    position.row * cellStep +
    cellVisual / 2 -
    (isLike ? 14 : 12);

  const likeIcon = LIKE_ICONS[index % LIKE_ICONS.length];
  const likeColor = LIKE_COLORS[index % LIKE_COLORS.length];

  return (
    <Animated.View
      style={[
        styles.container,
        isLike && styles.likeContainer,
        {
          left,
          top,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
      pointerEvents="none"
    >
      {isLike ? (
        <View style={styles.likeBubble}>
          <Ionicons name={likeIcon} size={20} color={likeColor} />
        </View>
      ) : (
        <Text style={styles.text}>+{points}</Text>
      )}
    </Animated.View>
  );
}, (prev, next) => {
  return (
    prev.points === next.points &&
    prev.active === next.active &&
    prev.delay === next.delay &&
    prev.kind === next.kind &&
    prev.index === next.index &&
    prev.position.row === next.position.row &&
    prev.position.col === next.position.col
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    height: 28,
    zIndex: 100,
  },
  likeContainer: {
    minWidth: 32,
    height: 32,
  },
  likeBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(10, 15, 40, 0.72)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

FloatingScore.displayName = 'FloatingScore';
