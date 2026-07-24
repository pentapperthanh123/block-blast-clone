/**
 * GameScreen — Classic mode gameplay
 */

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useGameStore } from '../store/gameStore';
import { GameHeader } from '../components/ui/GameHeader';
import { MoodFooter } from '../components/ui/MoodFooter';
import { GameOverModal } from '../components/ui/GameOverModal';
import { GameBoard, type BoardLayout } from '../components/game/GameBoard';
import { BlockTray } from '../components/game/BlockTray';
import { ClearBurst } from '../components/game/ClearBurst';
import { ScorePopup } from '../components/game/ScorePopup';
import { UI_COLORS } from '../constants';

export const GameScreen: React.FC = () => {
  const isGameOver = useGameStore((s) => s.isGameOver);
  const clearingRows = useGameStore((s) => s.clearingRows);
  const clearingColumns = useGameStore((s) => s.clearingColumns);
  const lastScoreBreakdown = useGameStore((s) => s.lastScoreBreakdown);
  const [boardLayout, setBoardLayout] = useState<BoardLayout | null>(null);

  const onBoardLayout = useCallback((layout: BoardLayout) => {
    setBoardLayout(layout);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={UI_COLORS.BACKGROUND} />

      <GameHeader />

      <View style={styles.boardWrap}>
        <View style={styles.boardStack}>
          <GameBoard onBoardLayout={onBoardLayout} />
          <ClearBurst />
          {lastScoreBreakdown && (
            <ScorePopup
              points={lastScoreBreakdown.points}
              feedbackTier={lastScoreBreakdown.feedbackTier}
              comboMultiplier={lastScoreBreakdown.comboMultiplier}
              clearingRows={clearingRows}
              clearingColumns={clearingColumns}
              active={clearingRows.length > 0 || clearingColumns.length > 0}
            />
          )}
        </View>
      </View>

      <BlockTray boardLayout={boardLayout} />
      <MoodFooter />

      {isGameOver && <GameOverModal />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UI_COLORS.BACKGROUND,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  boardWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boardStack: {
    position: 'relative',
  },
});
