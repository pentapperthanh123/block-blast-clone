import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { sharedClearMask } from '../../utils/sharedGrid';
import { dragActive, ghostValid } from '../../utils/dragShared';
import { playVoiceFeedback, getVoiceVolume, VoiceFeedbackTier } from '../../constants/voiceFeedback';
import { playThemeSound } from '../../constants/themeSounds';

const FEEDBACK_TIERS: readonly VoiceFeedbackTier[] = ['Good', 'Perfect', 'Awesome', 'Unbelievable'];

const TIER_POINTS: Record<VoiceFeedbackTier, number> = {
  Good: 100,
  Perfect: 400,
  Awesome: 1200,
  Unbelievable: 3000,
};

const TIER_MULTIPLIERS: Record<VoiceFeedbackTier, number> = {
  Good: 1,
  Perfect: 2,
  Awesome: 3,
  Unbelievable: 4,
};

export const DevMenuOverlay = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = useGameStore((s) => s.currentTheme);

  if (!__DEV__) return null;

  const triggerFeedback = (tier: VoiceFeedbackTier) => {
    setIsOpen(false);
    useGameStore.setState({ feedbackVisible: false });

    setTimeout(() => {
      void playVoiceFeedback(tier, getVoiceVolume(tier));
      // Also play theme clear sound so user can test on Web
      const current = useGameStore.getState().currentTheme;
      void playThemeSound(current, 'clear', { linesCount: 4, combo: 2 });

      const points = TIER_POINTS[tier];
      const comboMultiplier = TIER_MULTIPLIERS[tier];

      useGameStore.setState((s) => ({
        score: s.score + points,
        combo: 2,
        feedbackVisible: true,
        feedbackNonce: (s.feedbackNonce || 0) + 1,
        lastScoreBreakdown: {
          points,
          linesCleared: 4,
          comboMultiplier,
          feedbackTier: tier,
        },
      }));

      setTimeout(() => {
        useGameStore.setState({ feedbackVisible: false });
      }, 1400);
    }, 50);
  };

  const triggerHighScore = () => {
    setIsOpen(false);
    useGameStore.setState({ showHighScoreCelebration: false });
    setTimeout(() => {
      useGameStore.setState({
        showHighScoreCelebration: true,
        newHighScore: 9999,
      });
    }, 50);
  };

  const triggerPerfectClear = () => {
    setIsOpen(false);
    useGameStore.setState({ 
      isAnimatingPerfectClear: false,
      feedbackVisible: false 
    });
    
    setTimeout(() => {
      void playVoiceFeedback('Unbelievable', getVoiceVolume('Unbelievable'));
      const current = useGameStore.getState().currentTheme;
      void playThemeSound(current, 'clear', { linesCount: 5, combo: 10 });
      
      useGameStore.setState((s) => ({
        isAnimatingPerfectClear: true,
        combo: 10,
        feedbackVisible: true,
        feedbackNonce: (s.feedbackNonce || 0) + 1,
        lastScoreBreakdown: {
          points: 15000,
          linesCleared: 5,
          comboMultiplier: 10,
          feedbackTier: 'Unbelievable',
        },
      }));
      
      setTimeout(() => {
        useGameStore.setState({ 
          isAnimatingPerfectClear: false,
          feedbackVisible: false
        });
      }, 3500);
    }, 50);
  };

  const triggerGameOver = () => {
    setIsOpen(false);
    useGameStore.setState({ isGameOver: true });
  };

  const previewGlowLine = () => {
    setIsOpen(false);
    dragActive.value = 1;
    ghostValid.value = 1;
    sharedClearMask.value = (1 << 12) | (1 << 3);
    
    setTimeout(() => {
      dragActive.value = 0;
      ghostValid.value = 0;
      sharedClearMask.value = 0;
    }, 2000);
  };

  const cycleTheme = () => {
    useGameStore.getState().cycleRandomTheme();
  };

  return (
    <>
      <TouchableOpacity style={styles.triggerButton} onPress={() => setIsOpen(true)}>
        <Text style={styles.triggerText}>DEV</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
        <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={() => setIsOpen(false)}>
          <SafeAreaView style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1} style={styles.menu}>
              <View style={styles.header}>
                <Text style={styles.title}>Developer Menu</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.sectionTitle}>Feedback / Mood</Text>
                <View style={styles.row}>
                  {FEEDBACK_TIERS.map((tier) => (
                    <TouchableOpacity 
                      key={tier} 
                      style={styles.actionBtn} 
                      onPress={() => triggerFeedback(tier)}
                    >
                      <Text style={styles.actionText}>{tier}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>Game Events</Text>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.actionBtn} onPress={triggerHighScore}>
                    <Text style={styles.actionText}>New High Score</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={triggerPerfectClear}>
                    <Text style={styles.actionText}>Perfect Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionBtn} onPress={previewGlowLine}>
                    <Text style={styles.actionText}>Preview Glow Line</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={triggerGameOver}>
                    <Text style={[styles.actionText, styles.dangerText]}>Game Over</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Settings</Text>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.actionBtn} onPress={cycleTheme}>
                    <Text style={styles.actionText}>Cycle Theme ({currentTheme})</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableOpacity>
          </SafeAreaView>
        </TouchableOpacity>
      </Modal>
    </>
  );
});

DevMenuOverlay.displayName = 'DevMenuOverlay';

const styles = StyleSheet.create({
  triggerButton: {
    position: 'absolute',
    top: 50,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 99999,
  },
  triggerText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  actionText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '500',
  },
  dangerBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerText: {
    color: '#EF4444',
  },
});
