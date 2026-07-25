export type ThemeName =
  | 'watermelon'
  | 'icecream'
  | 'ocean'
  | 'sunset'
  | 'gem'
  | 'milktea'
  | 'love'
  | 'jollibee';

export type ClearParticleShape =
  | 'circle'
  | 'diamond'
  | 'seed'
  | 'spark'
  | 'bubble'
  | 'heart'
  | 'chicken';

export interface ThemeClearFx {
  particleCount: number;
  colors: string[];
  shape: ClearParticleShape;
  rise: number;
  size: number;
  /** Extra outward burst for gem/sunset feel */
  burst: number;
}

export interface ThemePalette {
  background: string;
  backgroundDeep: string;
  glowMid: string;
  glowBottom: string;
}

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  source: string;
  palette: ThemePalette;
  boardColor?: string;
  clearFx: ThemeClearFx;
  /**
   * Distinctive single-look skins (watermelon, gem): ignore rainbow block.color.
   * Omit for multicolor themes — cells keep per-block colors; SVG is detail overlay only.
   */
  lockedBaseColor?: string;
  /**
   * replace = full opaque skin (locked themes)
   * overlay = transparent SVG details on top of block.color (multicolor themes)
   */
  skinMode?: 'replace' | 'overlay';
}

// SVG Patterns for each theme - optimized for small block cells
/** Enhanced Watermelon with 3D effect, gradient, seeds, and realistic rind layers */
const SVG_WATERMELON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><defs><linearGradient id="melonPink" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%23ff7675"/><stop offset="100%25" stop-color="%23d63031"/></linearGradient><filter id="blockShadow" x="-15%25" y="-15%25" width="130%25" height="130%25"><feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="%23000" flood-opacity="0.3"/></filter></defs><g filter="url(%23blockShadow)"><rect width="130" height="130" rx="20" fill="%230b6623"/><rect x="6" y="6" width="118" height="118" rx="16" fill="url(%23melonPink)"/><path d="M 6 100 L 124 100 L 124 108 A 16 16 0 0 1 108 124 L 22 124 A 16 16 0 0 1 6 108 Z" fill="%23ffffff" opacity="0.9"/><path d="M 6 114 L 124 114 A 10 10 0 0 1 114 124 L 22 124 A 10 10 0 0 1 6 114 Z" fill="%2300b894"/><ellipse cx="45" cy="55" rx="5" ry="8" transform="rotate(-15 45 55)" fill="%232d3436"/><ellipse cx="85" cy="70" rx="5" ry="8" transform="rotate(20 85 70)" fill="%232d3436"/><ellipse cx="65" cy="40" rx="4" ry="7" transform="rotate(5 65 40)" fill="%232d3436"/><path d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z" fill="%23ffffff" opacity="0.25"/><rect x="6" y="6" width="118" height="118" rx="16" fill="none" stroke="%23000000" stroke-width="4" opacity="0.12"/></g></svg>`;

/** Ice Cream — scoops, waffle cone, cherry (marker: creamGrad) */
const SVG_ICECREAM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><defs><linearGradient id="creamGrad" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%23fd79a8"/><stop offset="100%25" stop-color="%23fab1a0"/></linearGradient><linearGradient id="waffleGrad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"><stop offset="0%25" stop-color="%23e17055"/><stop offset="100%25" stop-color="%23d63031"/></linearGradient></defs><rect width="130" height="130" rx="20" fill="%233d2314"/><rect x="6" y="6" width="118" height="118" rx="16" fill="url(%23creamGrad)"/><path d="M 6 90 L 124 90 L 124 108 A 16 16 0 0 1 108 124 L 22 124 A 16 16 0 0 1 6 108 Z" fill="url(%23waffleGrad)"/><path d="M 20 90 L 40 124 M 50 90 L 70 124 M 80 90 L 100 124 M 110 90 L 120 110" stroke="%23b22222" stroke-width="2" opacity="0.4"/><path d="M 10 100 L 120 105 M 10 115 L 100 120" stroke="%23b22222" stroke-width="1.5" opacity="0.3"/><circle cx="65" cy="55" r="28" fill="%23ffeaa7"/><circle cx="48" cy="65" r="16" fill="%2355efc4"/><circle cx="82" cy="65" r="16" fill="%23ff7675"/><rect x="58" y="40" width="6" height="3" rx="1.5" fill="%230984e3" transform="rotate(25 61 41.5)"/><rect x="70" y="50" width="6" height="3" rx="1.5" fill="%23e84393" transform="rotate(-15 73 51.5)"/><rect x="62" y="62" width="6" height="3" rx="1.5" fill="%2300b894" transform="rotate(45 65 63.5)"/><circle cx="65" cy="28" r="8" fill="%23d63031"/><path d="M 65 20 Q 75 10 82 15" fill="none" stroke="%2300b894" stroke-width="2.5" stroke-linecap="round"/><path d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z" fill="%23ffffff" opacity="0.3"/><rect x="6" y="6" width="118" height="118" rx="16" fill="none" stroke="%23000000" stroke-width="4" opacity="0.15"/></svg>`;

