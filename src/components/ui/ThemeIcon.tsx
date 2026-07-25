/**
 * ThemeIcon - Renders theme SVG pattern
 * Converts data URI SVG to inline SVG for proper rendering
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Image } from 'react-native';
import Svg, { Rect, Ellipse, Path, Circle, Defs, LinearGradient, Stop, G, Polygon } from 'react-native-svg';
import {
  THEME_BLOCK_IMAGES,
  isThemeImageSource,
  themeImageKey,
} from '../../constants/themeImages';

interface ThemeIconProps {
  source: string;
  size: number;
  style?: ViewStyle;
}

export const ThemeIcon: React.FC<ThemeIconProps> = React.memo(
  ({ source, size, style }) => {
    if (isThemeImageSource(source)) {
      const key = themeImageKey(source);
      const imageSource = key ? THEME_BLOCK_IMAGES[key] : undefined;
      if (imageSource) {
        return (
          <View
            style={[
              styles.container,
              styles.imageClip,
              { width: size, height: size, borderRadius: size * 0.12 },
              style,
            ]}
          >
            <Image
              source={imageSource}
              style={{ width: size, height: size }}
              resizeMode="cover"
            />
          </View>
        );
      }
    }

    const isWatermelon = source.includes('melonPink');
    const isMilktea = source.includes('milkTeaGrad');
    const isGem = source.includes('gemGrad');
    const isLove = source.includes('loveRose');
    const isOcean = source.includes('oceanWater');
    const isSunset = source.includes('sunsetSky');
    const isIcecream = source.includes('creamGrad');

    return (
      <View style={[styles.container, { width: size, height: size }, style]}>
        <Svg width={size} height={size} viewBox="0 0 130 130">
          {isWatermelon && <WatermelonSVG />}
          {isMilktea && <MilkteaSVG />}
          {isGem && <GemSVG />}
          {isLove && <LoveSVG />}
          {isOcean && <OceanSVG />}
          {isSunset && <SunsetSVG />}
          {isIcecream && <IcecreamSVG />}
        </Svg>
      </View>
    );
  },
  (prev, next) =>
    prev.source === next.source &&
    prev.size === next.size &&
    prev.style === next.style,
);

// Individual theme SVG components
const WatermelonSVG = () => (
  <>
    <Defs>
      <LinearGradient id="melonPink" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#ff7675" />
        <Stop offset="100%" stopColor="#d63031" />
      </LinearGradient>
    </Defs>
    <Rect width="130" height="130" rx="20" fill="#0b6623" />
    <Rect x="6" y="6" width="118" height="118" rx="16" fill="url(#melonPink)" />
    <Path d="M 6 100 L 124 100 L 124 108 A 16 16 0 0 1 108 124 L 22 124 A 16 16 0 0 1 6 108 Z" fill="#ffffff" opacity="0.9" />
    <Path d="M 6 114 L 124 114 A 10 10 0 0 1 114 124 L 22 124 A 10 10 0 0 1 6 114 Z" fill="#00b894" />
    <Ellipse cx="45" cy="55" rx="5" ry="8" transform="rotate(-15 45 55)" fill="#2d3436" />
    <Ellipse cx="85" cy="70" rx="5" ry="8" transform="rotate(20 85 70)" fill="#2d3436" />
    <Ellipse cx="65" cy="40" rx="4" ry="7" transform="rotate(5 65 40)" fill="#2d3436" />
    <Path d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z" fill="#ffffff" opacity="0.25" />
  </>
);

const MilkteaSVG = () => (
  <>
    <Defs>
      <LinearGradient id="milkTeaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#ffeaa7" />
        <Stop offset="100%" stopColor="#fab1a0" />
      </LinearGradient>
    </Defs>
    <Rect width="130" height="130" rx="20" fill="#5c3a21" />
    <Rect x="6" y="6" width="118" height="118" rx="16" fill="url(#milkTeaGrad)" />
    {/* Cup - centered */}
    <Path d="M 45 40 L 85 40 L 79 100 L 51 100 Z" fill="#ffffff" opacity="0.9" />
    {/* Tea liquid */}
    <Path d="M 47 48 L 83 48 L 79 98 L 51 98 Z" fill="#ff7675" opacity="0.75" />
    {/* Boba pearls */}
    <Circle cx="60" cy="88" r="5" fill="#2d3436" />
    <Circle cx="72" cy="90" r="5.5" fill="#2d3436" />
    <Circle cx="66" cy="80" r="5" fill="#2d3436" />
    {/* Straw - simplified, no rotation issues */}
    <Rect x="75" y="18" width="7" height="35" rx="3" fill="#00b894" />
    <Rect x="76.5" y="18" width="2.5" height="35" fill="#ffffff" opacity="0.7" />
    {/* Highlight */}
    <Path d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z" fill="#ffffff" opacity="0.35" />
  </>
);

