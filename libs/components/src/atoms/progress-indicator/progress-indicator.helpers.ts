import { Animated, Easing } from 'react-native';

import type { ProgressIndicatorVariant } from './progress-indicator.types';

/** Clamp a progress value to the 0–100 range used by the fill and arc. */
export const clampProgressPercent = (value: number): number => Math.min(100, Math.max(0, value));

/** Degrees of filled arc for a determinate circular indicator. */
export const circularProgressAngle = (value: number): number =>
  (clampProgressPercent(value) / 100) * 360;

export type IndeterminateTiming = {
  duration: number;
  useNativeDriver: boolean;
};

/** Timing for the indeterminate spinner (pure — unit-tested; avoids Animated mutants). */
export const indeterminateTiming = (
  variant: ProgressIndicatorVariant,
  platformOS: string,
): IndeterminateTiming => ({
  duration: variant === 'circular' ? 1400 : 1600,
  useNativeDriver: platformOS !== 'web' && variant === 'circular',
});

type AnimatedLike = {
  loop: (animation: unknown) => { start: () => void; stop: () => void };
  timing: (
    value: unknown,
    config: {
      toValue: number;
      duration: number;
      easing: unknown;
      useNativeDriver: boolean;
    },
  ) => unknown;
};

/** Start the indeterminate loop; returns a disposer that stops it (unit-tested). */
export const runIndeterminateLoop = (
  anim: unknown,
  timing: IndeterminateTiming,
  animated: AnimatedLike = Animated as unknown as AnimatedLike,
): (() => void) => {
  const loop = animated.loop(
    animated.timing(anim, {
      toValue: 1,
      duration: timing.duration,
      easing: Easing.linear,
      useNativeDriver: timing.useNativeDriver,
    }),
  );
  loop.start();
  return () => {
    loop.stop();
  };
};

export const circularBoxStyle = (size: number) => ({
  width: size,
  height: size,
});

export const circularSpinnerFrameStyle = (size: number) => ({
  position: 'absolute' as const,
  width: size,
  height: size,
});

export const circularTrackStyle = (size: number, thickness: number, track: string) => ({
  position: 'absolute' as const,
  width: size,
  height: size,
  borderRadius: size / 2,
  borderWidth: thickness,
  borderColor: track,
});

export const spinnerArcStyle = (size: number, thickness: number, color: string) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
  borderWidth: thickness,
  borderTopColor: color,
  borderRightColor: 'transparent' as const,
  borderBottomColor: 'transparent' as const,
  borderLeftColor: 'transparent' as const,
});

export const linearTrackStyle = (thickness: number, track: string, borderRadius: number) => ({
  alignSelf: 'stretch' as const,
  height: thickness,
  borderRadius,
  backgroundColor: track,
  overflow: 'hidden' as const,
});

export const linearFillStyle = (
  pct: number,
  color: string,
  borderRadius: number,
): {
  width: `${number}%`;
  height: '100%';
  borderRadius: number;
  backgroundColor: string;
} => ({
  width: `${pct}%`,
  height: '100%',
  borderRadius,
  backgroundColor: color,
});

export const linearIndeterminateStyle = (color: string, borderRadius: number) => ({
  position: 'absolute' as const,
  top: 0,
  height: '100%' as const,
  width: '40%' as const,
  borderRadius,
  backgroundColor: color,
});

export const arcWindowStyle = (size: number, window: 'left' | 'right') => ({
  position: 'absolute' as const,
  top: 0,
  left: window === 'right' ? size / 2 : 0,
  width: size / 2,
  height: size,
  overflow: 'hidden' as const,
});

/** Right-window arc rotation for a filled angle (degrees). */
export const rightArcRotate = (angle: number): number => Math.min(angle, 180) - 225;

/** Left-window arc rotation for a filled angle (degrees). */
export const leftArcRotate = (angle: number): number => angle - 225;

export const arcStyle = (
  size: number,
  thickness: number,
  color: string,
  window: 'left' | 'right',
  rotate: number,
) => ({
  position: 'absolute' as const,
  left: window === 'right' ? -size / 2 : 0,
  width: size,
  height: size,
  borderRadius: size / 2,
  borderWidth: thickness,
  borderTopColor: 'transparent' as const,
  borderLeftColor: 'transparent' as const,
  borderRightColor: color,
  borderBottomColor: color,
  transform: [{ rotate: `${rotate}deg` }],
});