/** Ocean — gradient water, waves, starfish, bubbles (marker: oceanWater) */
const SVG_OCEAN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><defs><linearGradient id="oceanWater" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%2348dbfb"/><stop offset="50%25" stop-color="%230abde3"/><stop offset="100%25" stop-color="%23006699"/></linearGradient></defs><rect width="130" height="130" rx="20" fill="%230c2461"/><rect x="6" y="6" width="118" height="118" rx="16" fill="url(%23oceanWater)"/><path d="M 15 45 Q 35 35 55 45 T 95 45 T 115 45" fill="none" stroke="%23ffffff" stroke-width="3" stroke-linecap="round" opacity="0.6"/><path d="M 25 75 Q 45 65 65 75 T 105 75" fill="none" stroke="%23ffffff" stroke-width="2.5" stroke-linecap="round" opacity="0.4"/><g transform="translate(85, 80) scale(0.8)"><path d="M 0 -15 L 4 -4 L 15 -4 L 7 3 L 10 14 L 0 8 L -10 14 L -7 3 L -15 -4 L -4 -4 Z" fill="%23ff6b6b"/><circle cx="0" cy="0" r="2" fill="%23ff5252"/></g><circle cx="35" cy="30" r="4" fill="%23ffffff" opacity="0.5"/><circle cx="38" cy="20" r="2.5" fill="%23ffffff" opacity="0.4"/><circle cx="32" cy="12" r="1.5" fill="%23ffffff" opacity="0.3"/><circle cx="95" cy="50" r="3" fill="%23ffffff" opacity="0.5"/><circle cx="98" cy="42" r="2" fill="%23ffffff" opacity="0.4"/><path d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z" fill="%23ffffff" opacity="0.3"/><rect x="6" y="6" width="118" height="118" rx="16" fill="none" stroke="%23000000" stroke-width="4" opacity="0.15"/></svg>`;

/** Sunset icon — sky gradient, sun, birds, ocean reflection (marker: sunsetSky) */
const SVG_SUNSET = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><defs><linearGradient id="sunsetSky" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%23ff6a88"/><stop offset="50%25" stop-color="%23ff9966"/><stop offset="100%25" stop-color="%23ffce00"/></linearGradient><linearGradient id="oceanGrad" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%232b2d42"/><stop offset="100%25" stop-color="%23191a27"/></linearGradient></defs><rect width="130" height="130" rx="20" fill="%231e152a"/><rect x="6" y="6" width="118" height="118" rx="16" fill="url(%23sunsetSky)"/><circle cx="65" cy="75" r="22" fill="%23ffffff" opacity="0.9"/><path d="M 25 35 Q 30 28 35 35 Q 40 28 45 35" fill="none" stroke="%23ffffff" stroke-width="2" stroke-linecap="round" opacity="0.6"/><path d="M 85 25 Q 90 20 95 25 Q 100 20 105 25" fill="none" stroke="%23ffffff" stroke-width="1.5" stroke-linecap="round" opacity="0.5"/><path d="M 6 85 L 124 85 L 124 108 A 16 16 0 0 1 108 124 L 22 124 A 16 16 0 0 1 6 108 Z" fill="url(%23oceanGrad)"/><rect x="50" y="90" width="30" height="3" rx="1.5" fill="%23ffce00" opacity="0.8"/><rect x="55" y="96" width="20" height="3" rx="1.5" fill="%23ffce00" opacity="0.6"/><rect x="62" y="102" width="6" height="3" rx="1.5" fill="%23ffce00" opacity="0.4"/><rect x="64" y="108" width="2" height="3" rx="1.5" fill="%23ffce00" opacity="0.2"/><path d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z" fill="%23ffffff" opacity="0.3"/><rect x="6" y="6" width="118" height="118" rx="16" fill="none" stroke="%23000000" stroke-width="4" opacity="0.2"/></svg>`;

const SVG_GEM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23A78BFA;stop-opacity:1"/><stop offset="100%" style="stop-color:%237C3AED;stop-opacity:1"/></linearGradient></defs><polygon points="50,0 100,25 100,75 50,100 0,75 0,25" fill="url(%23gemGrad)"/><polygon points="50,15 85,35 50,60 15,35" fill="rgba(255,255,255,0.5)"/><path d="M 50 15 L 50 60" stroke="rgba(255,255,255,0.3)" stroke-width="2"/><path d="M 15 35 L 85 35" stroke="rgba(255,255,255,0.25)" stroke-width="2"/></svg>`;

