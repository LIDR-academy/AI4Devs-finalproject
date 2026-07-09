import { Easing, EasingFunction } from 'react-native';

/**
 * AI Study Buddy — motion (MD3 easing + duration).
 * Emphasized easing for hero moments; standard for utility state changes.
 */
export const easing: Record<
  | 'standard'
  | 'standardDecelerate'
  | 'standardAccelerate'
  | 'emphasized'
  | 'emphasizedDecelerate'
  | 'emphasizedAccelerate',
  EasingFunction
> = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  standardDecelerate: Easing.bezier(0, 0, 0, 1),
  standardAccelerate: Easing.bezier(0.3, 0, 1, 1),
  emphasized: Easing.bezier(0.2, 0, 0, 1),
  emphasizedDecelerate: Easing.bezier(0.05, 0.7, 0.1, 1),
  emphasizedAccelerate: Easing.bezier(0.3, 0, 0.8, 0.15),
};

/** Durations in ms. UI 150–400; hero slide transitions up to 500–700. */
export const duration = {
  short1: 50,
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  extraLong1: 700,
} as const;
