/**
 * GameScreen — Classic mode gameplay (candy UI synced with Home)
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, View, StyleSheet, StatusBar, type View as RNView } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { GameHeader } from '../components/ui/GameHeader';
import { GameOverModal } from '../components/ui/GameOverModal';
import { NewRoundTransition } from '../components/ui/NewRoundTransition';
import { GameBoard, type BoardLayout } from '../components/game/GameBoard';
import { BlockTray } from '../components/game/BlockTray';
import { ClearBurst } from '../components/game/ClearBurst';
import { FeedbackOverlay } from '../components/game/FeedbackOverlay';
import { FloatingScore } from '../components/game/FloatingScore';
import { CuteMascot } from '../components/game/CuteMascot';
import { DragOverlay } from '../components/game/DragOverlay';
import { NewHighScoreEffect } from '../components/game/NewHighScoreEffect';
import { CandyBackground } from '../components/home';
import { THEMES } from '../constants/themes';
import { DevMenuOverlay } from '../components/dev/DevMenuOverlay';

export const GameScreen: React.FC = () => {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const newRoundPhase = useGameStore((s) => s.newRoundPhase);
  const lastScoreBreakdown = useGameStore((s) => s.lastScoreBreakdown);
  const feedbackVisible = useGameStore((s) => s.feedbackVisible);
  const placedCellScores = useGameStore((s) => s.placedCellScores);
  const showHighScoreCelebration = useGameStore((s) => s.showHighScoreCelebration);
  const newHighScore = useGameStore((s) => s.newHighScore);
  const hideHighScoreCelebration = useGameStore((s) => s.hideHighScoreCelebration);
  const currentTheme = useGameStore((s) => s.currentTheme);
  const palette = THEMES[currentTheme]?.palette ?? THEMES.ocean.palette;
  const [boardLayout, setBoardLayout] = useState<BoardLayout | null>(null);
  const [overlayOrigin, setOverlayOrigin] = useState({ x: 0, y: 0 });
  const containerRef = useRef<RNView>(null);

  const measureOverlayOrigin = useCallback(() => {
    containerRef.current?.measureInWindow((x, y) => {
      setOverlayOrigin({ x, y });
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(measureOverlayOrigin, 50);
    const dimSub = Dimensions.addEventListener('change', measureOverlayOrigin);
    return () => {
      clearTimeout(timer);
      dimSub.remove();
    };
  }, [measureOverlayOrigin]);

  const onBoardLayout = useCallback((layout: BoardLayout) => {
    setBoardLayout(layout);
  }, []);

  const inTransition = newRoundPhase !== 'idle';
  
  const mascotEmotion = lastScoreBreakdown
    ? lastScoreBreakdown.feedbackTier === 'Unbelievable'
      ? 'shocked'
      : lastScoreBreakdown.feedbackTier === 'Awesome' ||
          lastScoreBreakdown.feedbackTier === 'Perfect'
        ? 'excited'
        : 'happy'
    : 'happy';

  const showMascot =
    feedbackVisible &&
    !!lastScoreBreakdown &&
    (lastScoreBreakdown.feedbackTier === 'Perfect' ||
      lastScoreBreakdown.feedbackTier === 'Awesome' ||
      lastScoreBreakdown.feedbackTier === 'Unbelievable');

  return (
    <View ref={containerRef} onLayout={measureOverlayOrigin} style={[styles.container, { backgroundColor: palette.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={palette.backgroundDeep} />
      <CandyBackground density="subtle" />

      <GameHeader />

      <View style={styles.boardWrap}>
        <View style={styles.boardStack}>
          <View style={styles.boardFrame}>
            <GameBoard onBoardLayout={onBoardLayout} />
            <ClearBurst />
            <View pointerEvents="none" style={styles.scoreLayer}>
              {placedCellScores.map((item, idx) => (
                <FloatingScore
                  key={`${item.position.row}-${item.position.col}-${idx}-${item.kind ?? 'score'}`}
                  position={item.position}
                  points={item.points}
                  kind={item.kind}
                  index={idx}
                  active
                  delay={idx * 50}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      <BlockTray boardLayout={boardLayout} />
      <FeedbackOverlay />
      <DragOverlay
        originX={overlayOrigin.x}
        originY={overlayOrigin.y}
        boardLayout={boardLayout}
      />

      {/* Cute mascot appears on high combos */}
      <CuteMascot visible={showMascot} emotion={mascotEmotion} />

      {/* New High Score Celebration */}
      <NewHighScoreEffect
        visible={showHighScoreCelebration}
        newScore={newHighScore || 0}
        onComplete={hideHighScoreCelebration}
      />

      {isGameOver && !inTransition && <GameOverModal />}
      <NewRoundTransition />
      <DevMenuOverlay />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'visible',
    paddingBottom: 12,
  },
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
    zIndex: 10,
  },
  boardStack: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  boardFrame: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 10,
  },
  scoreLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    overflow: 'visible',
  },
});