/** Enhanced Milk Tea with 3D cup, boba pearls, straw, and gradient */
const SVG_MILKTEA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><defs><linearGradient id="milkTeaGrad" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%23ffeaa7"/><stop offset="100%25" stop-color="%23fab1a0"/></linearGradient><filter id="blockShadow" x="-15%25" y="-15%25" width="130%25" height="130%25"><feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="%23000" flood-opacity="0.3"/></filter></defs><g filter="url(%23blockShadow)"><rect width="130" height="130" rx="20" fill="%235c3a21"/><rect x="6" y="6" width="118" height="118" rx="16" fill="url(%23milkTeaGrad)"/><path d="M 42 38 L 88 38 L 81 102 L 49 102 Z" fill="%23ffffff" opacity="0.9"/><path d="M 45 46 L 85 46 L 81 100 L 49 100 Z" fill="%23ff7675" opacity="0.75"/><circle cx="58" cy="92" r="5" fill="%232d3436"/><circle cx="70" cy="94" r="5.5" fill="%232d3436"/><circle cx="64" cy="84" r="5" fill="%232d3436"/><rect x="68" y="14" width="8" height="38" rx="3" transform="rotate(15 68 14)" fill="%2300b894"/><rect x="70" y="14" width="3" height="38" transform="rotate(15 70 14)" fill="%23ffffff" opacity="0.7"/><path d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z" fill="%23ffffff" opacity="0.35"/><rect x="6" y="6" width="118" height="118" rx="16" fill="none" stroke="%23000000" stroke-width="4" opacity="0.12"/></g></svg>`;

/** Love — soft rose block + heart (warm couple palette) */
const SVG_LOVE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 130"><defs><linearGradient id="loveRose" x1="0%25" y1="0%25" x2="0%25" y2="100%25"><stop offset="0%25" stop-color="%23FDA4AF"/><stop offset="55%25" stop-color="%23FB7185"/><stop offset="100%25" stop-color="%23E11D48"/></linearGradient><filter id="loveShadow" x="-15%25" y="-15%25" width="130%25" height="130%25"><feDropShadow dx="0" dy="6" stdDeviation="4" flood-color="%23000" flood-opacity="0.28"/></filter></defs><g filter="url(%23loveShadow)"><rect width="130" height="130" rx="22" fill="%239F1239"/><rect x="6" y="6" width="118" height="118" rx="18" fill="url(%23loveRose)"/><path d="M 65 98 C 38 78 28 58 38 44 C 46 32 58 34 65 44 C 72 34 84 32 92 44 C 102 58 92 78 65 98 Z" fill="%23FFF1F2" opacity="0.95"/><path d="M 65 90 C 44 74 36 58 44 48 C 50 40 58 42 65 50 C 72 42 80 40 86 48 C 94 58 86 74 65 90 Z" fill="%23FECDD3" opacity="0.85"/><path d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 32 L 32 32 A 26 26 0 0 1 6 58 L 6 20 A 14 14 0 0 1 20 6 Z" fill="%23FFF7ED" opacity="0.35"/><circle cx="42" cy="28" r="4" fill="%23FEF3C7" opacity="0.75"/><circle cx="88" cy="34" r="3" fill="%23FEF3C7" opacity="0.65"/><rect x="6" y="6" width="118" height="118" rx="18" fill="none" stroke="%23000000" stroke-width="4" opacity="0.1"/></g></svg>`;

