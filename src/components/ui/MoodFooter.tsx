/**
 * MoodFooter — Good / Perfect under tray (plain Text, always paints)
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { ANIMATION, FEEDBACK_TIER_LABEL, UI_COLORS } from '../../constants';

const TIER_COLOR: Record<string, string> = {
  Good: '#6BCF7F',
  Perfect: '#38BDF8',
  Awesome: '#FACC15',
  Unbelievable: '#FF6B6B',
};

export const MoodFooter: React.FC = () => {
  const moodVisible = useGameStore((s) => s.moodVisible);
  const nonce = useGameStore((s) => s.feedbackNonce);
  const breakdown = useGameStore((s) => s.lastScoreBreakdown);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!moodVisible || !breakdown || nonce <= 0) {
      setShow(false);
      return;
    }
    setShow(true);
    const hide = setTimeout(() => setShow(false), ANIMATION.SCORE_POPUP);
    return () => clearTimeout(hide);
  }, [moodVisible, breakdown, nonce]);

  return (
    <View style={styles.slot} testID="mood-footer">
      {show && breakdown ? (
        <Text
          testID="mood-text"
          style={[
            styles.text,
            {
              color:
                TIER_COLOR[breakdown.feedbackTier] ?? UI_COLORS.TEXT_SCORE,
            },
          ]}
        >
          {FEEDBACK_TIER_LABEL[breakdown.feedbackTier] ?? 'Good!'}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  slot: {
    marginTop: 6,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
  },
  text: {
    fontSize: 30,
    fontWeight: '900',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
});
