/**
 * Raster theme block skins (PNG) — keyed by image:xxx in themes.ts source
 */

export const THEME_BLOCK_IMAGES: Record<string, number> = {
  jollibee: require('../../assets/themes/jollibee-mascot.png'),
  beer: require('../../assets/themes/huda.jpg'),
  milktea: require('../../assets/themes/gongcha.png'),
};

export function isThemeImageSource(source: string): boolean {
  return source.startsWith('image:');
}

export function themeImageKey(source: string): string | null {
  if (!isThemeImageSource(source)) return null;
  return source.slice('image:'.length);
}
