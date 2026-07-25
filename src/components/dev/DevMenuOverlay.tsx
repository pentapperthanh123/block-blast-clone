import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { useGameStore } from '../../store/gameStore';
import { sharedClearMask } from '../../utils/sharedGrid';
import { dragActive, ghostValid } from '../../utils/dragShared';

export const DevMenuOverlay: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = useGameStore((s) => s.currentTheme);

  if (!__DEV__) return null;

  const triggerFeedback = (tier: 'Good' | 'Perfect' | 'Awesome' | 'Unbelievable') => {
    setIsOpen(false);
    useGameStore.setState({
      feedbackVisible: false,
    });
    setTimeout(() => {
      useGameStore.setState((s) => ({
        feedbackVisible: true,
        feedbackNonce: (s.feedbackNonce || 0) + 1,
        lastScoreBreakdown: {
          points: 100,
          linesCleared: 4,
          comboMultiplier: tier === 'Unbelievable' ? 4 : tier === 'Awesome' ? 3 : tier === 'Perfect' ? 2 : 1,
          feedbackTier: tier,
        },
      }));
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

  const triggerGameOver = () => {
    setIsOpen(false);
    useGameStore.setState({ isGameOver: true });
  };

  const previewGlowLine = () => {
    setIsOpen(false);
    // Simulate a drag active state and set a glow mask for Row 4 and Col 3
    dragActive.value = 1;
    ghostValid.value = 1;
    // Row 4 = bit 12 (4 + 8), Col 3 = bit 3
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
                {['Good', 'Perfect', 'Awesome', 'Unbelievable'].map(tier => (
                  <TouchableOpacity 
                    key={tier} 
                    style={styles.actionBtn} 
                    onPress={() => triggerFeedback(tier as any)}
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
};

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
