import { useEffect, useMemo } from 'react';
import { Animated, Easing, StyleProp, View, ViewStyle } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

export type ProgressIndicatorVariant = 'linear' | 'circular';

export type ProgressIndicatorProps = {
  variant?: ProgressIndicatorVariant;
  /** 0–100. Omit for an indeterminate/animated state. */
  value?: number;
  /** Circular diameter. */
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  style?: StyleProp<ViewStyle>;
};

/**
 * Half-ring arc used to compose the circular indicator without SVG:
 * a clipped window over a circle whose border is colored on two adjacent
 * sides (a 180° arc from 45° to 225°, compass-clockwise), then rotated.
 */
const CircularArc = ({
  size,
  thickness,
  color,
  window,
  rotate,
}: {
  size: number;
  thickness: number;
  color: string;
  window: 'left' | 'right';
  rotate: number;
}) => (
  <View pointerEvents="none" style={styles.arcWindow(size, window)}>
    <View style={styles.arc(size, thickness, color, window, rotate)} />
  </View>
);

/**
 * ProgressIndicator — MD3 linear or circular progress.
 * Omit `value` (0–100) for an indeterminate/animated state.
 */
export const ProgressIndicator = ({
  variant = 'linear',
  value,
  size = 48,
  thickness = 4,
  color,
  trackColor,
  style,
}: ProgressIndicatorProps) => {
  const { theme } = useUnistyles();
  const barColor = color ?? theme.colors.primary;
  const track = trackColor ?? theme.colors.surfaceContainerHighest;
  const determinate = typeof value === 'number';

  // Recreated per variant: a value once driven natively (circular) can't be reused
  // by the JS driver (linear).
  const anim = useMemo(() => new Animated.Value(0), [variant]);

  useEffect(() => {
    if (determinate) return;
    const loop = Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: variant === 'circular' ? 1400 : 1600,
        easing: Easing.linear,
        // Linear indeterminate animates `left` (layout prop) — no native driver.
        useNativeDriver: variant === 'circular',
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, determinate, variant]);

  if (variant === 'circular') {
    const angle = determinate ? (Math.min(100, Math.max(0, value)) / 100) * 360 : 0;
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityValue={determinate ? { min: 0, max: 100, now: value } : undefined}
        style={[{ width: size, height: size }, style]}
      >
        <View style={styles.circularTrack(size, thickness, track)} />
        {determinate ? (
          <>
            {angle > 0 ? (
              <CircularArc size={size} thickness={thickness} color={barColor} window="right" rotate={Math.min(angle, 180) - 225} />
            ) : null}
            {angle > 180 ? (
              <CircularArc size={size} thickness={thickness} color={barColor} window="left" rotate={angle - 225} />
            ) : null}
          </>
        ) : (
          <Animated.View
            style={{
              position: 'absolute',
              width: size,
              height: size,
              transform: [
                {
                  rotate: anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
                },
              ],
            }}
          >
            {/* 90° arc (top border only), spun continuously */}
            <View style={styles.spinnerArc(size, thickness, barColor)} />
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={determinate ? { min: 0, max: 100, now: value } : undefined}
      style={[styles.linearTrack(thickness, track), style]}
    >
      {determinate ? (
        <View style={styles.linearFill(Math.min(100, Math.max(0, value)), barColor)} />
      ) : (
        <Animated.View
          style={[
            styles.linearIndeterminate(barColor),
            { left: anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: ['-40%', '100%', '100%'] }) },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  arcWindow: (size: number, window: 'left' | 'right') => ({
    position: 'absolute',
    top: 0,
    left: window === 'right' ? size / 2 : 0,
    width: size / 2,
    height: size,
    overflow: 'hidden',
  }),
  arc: (size: number, thickness: number, color: string, window: 'left' | 'right', rotate: number) => ({
    position: 'absolute',
    left: window === 'right' ? -size / 2 : 0,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: thickness,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: color,
    borderBottomColor: color,
    transform: [{ rotate: `${rotate}deg` }],
  }),
  circularTrack: (size: number, thickness: number, track: string) => ({
    position: 'absolute',
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: thickness,
    borderColor: track,
  }),
  spinnerArc: (size: number, thickness: number, color: string) => ({
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: thickness,
    borderTopColor: color,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  }),
  linearTrack: (thickness: number, track: string) => ({
    alignSelf: 'stretch',
    height: thickness,
    borderRadius: theme.shape.full,
    backgroundColor: track,
    overflow: 'hidden',
  }),
  linearFill: (pct: number, color: string) => ({
    width: `${pct}%`,
    height: '100%',
    borderRadius: theme.shape.full,
    backgroundColor: color,
  }),
  linearIndeterminate: (color: string) => ({
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '40%',
    borderRadius: theme.shape.full,
    backgroundColor: color,
  }),
}));
