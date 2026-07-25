/**
 * Configurable block-spawn parameters (Settings → persisted in gameStore)
 */

export interface BlockGenSettings {
  /** 0–1: chance a new tray includes a piece that clears immediately */
  clearHelperChance: number;
  /** Favor combo line-builders after the board is fully cleared */
  fullClearBoostEnabled: boolean;
  /** Guaranteed line-builder pieces after full clear (1–3) */
  fullClearLineBuilderCount: number;
  /** 0–1: extra slots also pick line-builders in full-clear boost mode */
  fullClearLineBuilderChance: number;
}

export const DEFAULT_BLOCK_GEN_SETTINGS: BlockGenSettings = {
  /** Subtle — classic Block Blast rarely hands free clears */
  clearHelperChance: 0.15,
  /** Off by default; classic uses weighted spawn after full clear instead */
  fullClearBoostEnabled: false,
  fullClearLineBuilderCount: 2,
  fullClearLineBuilderChance: 0.75,
};

export const CLEAR_HELPER_PRESETS = [0, 0.25, 0.5, 0.75, 1] as const;

export const FULL_CLEAR_LINE_COUNT_OPTIONS = [1, 2, 3] as const;

export const FULL_CLEAR_LINE_CHANCE_PRESETS = [0.5, 0.75, 1] as const;

export function normalizeBlockGenSettings(
  raw: Partial<BlockGenSettings> | null | undefined,
): BlockGenSettings {
  const base = DEFAULT_BLOCK_GEN_SETTINGS;
  if (!raw) return { ...base };

  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  const lineCount = Math.round(raw.fullClearLineBuilderCount ?? base.fullClearLineBuilderCount);

  return {
    clearHelperChance: clamp01(
      typeof raw.clearHelperChance === 'number'
        ? raw.clearHelperChance
        : base.clearHelperChance,
    ),
    fullClearBoostEnabled:
      typeof raw.fullClearBoostEnabled === 'boolean'
        ? raw.fullClearBoostEnabled
        : base.fullClearBoostEnabled,
    fullClearLineBuilderCount: Math.min(3, Math.max(1, lineCount)),
    fullClearLineBuilderChance: clamp01(
      typeof raw.fullClearLineBuilderChance === 'number'
        ? raw.fullClearLineBuilderChance
        : base.fullClearLineBuilderChance,
    ),
  };
}
