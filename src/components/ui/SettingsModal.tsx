/**
 * SettingsModal - Theme selection and game settings
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '../../store/gameStore';
import { ThemeName, THEME_LIST } from '../../constants/themes';
import { UI_COLORS } from '../../constants';
import type { ComboMode } from '../../engine/ScoreCalculator';
import {
  BlockGenSettings,
  CLEAR_HELPER_PRESETS,
  FULL_CLEAR_LINE_CHANCE_PRESETS,
  FULL_CLEAR_LINE_COUNT_OPTIONS,
} from '../../constants/blockGenSettings';
import type { GameplaySettings } from '../../constants/gameplaySettings';
import { ThemeIcon } from './ThemeIcon';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

const COMBO_OPTIONS: {
  id: ComboMode;
  title: string;
  description: string;
}[] = [
  {
    id: 'persist',
    title: 'Stack',
    description: 'Combo keeps stacking until game over (saved automatically)',
  },
  {
    id: 'reset',
    title: 'Classic',
    description: 'Miss a clear → combo resets to 0',
  },
];

function pctLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

const ChipRow: React.FC<{
  options: readonly number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}> = ({ options, value, onChange, format = String }) => (
  <View style={styles.chipRow}>
    {options.map((option) => {
      const active = value === option;
      return (
        <Pressable
          key={option}
          style={[styles.chip, active && styles.chipActive]}
          onPress={() => onChange(option)}
          accessibilityRole="button"
          accessibilityState={{ selected: active }}
        >
          <Text style={[styles.chipText, active && styles.chipTextActive]}>
            {format(option)}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export const SettingsModal: React.FC<SettingsModalProps> = ({ visible, onClose }) => {
  const currentTheme = useGameStore((s) => s.currentTheme);
  const changeTheme = useGameStore((s) => s.changeTheme);
  const comboMode = useGameStore((s) => s.comboMode);
  const setComboMode = useGameStore((s) => s.setComboMode);
  const blockGenSettings = useGameStore((s) => s.blockGenSettings);
  const setBlockGenSettings = useGameStore((s) => s.setBlockGenSettings);
  const gameplaySettings = useGameStore((s) => s.gameplaySettings);
  const setGameplaySettings = useGameStore((s) => s.setGameplaySettings);

  const [pendingTheme, setPendingTheme] = useState<ThemeName>(currentTheme);
  const [pendingBlockGen, setPendingBlockGen] =
    useState<BlockGenSettings>(blockGenSettings);
  const [pendingGameplay, setPendingGameplay] =
    useState<GameplaySettings>(gameplaySettings);

  React.useEffect(() => {
    if (visible) {
      setPendingTheme(currentTheme);
      setPendingBlockGen(blockGenSettings);
      setPendingGameplay(gameplaySettings);
    }
  }, [visible, currentTheme, blockGenSettings, gameplaySettings]);

  const patchBlockGen = (patch: Partial<BlockGenSettings>) => {
    setPendingBlockGen((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    if (pendingTheme !== currentTheme) {
      changeTheme(pendingTheme);
    }
    if (JSON.stringify(pendingBlockGen) !== JSON.stringify(blockGenSettings)) {
      setBlockGenSettings(pendingBlockGen);
    }
    if (
      JSON.stringify(pendingGameplay) !== JSON.stringify(gameplaySettings)
    ) {
      setGameplaySettings(pendingGameplay);
    }
    onClose();
  };

  const handleClose = () => {
    setPendingTheme(currentTheme);
    setPendingBlockGen(blockGenSettings);
    setPendingGameplay(gameplaySettings);
    onClose();
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Combo</Text>
              <Text style={styles.sectionDescription}>
                When should your combo break?
              </Text>

              <View style={styles.comboRow}>
                {COMBO_OPTIONS.map((option) => {
                  const isActive = comboMode === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      style={[
                        styles.comboCard,
                        isActive && styles.comboCardActive,
                      ]}
                      onPress={() => setComboMode(option.id)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isActive }}
                      accessibilityLabel={`Combo mode ${option.title}`}
                    >
                      <Text
                        style={[
                          styles.comboTitle,
                          isActive && styles.comboTitleActive,
                        ]}
                      >
                        {option.title}
                      </Text>
                      <Text style={styles.comboDesc}>{option.description}</Text>
                      {isActive && (
                        <View style={styles.comboCheck}>
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#4ADE80"
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cảnh báo</Text>
              <Text style={styles.sectionDescription}>
                Viền nhấp nháy và âm thanh khi bàn sắp kín
              </Text>

              <Pressable
                style={[
                  styles.toggleRow,
                  pendingGameplay.dangerWarningEnabled && styles.toggleRowActive,
                ]}
                onPress={() =>
                  setPendingGameplay((prev) => ({
                    ...prev,
                    dangerWarningEnabled: !prev.dangerWarningEnabled,
                  }))
                }
                accessibilityRole="switch"
                accessibilityState={{
                  checked: pendingGameplay.dangerWarningEnabled,
                }}
              >
                <View style={styles.toggleCopy}>
                  <Text style={styles.toggleTitle}>Cảnh báo nguy hiểm</Text>
                  <Text style={styles.toggleDesc}>
                    Tắt nếu viền đỏ/cam và tiếng beep làm phiền
                  </Text>
                </View>
                <View
                  style={[
                    styles.togglePill,
                    pendingGameplay.dangerWarningEnabled && styles.togglePillOn,
                  ]}
                >
                  <Text style={styles.togglePillText}>
                    {pendingGameplay.dangerWarningEnabled ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ván mới</Text>
              <Text style={styles.sectionDescription}>
                Tuỳ chọn khi bắt đầu lại sau khi thua
              </Text>

              <Pressable
                style={[
                  styles.toggleRow,
                  pendingGameplay.clearBoardOnNewRound && styles.toggleRowActive,
                ]}
                onPress={() =>
                  setPendingGameplay((prev) => ({
                    ...prev,
                    clearBoardOnNewRound: !prev.clearBoardOnNewRound,
                  }))
                }
                accessibilityRole="switch"
                accessibilityState={{
                  checked: pendingGameplay.clearBoardOnNewRound,
                }}
              >
                <View style={styles.toggleCopy}>
                  <Text style={styles.toggleTitle}>Clear sàn khi ván mới</Text>
                  <Text style={styles.toggleDesc}>
                    Bàn trống hoàn toàn thay vì có vài ô ngẫu nhiên
                  </Text>
                </View>
                <View
                  style={[
                    styles.togglePill,
                    pendingGameplay.clearBoardOnNewRound && styles.togglePillOn,
                  ]}
                >
                  <Text style={styles.togglePillText}>
                    {pendingGameplay.clearBoardOnNewRound ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sinh block</Text>
              <Text style={styles.sectionDescription}>
                Tùy chỉnh xác suất mảnh hỗ trợ clear và boost sau khi clear hết sàn
              </Text>

              <Text style={styles.fieldLabel}>Tỉ lệ mảnh clear ngay</Text>
              <Text style={styles.fieldHint}>
                Khi bàn còn ô — khả năng có 1 mảnh xóa hàng/cột ngay khi đặt
              </Text>
              <ChipRow
                options={CLEAR_HELPER_PRESETS}
                value={pendingBlockGen.clearHelperChance}
                onChange={(clearHelperChance) => patchBlockGen({ clearHelperChance })}
                format={pctLabel}
              />

              <Pressable
                style={[
                  styles.toggleRow,
                  pendingBlockGen.fullClearBoostEnabled && styles.toggleRowActive,
                ]}
                onPress={() =>
                  patchBlockGen({
                    fullClearBoostEnabled: !pendingBlockGen.fullClearBoostEnabled,
                  })
                }
                accessibilityRole="switch"
                accessibilityState={{
                  checked: pendingBlockGen.fullClearBoostEnabled,
                }}
              >
                <View style={styles.toggleCopy}>
                  <Text style={styles.toggleTitle}>Boost sau clear hết sàn</Text>
                  <Text style={styles.toggleDesc}>
                    Ưu tiên mảnh I / xếp hàng để combo tiếp
                  </Text>
                </View>
                <View
                  style={[
                    styles.togglePill,
                    pendingBlockGen.fullClearBoostEnabled && styles.togglePillOn,
                  ]}
                >
                  <Text style={styles.togglePillText}>
                    {pendingBlockGen.fullClearBoostEnabled ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </Pressable>

              {pendingBlockGen.fullClearBoostEnabled ? (
                <>
                  <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                    Số mảnh line-builder (I / 3 ô)
                  </Text>
                  <ChipRow
                    options={FULL_CLEAR_LINE_COUNT_OPTIONS}
                    value={pendingBlockGen.fullClearLineBuilderCount}
                    onChange={(fullClearLineBuilderCount) =>
                      patchBlockGen({ fullClearLineBuilderCount })
                    }
                  />

                  <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                    Tỉ lệ slot còn lại là line-builder
                  </Text>
                  <ChipRow
                    options={FULL_CLEAR_LINE_CHANCE_PRESETS}
                    value={pendingBlockGen.fullClearLineBuilderChance}
                    onChange={(fullClearLineBuilderChance) =>
                      patchBlockGen({ fullClearLineBuilderChance })
                    }
                    format={pctLabel}
                  />
                </>
              ) : null}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose Theme</Text>
              <Text style={styles.sectionDescription}>
                Select your favorite game theme
              </Text>

              <View style={styles.themeGrid}>
                {THEME_LIST.map((theme) => {
                  const isPending = pendingTheme === theme.id;

                  return (
                    <Pressable
                      key={theme.id}
                      style={[
                        styles.themeCard,
                        isPending && styles.themeCardActive,
                      ]}
                      onPress={() => setPendingTheme(theme.id as ThemeName)}
                    >
                      <View
                        style={[
                          styles.themePreview,
                          { backgroundColor: theme.palette.background },
                        ]}
                      >
                        <ThemeIcon source={theme.source} size={70} />
                      </View>

                      <Text
                        style={[
                          styles.themeName,
                          isPending && styles.themeNameActive,
                        ]}
                      >
                        {theme.name}
                      </Text>

                      {isPending && (
                        <View style={styles.activeIndicator}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#4ADE80"
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Pressable style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 15, 45, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: Math.min(SCREEN_WIDTH * 0.92, 420),
    maxHeight: '85%',
    backgroundColor: 'rgba(15, 23, 68, 0.98)',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: UI_COLORS.TEXT_PRIMARY,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flexGrow: 0,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: UI_COLORS.TEXT_PRIMARY,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 16,
    fontWeight: '600',
  },
  comboRow: {
    gap: 10,
  },
  comboCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
    position: 'relative',
  },
  comboCardActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: '#4ADE80',
  },
  comboTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  comboTitleActive: {
    color: '#4ADE80',
  },
  comboDesc: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    paddingRight: 28,
  },
  comboCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  fieldLabelSpaced: {
    marginTop: 16,
  },
  fieldHint: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 17,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  chipActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.18)',
    borderColor: '#4ADE80',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  chipTextActive: {
    color: '#4ADE80',
  },
  toggleRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  toggleRowActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.12)',
    borderColor: 'rgba(74, 222, 128, 0.45)',
  },
  toggleCopy: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  toggleDesc: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    lineHeight: 17,
  },
  togglePill: {
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  togglePillOn: {
    backgroundColor: '#4ADE80',
  },
  togglePillText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: (SCREEN_WIDTH * 0.92 - 64) / 2,
    maxWidth: 180,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  themeCardActive: {
    backgroundColor: 'rgba(74, 222, 128, 0.15)',
    borderColor: '#4ADE80',
    borderWidth: 2.5,
  },
  themePreview: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  themeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
    textAlign: 'center',
  },
  themeNameActive: {
    color: '#4ADE80',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#94A3B8',
  },
  saveButton: {
    flex: 2,
    backgroundColor: UI_COLORS.CLASSIC,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderTopColor: 'rgba(255,255,255,0.4)',
    borderLeftColor: 'rgba(255,255,255,0.3)',
    borderBottomColor: 'rgba(0,0,0,0.3)',
    borderRightColor: 'rgba(0,0,0,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
