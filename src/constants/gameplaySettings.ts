/**
 * General gameplay toggles (Settings → persisted in gameStore)
 */

export interface GameplaySettings {
  /** Border flash + warning sound when board is in danger */
  dangerWarningEnabled: boolean;
  /** Start new rounds with an empty board instead of random pre-fill */
  clearBoardOnNewRound: boolean;
}

export const DEFAULT_GAMEPLAY_SETTINGS: GameplaySettings = {
  dangerWarningEnabled: true,
  clearBoardOnNewRound: false,
};

export function normalizeGameplaySettings(
  raw: Partial<GameplaySettings> | null | undefined,
): GameplaySettings {
  const base = DEFAULT_GAMEPLAY_SETTINGS;
  if (!raw) return { ...base };

  return {
    dangerWarningEnabled:
      typeof raw.dangerWarningEnabled === 'boolean'
        ? raw.dangerWarningEnabled
        : base.dangerWarningEnabled,
    clearBoardOnNewRound:
      typeof raw.clearBoardOnNewRound === 'boolean'
        ? raw.clearBoardOnNewRound
        : base.clearBoardOnNewRound,
  };
}
