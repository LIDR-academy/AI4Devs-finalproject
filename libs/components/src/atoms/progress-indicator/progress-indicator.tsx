import { useEffect, useMemo } from 'react';
import { Animated, Platform, type StyleProp, View, type ViewStyle } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import {
  arcStyle,
  arcWindowStyle,
  circularBoxStyle,
  circularProgressAngle,
  circularSpinnerFrameStyle,
  circularTrackStyle,
  clampProgressPercent,
  indeterminateTiming,
  leftArcRotate,
  linearFillStyle,
  linearIndeterminateStyle,
  linearTrackStyle,
  rightArcRotate,
  runIndeterminateLoop,
  spinnerArcStyle,
} from './progress-indicator.helpers';
import type { ProgressIndicatorVariant } from './progress-indicator.types';

export type { ProgressIndicatorVariant } from './progress-indicator.types';

export type ProgressIndicatorProps = {
  variant?: ProgressIndicatorVariant;
  /** 0–100. Omit for an indeterminate/animated state. */
  value?: number;
  /** Circular diameter. */
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  /** Accessible name for the progressbar (WCAG 4.1.2). */
  accessibilityLabel?: string;
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
  <View pointerEvents="none" testID={`progress-arc-${window}`} style={arcWindowStyle(size, window)}>
    <View style={arcStyle(size, thickness, color, window, rotate)} />
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
  accessibilityLabel,
  style,
}: ProgressIndicatorProps) => {
  const { theme } = useUnistyles();
  const barColor = color ?? theme.colors.primary;
  const track = trackColor ?? theme.colors.surfaceContainerHighest;
  const determinate = typeof value === 'number';
  const fullRadius = theme.shape.full;

  // Recreated per variant: a value once driven natively (circular) can't be reused
  // by the JS driver (linear).
  // biome-ignore lint/correctness/useExhaustiveDependencies: variant is an intentional reset trigger, not a value read inside the memo
  const anim = useMemo(() => new Animated.Value(0), [variant]);

  useEffect(() => {
    if (determinate) return;
    return runIndeterminateLoop(anim, indeterminateTiming(variant, Platform.OS));
  }, [anim, determinate, variant]);

  if (variant === 'circular') {
    const angle = determinate ? circularProgressAngle(value as number) : 0;
    return (
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={accessibilityLabel}
        accessibilityValue={determinate ? { min: 0, max: 100, now: value } : undefined}
        style={[circularBoxStyle(size), style]}
      >
        <View testID="progress-circular-track" style={circularTrackStyle(size, thickness, track)} />
        {determinate ? (
          <>
            {angle > 0 ? (
              <CircularArc
                size={size}
                thickness={thickness}
                color={barColor}
                window="right"
                rotate={rightArcRotate(angle)}
              />
            ) : null}
            {angle > 180 ? (
              <CircularArc
                size={size}
                thickness={thickness}
                color={barColor}
                window="left"
                rotate={leftArcRotate(angle)}
              />
            ) : null}
          </>
        ) : (
          <Animated.View
            testID="progress-circular-spinner"
            style={[
              circularSpinnerFrameStyle(size),
              {
                transform: [
                  {
                    rotate: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={spinnerArcStyle(size, thickness, barColor)} />
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={determinate ? { min: 0, max: 100, now: value } : undefined}
      style={[linearTrackStyle(thickness, track, fullRadius), style]}
    >
      {determinate ? (
        <View
          testID="progress-linear-fill"
          style={linearFillStyle(clampProgressPercent(value as number), barColor, fullRadius)}
        />
      ) : (
        <Animated.View
          testID="progress-linear-indeterminate"
          style={[
            linearIndeterminateStyle(barColor, fullRadius),
            {
              left: anim.interpolate({
                inputRange: [0, 0.6, 1],
                outputRange: ['-40%', '100%', '100%'],
              }),
            },
          ]}
        />
      )}
    </View>
  );
};