export const THEMES: Record<ThemeName, ThemeConfig> = {
  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    source: SVG_WATERMELON,
    lockedBaseColor: '#E11D48',
    skinMode: 'replace',
    palette: {
      background: '#6EE7B7',
      backgroundDeep: '#059669',
      glowMid: '#34D399',
      glowBottom: '#10B981',
    },
    boardColor: '#065F46',
    clearFx: {
      particleCount: 16,
      colors: ['#FF6B8A', '#34D399', '#FFFFFF', '#065F46'],
      shape: 'seed',
      rise: 28,
      size: 7,
      burst: 18,
    },
  },
  icecream: {
    id: 'icecream',
    name: 'Ice Cream',
    source: SVG_ICECREAM,
    lockedBaseColor: '#fd79a8',
    skinMode: 'replace',
    palette: {
      background: '#fd79a8',
      backgroundDeep: '#3d2314',
      glowMid: '#fab1a0',
      glowBottom: '#e17055',
    },
    boardColor: '#3d2314',
    clearFx: {
      particleCount: 18,
      colors: ['#ffeaa7', '#55efc4', '#ff7675', '#0984e3', '#e84393', '#d63031'],
      shape: 'circle',
      rise: 34,
      size: 6,
      burst: 22,
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    source: SVG_OCEAN,
    lockedBaseColor: '#0abde3',
    skinMode: 'replace',
    palette: {
      background: '#48dbfb',
      backgroundDeep: '#0c2461',
      glowMid: '#0abde3',
      glowBottom: '#006699',
    },
    boardColor: '#0c2461',
    clearFx: {
      particleCount: 14,
      colors: ['#93C5FD', '#FFFFFF', '#38BDF8', '#1D4ED8'],
      shape: 'bubble',
      rise: 40,
      size: 9,
      burst: 12,
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset',
    source: SVG_SUNSET,
    lockedBaseColor: '#ff9966',
    skinMode: 'replace',
    palette: {
      background: '#ff6a88',
      backgroundDeep: '#1e152a',
      glowMid: '#ff9966',
      glowBottom: '#ffce00',
    },
    boardColor: '#191a27',
    clearFx: {
      particleCount: 16,
      colors: ['#ffce00', '#ff9966', '#ff6a88', '#FFF7ED'],
      shape: 'spark',
      rise: 36,
      size: 6,
      burst: 26,
    },
  },
  gem: {
    id: 'gem',
    name: 'Gem',
    source: SVG_GEM,
    lockedBaseColor: '#7C3AED',
    skinMode: 'replace',
    palette: {
      background: '#8B5CF6',
      backgroundDeep: '#5B21B6',
      glowMid: '#A78BFA',
      glowBottom: '#7C3AED',
    },
    boardColor: '#4C1D95',
    clearFx: {
      particleCount: 18,
      colors: ['#E9D5FF', '#A78BFA', '#FFFFFF', '#7C3AED', '#F0ABFC'],
      shape: 'diamond',
      rise: 32,
      size: 8,
      burst: 28,
    },
  },
  milktea: {
    id: 'milktea',
    name: 'Milk Tea',
    source: SVG_MILKTEA,
    lockedBaseColor: '#D97706',
    skinMode: 'replace',
    palette: {
      background: '#F59E0B',
      backgroundDeep: '#92400E',
      glowMid: '#FCD34D',
      glowBottom: '#D97706',
    },
    boardColor: '#78350F',
    clearFx: {
      particleCount: 16,
      colors: ['#FEF3C7', '#FCD34D', '#D97706', '#92400E', '#422006'],
      shape: 'circle',
      rise: 32,
      size: 7,
      burst: 20,
    },
  },
  love: {
    id: 'love',
    name: 'Love',
    source: SVG_LOVE,
    lockedBaseColor: '#E11D48',
    skinMode: 'replace',
    palette: {
      // Warm indoor light + soft rose palette
      background: '#FDA4AF',
      backgroundDeep: '#9F1239',
      glowMid: '#FECDD3',
      glowBottom: '#FB7185',
    },
    boardColor: '#881337',
    clearFx: {
      particleCount: 20,
      colors: ['#FFF1F2', '#FECDD3', '#FB7185', '#FEF3C7', '#E11D48'],
      shape: 'heart',
      rise: 36,
      size: 8,
      burst: 24,
    },
  },
  jollibee: {
    id: 'jollibee',
    name: 'Jollibee',
    source: 'image:jollibee',
    lockedBaseColor: '#E31837',
    skinMode: 'replace',
    palette: {
      background: '#E41D2C',
      backgroundDeep: '#9B0F24',
      glowMid: '#FFC72C',
      glowBottom: '#E31837',
    },
    boardColor: '#8B0A1A',
    clearFx: {
      particleCount: 14,
      colors: ['#FFC72C', '#F59E0B', '#D97706', '#B45309', '#FDE68A'],
      shape: 'chicken',
      rise: 42,
      size: 16,
      burst: 30,
    },
  },
};

export const THEME_LIST = Object.values(THEMES);

const FALLBACK_CLEAR_FX: ThemeClearFx = {
  particleCount: 14,
  colors: ['#93C5FD', '#FFFFFF', '#38BDF8', '#1D4ED8'],
  shape: 'bubble',
  rise: 40,
  size: 9,
  burst: 12,
};

/** Always returns a full theme (incl. clearFx) — never undefined fields */
export function resolveTheme(id?: ThemeName | null): ThemeConfig {
  const base = (id && THEMES[id]) || THEMES.ocean;
  return {
    ...base,
    clearFx: base.clearFx ?? FALLBACK_CLEAR_FX,
  };
}

export function pickRandomTheme(current?: ThemeName): ThemeName {
  const pool = current
    ? THEME_LIST.filter((t) => t.id !== current)
    : THEME_LIST;
  return pool[Math.floor(Math.random() * pool.length)]?.id ?? 'ocean';
}

/** Paint color for cells/pieces — locked themes ignore rainbow block.color */
export function getThemePaintColor(
  theme: ThemeConfig,
  fallbackColor: string,
): string {
  return theme.lockedBaseColor ?? fallbackColor;
}
