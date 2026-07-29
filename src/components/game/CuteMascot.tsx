/**
 * CuteMascot — Adorable characters that slide in from sides on high combos
 * Two characters: Left (green) and Right (red/pink)
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect, G, Text } from 'react-native-svg';

interface CuteMascotProps {
  visible: boolean;
  emotion: 'calm' | 'happy' | 'excited' | 'shocked';
}

export const CuteMascot = React.memo<CuteMascotProps>(({ visible, emotion }) => {
  return (
    <>
      <MascotSide visible={visible} emotion={emotion} side="left" />
      <MascotSide visible={visible} emotion={emotion} side="right" />
    </>
  );
});
CuteMascot.displayName = 'CuteMascot';

interface MascotSideProps {
  visible: boolean;
  emotion: 'calm' | 'happy' | 'excited' | 'shocked';
  side: 'left' | 'right';
}

const MascotSide = React.memo<MascotSideProps>(({ visible, emotion, side }) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(side === 'left' ? -300 : 300);
  const scaleX = useSharedValue(1);
  const scaleY = useSharedValue(1);
  const bounce = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      opacity.value = withTiming(0, { duration: 150 });
      translateX.value = withTiming(side === 'left' ? -300 : 300, { duration: 250 });
      bounce.value = withTiming(0, { duration: 150 });
      rotate.value = withTiming(0, { duration: 150 });
      scaleX.value = withTiming(1, { duration: 150 });
      scaleY.value = withTiming(1, { duration: 150 });
      return;
    }

    // Duration depends on emotion
    const holdTime = emotion === 'calm' ? 1000 : emotion === 'happy' ? 1500 : 2500;
    
    // Instantly visible but far off-screen
    opacity.value = withSequence(
      withTiming(1, { duration: 0 }),
      withDelay(holdTime, withTiming(0, { duration: 300 }))
    );
    
    // Walk in
    translateX.value = withSequence(
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withDelay(holdTime - 600, withTiming(side === 'left' ? -300 : 300, { duration: 500 }))
    );
    
    if (emotion === 'calm') {
      // Just a small peek and slide back (Good)
      bounce.value = withSequence(
        withTiming(-10, { duration: 150, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 150, easing: Easing.in(Easing.quad) })
      );
      rotate.value = withSequence(
        withTiming(side === 'left' ? 5 : -5, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );
      scaleX.value = 1;
      scaleY.value = 1;
    } else if (emotion === 'happy') {
      // Waddle and jump (Perfect)
      bounce.value = withSequence(
        withTiming(-20, { duration: 150 }),
        withTiming(0, { duration: 150 }),
        withDelay(100, withTiming(-80, { duration: 300, easing: Easing.out(Easing.cubic) })),
        withTiming(0, { duration: 250, easing: Easing.in(Easing.cubic) })
      );
      rotate.value = withSequence(
        withTiming(side === 'left' ? 10 : -10, { duration: 150 }),
        withTiming(side === 'left' ? -10 : 10, { duration: 150 }),
        withTiming(0, { duration: 100 })
      );
      scaleX.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1.2, { duration: 100 }), // squish
        withTiming(0.9, { duration: 300 }), // mid-air
        withTiming(1.2, { duration: 100 }), // land
        withSpring(1)
      );
      scaleY.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0.8, { duration: 100 }), // squish
        withTiming(1.1, { duration: 300 }), // mid-air
        withTiming(0.8, { duration: 100 }), // land
        withSpring(1)
      );
    } else if (emotion === 'excited') {
      // Backflip (Awesome)
      bounce.value = withSequence(
        withTiming(-20, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withTiming(-20, { duration: 100 }),
        withTiming(0, { duration: 100 }),
        withDelay(200, withTiming(-150, { duration: 350, easing: Easing.out(Easing.cubic) })),
        withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) })
      );
      const tilt = side === 'left' ? 12 : -12;
      rotate.value = withSequence(
        withTiming(tilt, { duration: 100 }),
        withTiming(-tilt, { duration: 200 }),
        withTiming(0, { duration: 100 }),
        withDelay(200, withTiming(side === 'left' ? -360 : 360, { duration: 650, easing: Easing.inOut(Easing.ease) })),
        withTiming(0, { duration: 0 })
      );
      scaleX.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(1.3, { duration: 200 }),
        withTiming(0.8, { duration: 350 }),
        withTiming(1.3, { duration: 100 }),
        withSpring(1)
      );
      scaleY.value = withSequence(
        withTiming(1, { duration: 400 }),
        withTiming(0.7, { duration: 200 }),
        withTiming(1.2, { duration: 350 }),
        withTiming(0.7, { duration: 100 }),
        withSpring(1)
      );
    } else {
      // Shocked: Crazy fast spin and multi-bounce (Unbelievable)
      bounce.value = withSequence(
        withTiming(-40, { duration: 150 }),
        withTiming(0, { duration: 150 }),
        withTiming(-200, { duration: 400, easing: Easing.out(Easing.cubic) }),
        withTiming(-100, { duration: 200, easing: Easing.inOut(Easing.quad) }),
        withTiming(-180, { duration: 200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 300, easing: Easing.in(Easing.cubic) })
      );
      rotate.value = withSequence(
        withTiming(side === 'left' ? 20 : -20, { duration: 150 }),
        withTiming(0, { duration: 150 }),
        withTiming(side === 'left' ? -720 : 720, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 0 })
      );
      scaleX.value = withSequence(
        withTiming(1.4, { duration: 150 }),
        withTiming(0.7, { duration: 150 }),
        withTiming(1.1, { duration: 400 }),
        withTiming(1.4, { duration: 100 }),
        withSpring(1)
      );
      scaleY.value = withSequence(
        withTiming(0.6, { duration: 150 }),
        withTiming(1.3, { duration: 150 }),
        withTiming(0.9, { duration: 400 }),
        withTiming(0.6, { duration: 100 }),
        withSpring(1)
      );
    }

  }, [visible, opacity, translateX, scaleX, scaleY, bounce, rotate, side, emotion]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: bounce.value },
      { scaleX: scaleX.value },
      { scaleY: scaleY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  const position = side === 'left' 
    ? { bottom: 120, left: 10 } 
    : { bottom: 120, right: 10 };

  const color = side === 'left' ? '#7E57C2' : '#EF4444'; // Purple left, Red right

  return (
    <Animated.View style={[styles.container, position, animStyle]} pointerEvents="none">
      <MascotSVG emotion={emotion} color={color} side={side} />
    </Animated.View>
  );
});
MascotSide.displayName = 'MascotSide';

const MascotSVG = React.memo<{ emotion: 'calm' | 'happy' | 'excited' | 'shocked'; color: string, side: 'left' | 'right' }>(({ 
  emotion, 
  color: _color,
  side
}) => {
  if (side === 'left') {
    return (
      <View style={styles.mascot}>
        <Svg width="110" height="150" viewBox="0 0 100 130">
          {/* Purple Body */}
          <Rect x="20" y="30" width="60" height="70" rx="12" fill="#7E57C2" />
          <Rect x="20" y="30" width="60" height="70" rx="12" fill="none" stroke="#2D3748" strokeWidth="2" />
          
          {/* Crown */}
          <Path d="M 30 30 L 35 15 L 50 26 L 65 15 L 70 30 Z" fill="#FACC15" stroke="#2D3748" strokeWidth="2" strokeLinejoin="round" />
          <Circle cx="35" cy="15" r="3" fill="#FACC15" stroke="#2D3748" strokeWidth="1" />
          <Circle cx="50" cy="26" r="3" fill="#FACC15" stroke="#2D3748" strokeWidth="1" />
          <Circle cx="65" cy="15" r="3" fill="#FACC15" stroke="#2D3748" strokeWidth="1" />

          {/* Green Jacket */}
          <Path d="M 20 65 L 38 65 L 38 100 L 20 100 Z" fill="#4ADE80" stroke="#2D3748" strokeWidth="2" />
          <Path d="M 80 65 L 62 65 L 62 100 L 80 100 Z" fill="#4ADE80" stroke="#2D3748" strokeWidth="2" />
          
          {/* BLOCK text */}
          <Text x="50" y="85" fontSize="12" fill="#2D3748" textAnchor="middle" fontWeight="900" letterSpacing="1">BLOCK</Text>
          
          {/* Legs */}
          <Rect x="35" y="100" width="10" height="18" rx="4" fill="#7E57C2" stroke="#2D3748" strokeWidth="2" />
          <Rect x="55" y="100" width="10" height="18" rx="4" fill="#7E57C2" stroke="#2D3748" strokeWidth="2" />
          <Path d="M 33 118 L 47 118" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
          <Path d="M 53 118 L 67 118" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />

          {/* Arms hanging */}
          <Rect x="12" y="65" width="10" height="28" rx="4" fill="#7E57C2" stroke="#2D3748" strokeWidth="2" />
          <Rect x="78" y="65" width="10" height="28" rx="4" fill="#7E57C2" stroke="#2D3748" strokeWidth="2" />
          
          {/* Eyes based on emotion */}
          {emotion === 'calm' ? (
            <>
              {/* Calm eyes: simple lines */}
              <Path d="M 35 52 Q 40 50 45 52" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              <Path d="M 55 52 Q 60 50 65 52" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : emotion === 'shocked' ? (
            <>
              {/* Shocked eyes: huge circles */}
              <Circle cx="40" cy="52" r="11" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="60" cy="52" r="11" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="40" cy="52" r="3" fill="#2D3748" />
              <Circle cx="60" cy="52" r="3" fill="#2D3748" />
            </>
          ) : (
            <>
              {/* Happy/Excited eyes */}
              <Circle cx="40" cy="52" r="9" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="60" cy="52" r="9" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="42" cy="52" r="3" fill="#2D3748" />
              <Circle cx="62" cy="52" r="3" fill="#2D3748" />
              <Circle cx="44" cy="50" r="1" fill="#FFF" />
              <Circle cx="64" cy="50" r="1" fill="#FFF" />
            </>
          )}
          
          {/* Mouth based on emotion */}
          {emotion === 'shocked' ? (
            <Ellipse cx="50" cy="65" rx="5" ry="8" fill="#2D3748" />
          ) : emotion === 'excited' ? (
            <Path d="M 43 62 Q 50 72 57 62 Z" fill="#EF4444" stroke="#2D3748" strokeWidth="2" strokeLinejoin="round" />
          ) : emotion === 'calm' ? (
            <Path d="M 47 62 Q 50 64 53 62" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <Path d="M 46 62 Q 50 67 54 62" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </Svg>
      </View>
    );
  } else {
    return (
      <View style={styles.mascot}>
        <Svg width="110" height="150" viewBox="0 0 100 130">
          {/* Red Body */}
          <Rect x="20" y="30" width="60" height="70" rx="12" fill="#EF4444" />
          <Rect x="20" y="30" width="60" height="70" rx="12" fill="none" stroke="#2D3748" strokeWidth="2" />
          
          {/* Spikey Hair */}
          <Path d="M 25 30 L 25 15 L 35 24 L 40 18 L 45 28 Z" fill="#EF4444" stroke="#2D3748" strokeWidth="2" strokeLinejoin="round" />
          
          {/* Yellow Jacket */}
          <Path d="M 20 65 L 35 65 L 35 100 L 20 100 Z" fill="#FACC15" stroke="#2D3748" strokeWidth="2" />
          <Path d="M 80 65 L 65 65 L 65 100 L 80 100 Z" fill="#FACC15" stroke="#2D3748" strokeWidth="2" />
          
          {/* BLAST text (mirrored) */}
          <G transform="scale(-1, 1) translate(-100, 0)">
            <Text x="50" y="85" fontSize="12" fill="#2D3748" textAnchor="middle" fontWeight="900" letterSpacing="1">BLAST</Text>
          </G>
          
          {/* Legs */}
          <Rect x="35" y="100" width="10" height="18" rx="4" fill="#EF4444" stroke="#2D3748" strokeWidth="2" />
          <Rect x="55" y="100" width="10" height="18" rx="4" fill="#EF4444" stroke="#2D3748" strokeWidth="2" />
          <Path d="M 33 118 L 47 118" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />
          <Path d="M 53 118 L 67 118" stroke="#2D3748" strokeWidth="2" strokeLinecap="round" />

          {/* Arms hanging */}
          <Rect x="12" y="65" width="10" height="28" rx="4" fill="#EF4444" stroke="#2D3748" strokeWidth="2" />
          <Rect x="78" y="65" width="10" height="28" rx="4" fill="#EF4444" stroke="#2D3748" strokeWidth="2" />
          
          {/* Eyes based on emotion */}
          {emotion === 'calm' ? (
            <>
              {/* Calm eyes: simple lines */}
              <Path d="M 35 52 Q 40 50 45 52" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              <Path d="M 55 52 Q 60 50 65 52" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          ) : emotion === 'shocked' ? (
            <>
              {/* Shocked eyes: huge circles */}
              <Circle cx="40" cy="52" r="11" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="60" cy="52" r="11" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="40" cy="52" r="3" fill="#2D3748" />
              <Circle cx="60" cy="52" r="3" fill="#2D3748" />
            </>
          ) : emotion === 'happy' ? (
            <>
              {/* Happy eyes */}
              <Circle cx="40" cy="52" r="9" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="60" cy="52" r="9" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="38" cy="52" r="3" fill="#2D3748" />
              <Circle cx="58" cy="52" r="3" fill="#2D3748" />
            </>
          ) : (
            <>
              {/* Sassy Eyes (Excited/Default) */}
              <Path d="M 35 48 Q 50 48 65 48" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              <Path d="M 35 48 Q 42 56 49 48 Z" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Path d="M 51 48 Q 58 56 65 48 Z" fill="#FFF" stroke="#2D3748" strokeWidth="2" />
              <Circle cx="44" cy="51" r="2.5" fill="#2D3748" />
              <Circle cx="60" cy="51" r="2.5" fill="#2D3748" />
            </>
          )}
          
          {/* Mouth based on emotion */}
          {emotion === 'shocked' ? (
            <Ellipse cx="50" cy="65" rx="6" ry="9" fill="#2D3748" />
          ) : emotion === 'excited' ? (
            <Path d="M 42 62 Q 50 74 58 62 Z" fill="#2D3748" stroke="#2D3748" strokeWidth="2" strokeLinejoin="round" />
          ) : emotion === 'calm' ? (
            <Path d="M 45 64 Q 50 65 55 64" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <Path d="M 45 64 Q 50 67 60 60" stroke="#2D3748" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
        </Svg>
      </View>
    );
  }
});
MascotSVG.displayName = 'MascotSVG';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 100,
  },
  mascot: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
});