const GemSVG = () => (
  <>
    <Defs>
      <LinearGradient id="gemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#A78BFA" />
        <Stop offset="100%" stopColor="#7C3AED" />
      </LinearGradient>
    </Defs>
    <Rect width="130" height="130" rx="20" fill="#4C1D95" />
    <Polygon points="65,13 130,45.5 130,110.5 65,143 0,110.5 0,45.5" fill="url(#gemGrad)" />
    <Polygon points="65,32.5 110.5,58.5 65,91 19.5,58.5" fill="rgba(255,255,255,0.5)" />
    <Path d="M 65 32.5 L 65 91" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
    <Path d="M 19.5 58.5 L 110.5 58.5" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
  </>
);

const LoveSVG = () => (
  <>
    <Defs>
      <LinearGradient id="loveRose" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#FDA4AF" />
        <Stop offset="55%" stopColor="#FB7185" />
        <Stop offset="100%" stopColor="#E11D48" />
      </LinearGradient>
    </Defs>
    <Rect width="130" height="130" rx="22" fill="#9F1239" />
    <Rect x="6" y="6" width="118" height="118" rx="18" fill="url(#loveRose)" />
    <Path
      d="M 65 98 C 38 78 28 58 38 44 C 46 32 58 34 65 44 C 72 34 84 32 92 44 C 102 58 92 78 65 98 Z"
      fill="#FFF1F2"
      opacity="0.95"
    />
    <Path
      d="M 65 90 C 44 74 36 58 44 48 C 50 40 58 42 65 50 C 72 42 80 40 86 48 C 94 58 86 74 65 90 Z"
      fill="#FECDD3"
      opacity="0.85"
    />
    <Path
      d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 32 L 32 32 A 26 26 0 0 1 6 58 L 6 20 A 14 14 0 0 1 20 6 Z"
      fill="#FFF7ED"
      opacity="0.35"
    />
    <Circle cx="42" cy="28" r="4" fill="#FEF3C7" opacity="0.75" />
    <Circle cx="88" cy="34" r="3" fill="#FEF3C7" opacity="0.65" />
  </>
);

const OceanSVG = () => (
  <>
    <Defs>
      <LinearGradient id="oceanWater" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#48dbfb" />
        <Stop offset="50%" stopColor="#0abde3" />
        <Stop offset="100%" stopColor="#006699" />
      </LinearGradient>
    </Defs>
    <Rect width="130" height="130" rx="20" fill="#0c2461" />
    <Rect x="6" y="6" width="118" height="118" rx="16" fill="url(#oceanWater)" />
    <Path
      d="M 15 45 Q 35 35 55 45 T 95 45 T 115 45"
      fill="none"
      stroke="#ffffff"
      strokeWidth="3"
      strokeLinecap="round"
      opacity="0.6"
    />
    <Path
      d="M 25 75 Q 45 65 65 75 T 105 75"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.4"
    />
    <G transform="translate(85, 80) scale(0.8)">
      <Path
        d="M 0 -15 L 4 -4 L 15 -4 L 7 3 L 10 14 L 0 8 L -10 14 L -7 3 L -15 -4 L -4 -4 Z"
        fill="#ff6b6b"
      />
      <Circle cx="0" cy="0" r="2" fill="#ff5252" />
    </G>
    <Circle cx="35" cy="30" r="4" fill="#ffffff" opacity="0.5" />
    <Circle cx="38" cy="20" r="2.5" fill="#ffffff" opacity="0.4" />
    <Circle cx="32" cy="12" r="1.5" fill="#ffffff" opacity="0.3" />
    <Circle cx="95" cy="50" r="3" fill="#ffffff" opacity="0.5" />
    <Circle cx="98" cy="42" r="2" fill="#ffffff" opacity="0.4" />
    <Path
      d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z"
      fill="#ffffff"
      opacity="0.3"
    />
  </>
);

