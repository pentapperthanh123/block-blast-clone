import type { ThemeName } from './themes';

export interface GameplaySettings {
  /** Border flash + warning sound when board is in danger */
  dangerWarningEnabled: boolean;
  /** Start new rounds with an empty board instead of random pre-fill */
  clearBoardOnNewRound: boolean;
  /** The ratio of cells to fill on a new round if clearBoardOnNewRound is false (0 to 0.85) */
  randomFillRatio: number;
  /** Randomize theme on new round */
  randomThemeOnNewRound: boolean;
  /** Default theme to use when randomThemeOnNewRound is false */
  defaultTheme: ThemeName;
}

export const DEFAULT_GAMEPLAY_SETTINGS: GameplaySettings = {
  dangerWarningEnabled: true,
  clearBoardOnNewRound: true,
  randomFillRatio: 0.15,
  randomThemeOnNewRound: false,
  defaultTheme: 'jollibee',
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
    randomFillRatio:
      typeof raw.randomFillRatio === 'number'
        ? raw.randomFillRatio
        : base.randomFillRatio,
    randomThemeOnNewRound:
      typeof raw.randomThemeOnNewRound === 'boolean'
        ? raw.randomThemeOnNewRound
        : base.randomThemeOnNewRound,
    defaultTheme:
      typeof raw.defaultTheme === 'string'
        ? raw.defaultTheme
        : base.defaultTheme,
  };
}
