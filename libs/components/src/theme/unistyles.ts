import { StyleSheet } from 'react-native-unistyles';

import {
  darkColors,
  disabledOpacity,
  hexWithOpacity,
  lightColors,
  mixHex,
  stateLayerOpacity,
} from './colors';
import { elevation } from './elevation';
import { duration, easing } from './motion';
import { shape } from './shape';
import { layout, padding, spacing } from './spacing';
import { fontFamily, fontWeight, typography } from './typography';

/**
 * AI Study Buddy — unistyles theme registry.
 * Every design token is exposed through the theme object so components style
 * exclusively from `theme` (no direct token imports) and re-render on theme switch.
 */
const baseTheme = {
  fontFamily,
  fontWeight,
  typography,
  spacing,
  padding,
  layout,
  shape,
  elevation,
  easing,
  duration,
  stateLayerOpacity,
  disabledOpacity,
  utils: {
    hexWithOpacity,
    mixHex,
  },
} as const;

export const lightTheme = {
  ...baseTheme,
  scheme: 'light',
  colors: lightColors,
} as const;

export const darkTheme = {
  ...baseTheme,
  scheme: 'dark',
  colors: darkColors,
} as const;

export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

/** MD3 window size classes (compact / medium / expanded / large / extra-large). */
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 840,
  lg: 1200,
  xl: 1600,
} as const;

export type AppTheme = typeof lightTheme;
export type ThemeScheme = keyof typeof themes;

type AppThemes = typeof themes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes,
  breakpoints,
  settings: {
    // Follow the OS color scheme; storybook opts out to drive themes manually.
    adaptiveThemes: true,
  },
});