const SunsetSVG = () => (
  <>
    <Defs>
      <LinearGradient id="sunsetSky" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#ff6a88" />
        <Stop offset="50%" stopColor="#ff9966" />
        <Stop offset="100%" stopColor="#ffce00" />
      </LinearGradient>
      <LinearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#2b2d42" />
        <Stop offset="100%" stopColor="#191a27" />
      </LinearGradient>
    </Defs>
    {/* Outer border */}
    <Rect width="130" height="130" rx="20" fill="#1e152a" />
    {/* Sunset sky */}
    <Rect x="6" y="6" width="118" height="118" rx="16" fill="url(#sunsetSky)" />
    {/* Sun */}
    <Circle cx="65" cy="75" r="22" fill="#ffffff" opacity="0.9" />
    {/* Birds */}
    <Path
      d="M 25 35 Q 30 28 35 35 Q 40 28 45 35"
      fill="none"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
    <Path
      d="M 85 25 Q 90 20 95 25 Q 100 20 105 25"
      fill="none"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    {/* Ocean */}
    <Path
      d="M 6 85 L 124 85 L 124 108 A 16 16 0 0 1 108 124 L 22 124 A 16 16 0 0 1 6 108 Z"
      fill="url(#oceanGrad)"
    />
    {/* Sun reflection */}
    <Rect x="50" y="90" width="30" height="3" rx="1.5" fill="#ffce00" opacity="0.8" />
    <Rect x="55" y="96" width="20" height="3" rx="1.5" fill="#ffce00" opacity="0.6" />
    <Rect x="62" y="102" width="6" height="3" rx="1.5" fill="#ffce00" opacity="0.4" />
    <Rect x="64" y="108" width="2" height="3" rx="1.5" fill="#ffce00" opacity="0.2" />
    {/* Top-left highlight */}
    <Path
      d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z"
      fill="#ffffff"
      opacity="0.3"
    />
  </>
);

const IcecreamSVG = () => (
  <>
    <Defs>
      <LinearGradient id="creamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <Stop offset="0%" stopColor="#fd79a8" />
        <Stop offset="100%" stopColor="#fab1a0" />
      </LinearGradient>
      <LinearGradient id="waffleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#e17055" />
        <Stop offset="100%" stopColor="#d63031" />
      </LinearGradient>
    </Defs>
    <Rect width="130" height="130" rx="20" fill="#3d2314" />
    <Rect x="6" y="6" width="118" height="118" rx="16" fill="url(#creamGrad)" />
    <Path
      d="M 6 90 L 124 90 L 124 108 A 16 16 0 0 1 108 124 L 22 124 A 16 16 0 0 1 6 108 Z"
      fill="url(#waffleGrad)"
    />
    <Path
      d="M 20 90 L 40 124 M 50 90 L 70 124 M 80 90 L 100 124 M 110 90 L 120 110"
      stroke="#b22222"
      strokeWidth="2"
      opacity="0.4"
    />
    <Path
      d="M 10 100 L 120 105 M 10 115 L 100 120"
      stroke="#b22222"
      strokeWidth="1.5"
      opacity="0.3"
    />
    <Circle cx="65" cy="55" r="28" fill="#ffeaa7" />
    <Circle cx="48" cy="65" r="16" fill="#55efc4" />
    <Circle cx="82" cy="65" r="16" fill="#ff7675" />
    <Rect x="58" y="40" width="6" height="3" rx="1.5" fill="#0984e3" transform="rotate(25 61 41.5)" />
    <Rect x="70" y="50" width="6" height="3" rx="1.5" fill="#e84393" transform="rotate(-15 73 51.5)" />
    <Rect x="62" y="62" width="6" height="3" rx="1.5" fill="#00b894" transform="rotate(45 65 63.5)" />
    <Circle cx="65" cy="28" r="8" fill="#d63031" />
    <Path
      d="M 65 20 Q 75 10 82 15"
      fill="none"
      stroke="#00b894"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Path
      d="M 20 6 L 110 6 A 14 14 0 0 1 124 20 L 124 30 L 30 30 A 24 24 0 0 1 6 54 L 6 20 A 14 14 0 0 1 20 6 Z"
      fill="#ffffff"
      opacity="0.3"
    />
  </>
);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  imageClip: {
    backgroundColor: '#E31837',
  },
});
