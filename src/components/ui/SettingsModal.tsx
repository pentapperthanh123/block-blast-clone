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

const COMBO_OPTIONS: { id: ComboMode; title: string; description: string }[] = [
  { id: 'reset', title: 'Reset', description: 'Mất combo ngay khi đặt không xóa được hàng' },
  { id: 'persist', title: 'Duy trì', description: 'Duy trì combo liên tục qua các lượt' },
];

const FILL_RATIO_OPTIONS = [
  { id: 0.15, title: 'Thưa thớt', description: '15% - Nhẹ nhàng' },
  { id: 0.35, title: 'Trung bình', description: '35% - Thử thách' },
  { id: 0.60, title: 'Dày đặc', description: '60% - Rất khó' },
  { id: 0.80, title: 'Siêu khó', description: '80% - Hardcore' },
] as const;

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
  const highScore = useGameStore((s) => s.highScore);
  const resetHighScore = useGameStore((s) => s.resetHighScore);

  const [pendingTheme, setPendingTheme] = useState<ThemeName>(currentTheme);
  const [pendingBlockGen, setPendingBlockGen] =
    useState<BlockGenSettings>(blockGenSettings);
  const [pendingGameplay, setPendingGameplay] =
    useState<GameplaySettings>(gameplaySettings);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

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
    if(
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
            <Text style={styles.title}>Cài Đặt</Text>
            <Pressable onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFF" />
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Chế độ Combo</Text>
              <Text style={styles.sectionDescription}>
                Quy tắc duy trì chuỗi Combo khi đặt khối
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
              <Text style={styles.sectionTitle}>Cảnh Báo Nguy Hiểm</Text>
              <Text style={styles.sectionDescription}>
                Viền nhấp nháy và âm thanh cảnh báo khi bàn sắp đầy
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
                    Bật/tắt hiệu ứng viền đỏ và tiếng beep khi gần thua
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
              <Text style={styles.sectionTitle}>Ván Mới</Text>
              <Text style={styles.sectionDescription}>
                Tùy chọn thiết lập bàn khi bắt đầu ván mới
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
                  <Text style={styles.toggleTitle}>Làm sạch sàn khi ván mới</Text>
                  <Text style={styles.toggleDesc}>
                    Bắt đầu với bàn trống hoàn toàn thay vì có ô ngẫu nhiên
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

              {!pendingGameplay.clearBoardOnNewRound && (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.fieldLabel}>Mật độ lấp đầy ngẫu nhiên</Text>
                  <Text style={styles.fieldHint}>
                    Tỷ lệ ô có sẵn trên bàn khi bắt đầu ván mới
                  </Text>
                  <View style={styles.comboRow}>
                    {FILL_RATIO_OPTIONS.map((option) => {
                      const isActive = pendingGameplay.randomFillRatio === option.id;
                      return (
                        <Pressable
                          key={option.id}
                          style={[
                            styles.comboCard,
                            isActive && styles.comboCardActive,
                          ]}
                          onPress={() =>
                            setPendingGameplay((prev) => ({
                              ...prev,
                              randomFillRatio: option.id,
                            }))
                          }
                          accessibilityRole="button"
                          accessibilityState={{ selected: isActive }}
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
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sinh Block & Tỉ Lệ Dễ Clear</Text>
              <Text style={styles.sectionDescription}>
                Tùy chỉnh xác suất xuất hiện mảnh hỗ trợ xóa hàng/cột và boost mảnh dễ ăn
              </Text>

              <Text style={styles.fieldLabel}>Tỉ lệ sinh mảnh hỗ trợ Clear ngay</Text>
              <Text style={styles.fieldHint}>
                Xác suất xuất hiện mảnh ăn điểm ngay hoặc mảnh dễ ghép hàng (0% - 100%)
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
                  <Text style={styles.toggleTitle}>Boost mảnh khi clear hết sàn</Text>
                  <Text style={styles.toggleDesc}>
                    Ưu tiên mảnh I và mảnh 1-3 ô dễ ghép hàng sau khi xóa sạch sàn
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
                    Số lượng mảnh line-builder (Mảnh I / 3 ô)
                  </Text>
                  <ChipRow
                    options={FULL_CLEAR_LINE_COUNT_OPTIONS}
                    value={pendingBlockGen.fullClearLineBuilderCount}
                    onChange={(fullClearLineBuilderCount) =>
                      patchBlockGen({ fullClearLineBuilderCount })
                    }
                  />

                  <Text style={[styles.fieldLabel, styles.fieldLabelSpaced]}>
                    Tỉ lệ khay còn lại ưu tiên mảnh line-builder
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
              <Text style={styles.sectionTitle}>Giao Diện & Theme</Text>
              <Text style={styles.sectionDescription}>
                Chọn giao diện chủ đề yêu thích cho game
              </Text>

              <Pressable
                style={[
                  styles.toggleRow,
                  pendingGameplay.randomThemeOnNewRound && styles.toggleRowActive,
                ]}
                onPress={() =>
                  setPendingGameplay((prev) => ({
                    ...prev,
                    randomThemeOnNewRound: !prev.randomThemeOnNewRound,
                  }))
                }
                accessibilityRole="switch"
                accessibilityState={{
                  checked: pendingGameplay.randomThemeOnNewRound,
                }}
              >
                <View style={styles.toggleCopy}>
                  <Text style={styles.toggleTitle}>Tự động đổi Theme ván mới</Text>
                  <Text style={styles.toggleDesc}>
                    Thay đổi giao diện ngẫu nhiên mỗi khi bắt đầu ván mới
                  </Text>
                </View>
                <View
                  style={[
                    styles.togglePill,
                    pendingGameplay.randomThemeOnNewRound && styles.togglePillOn,
                  ]}
                >
                  <Text style={styles.togglePillText}>
                    {pendingGameplay.randomThemeOnNewRound ? 'ON' : 'OFF'}
                  </Text>
                </View>
              </Pressable>

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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Điểm Kỷ Lục</Text>
              <Text style={styles.sectionDescription}>
                Quản lý điểm số cao nhất ({highScore} điểm)
              </Text>

              {showResetConfirm ? (
                <View style={styles.resetConfirmBox}>
                  <Text style={styles.resetConfirmTitle}>Xác nhận xóa điểm kỷ lục?</Text>
                  <Text style={styles.resetConfirmDesc}>
                    Điểm số kỷ lục hiện tại ({highScore} điểm) sẽ bị xóa về 0.
                  </Text>
                  <View style={styles.resetConfirmRow}>
                    <Pressable
                      style={styles.cancelResetBtn}
                      onPress={() => setShowResetConfirm(false)}
                    >
                      <Text style={styles.cancelResetText}>Hủy</Text>
                    </Pressable>
                    <Pressable
                      style={styles.confirmResetBtn}
                      onPress={async () => {
                        await resetHighScore();
                        setShowResetConfirm(false);
                      }}
                    >
                      <Text style={styles.confirmResetText}>Đồng ý xóa</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  style={styles.resetBtn}
                  onPress={() => setShowResetConfirm(true)}
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.resetBtnText}>Reset điểm kỷ lục</Text>
                </Pressable>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Pressable style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Lưu</Text>
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
    fontSize: 16,
    fontWeight: '900',
    color: '#000',
  },
  resetBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EF4444',
  },
  resetConfirmBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    gap: 8,
  },
  resetConfirmTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F87171',
  },
  resetConfirmDesc: {
    fontSize: 13,
    color: '#FECDD3',
    fontWeight: '600',
  },
  resetConfirmRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  cancelResetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
  },
  cancelResetText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  confirmResetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    alignItems: 'center',
  },
  confirmResetText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
  },
});
