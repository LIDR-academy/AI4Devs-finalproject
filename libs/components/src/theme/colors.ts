/**
 * AI Study Buddy — color system (Material Design 3 tonal model).
 * Palette "Slate & Rust", ported from the design system's tokens/colors.css.
 * oklch ramp values are pre-converted to sRGB hex (React Native has no oklch support).
 */

export const palette = {
  brand: {
    midnight: '#1B2B3A',
    steel: '#2E4A60',
    rust: '#B84C2B',
    offWhite: '#F2EFE9',
    white: '#FFFFFF',
  },
  /** Steel Blue ramp (hue ~248) */
  primary: {
    0: '#000000',
    10: '#0b1c2b',
    20: '#172d42',
    30: '#274159',
    40: '#3b5874',
    50: '#547594',
    60: '#7393b1',
    70: '#94aec8',
    80: '#b6cade',
    90: '#d6e3f0',
    95: '#e9f1f9',
    99: '#f9fcff',
    100: '#ffffff',
  },
  /** Midnight Slate ramp (hue ~252, low chroma) */
  secondary: {
    0: '#000000',
    10: '#0d1722',
    20: '#1a2634',
    30: '#2e3c4c',
    40: '#445466',
    50: '#607083',
    60: '#7e8ea0',
    70: '#9ca9b8',
    80: '#bbc5d1',
    90: '#d9e0e9',
    95: '#eaeff4',
    99: '#fafcfe',
    100: '#ffffff',
  },
  /** Rust ramp (hue ~42) */
  tertiary: {
    0: '#000000',
    10: '#300f02',
    20: '#4f1b04',
    30: '#762e0d',
    40: '#a04318',
    45: '#b54e21',
    50: '#c85c2e',
    60: '#df784e',
    70: '#f09c7c',
    80: '#fbbea6',
    90: '#ffded1',
    95: '#ffede5',
    99: '#fffaf8',
    100: '#ffffff',
  },
  /** Warm neutral ramp (hue ~85, very low chroma) */
  neutral: {
    0: '#000000',
    10: '#1c1a17',
    20: '#302e29',
    30: '#4a4743',
    40: '#65635e',
    50: '#82807b',
    60: '#a19e99',
    70: '#bdbab5',
    80: '#d7d4ce',
    90: '#eae7e2',
    94: '#f3f0ea',
    96: '#f7f4ef',
    98: '#fbf9f5',
    99: '#fdfcf9',
    100: '#ffffff',
  },
  /** Neutral-variant ramp for outlines / muted borders */
  neutralVariant: {
    30: '#414950',
    50: '#6a737b',
    60: '#858d96',
    70: '#a1a9b0',
    80: '#bec5cc',
    90: '#dbe0e6',
  },
  /** MD3 default error red */
  error: {
    10: '#430002',
    20: '#650000',
    40: '#b7191c',
    80: '#fdb1a8',
    90: '#ffd5d0',
  },
} as const;

export type ThemeColors = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
  secondary: string;
  onSecondary: string;
  secondaryContainer: string;
  onSecondaryContainer: string;
  tertiary: string;
  onTertiary: string;
  tertiaryContainer: string;
  onTertiaryContainer: string;
  error: string;
  onError: string;
  errorContainer: string;
  onErrorContainer: string;
  background: string;
  onBackground: string;
  surface: string;
  onSurface: string;
  surfaceVariant: string;
  onSurfaceVariant: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  outline: string;
  outlineVariant: string;
  inverseSurface: string;
  inverseOnSurface: string;
  inversePrimary: string;
  scrim: string;
  shadow: string;
};

export const lightColors: ThemeColors = {
  primary: palette.primary[30],
  onPrimary: palette.primary[100],
  primaryContainer: palette.primary[90],
  onPrimaryContainer: palette.primary[10],
  secondary: palette.secondary[30],
  onSecondary: palette.secondary[100],
  secondaryContainer: palette.secondary[90],
  onSecondaryContainer: palette.secondary[10],
  tertiary: palette.tertiary[45],
  onTertiary: palette.tertiary[100],
  tertiaryContainer: palette.tertiary[90],
  onTertiaryContainer: palette.tertiary[70],
  error: palette.error[40],
  onError: '#ffffff',
  errorContainer: palette.error[90],
  onErrorContainer: palette.error[10],
  background: palette.neutral[96],
  onBackground: palette.neutral[10],
  surface: palette.neutral[98],
  onSurface: palette.neutral[10],
  surfaceVariant: palette.neutralVariant[90],
  onSurfaceVariant: palette.neutralVariant[30],
  surfaceContainerLowest: palette.neutral[100],
  surfaceContainerLow: palette.neutral[96],
  surfaceContainer: palette.neutral[94],
  surfaceContainerHigh: palette.neutral[90],
  surfaceContainerHighest: palette.neutral[80],
  outline: palette.neutralVariant[50],
  outlineVariant: palette.neutralVariant[80],
  inverseSurface: palette.secondary[20],
  inverseOnSurface: palette.neutral[96],
  inversePrimary: palette.primary[80],
  scrim: '#000000',
  shadow: '#000000',
};

export const darkColors: ThemeColors = {
  primary: palette.primary[80],
  onPrimary: palette.primary[20],
  primaryContainer: palette.primary[30],
  onPrimaryContainer: palette.primary[90],
  secondary: palette.secondary[80],
  onSecondary: palette.secondary[20],
  secondaryContainer: palette.secondary[30],
  onSecondaryContainer: palette.secondary[90],
  tertiary: palette.tertiary[80],
  onTertiary: palette.tertiary[20],
  tertiaryContainer: palette.tertiary[30],
  onTertiaryContainer: palette.tertiary[90],
  error: palette.error[80],
  onError: palette.error[20],
  errorContainer: palette.error[20],
  onErrorContainer: palette.error[90],
  background: palette.secondary[10],
  onBackground: palette.neutral[90],
  surface: palette.secondary[10],
  onSurface: palette.neutral[90],
  surfaceVariant: palette.neutralVariant[30],
  onSurfaceVariant: palette.neutralVariant[80],
  surfaceContainerLowest: palette.secondary[0],
  surfaceContainerLow: palette.secondary[10],
  surfaceContainer: '#15202d',
  surfaceContainerHigh: '#202c3b',
  surfaceContainerHighest: '#2c3948',
  outline: palette.neutralVariant[60],
  outlineVariant: palette.neutralVariant[30],
  inverseSurface: palette.neutral[90],
  inverseOnSurface: palette.secondary[20],
  inversePrimary: palette.primary[30],
  scrim: '#000000',
  shadow: '#000000',
};

/** MD3 state-layer opacities: a translucent wash of the content color. */
export const stateLayerOpacity = {
  hover: 0.08,
  focus: 0.12,
  press: 0.24,
  drag: 0.16,
} as const;

/** MD3 disabled-content/container opacity. */
export const disabledOpacity = 0.38;

/** '#rrggbb' + alpha → 'rgba(r, g, b, a)'. */
export const hexWithOpacity = (hex: string, alpha: number): string => {
  const n = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** Mix two '#rrggbb' colors: ratio = weight of `a` (0–1). */
export const mixHex = (a: string, b: string, ratio: number): string => {
  const pa = parseInt(a.slice(1, 7), 16);
  const pb = parseInt(b.slice(1, 7), 16);
  const ch = (shift: number) =>
    Math.round(((pa >> shift) & 255) * ratio + ((pb >> shift) & 255) * (1 - ratio));
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
};
