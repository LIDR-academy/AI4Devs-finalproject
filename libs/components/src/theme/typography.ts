import { Platform, TextStyle } from 'react-native';

/**
 * AI Study Buddy — typography (MD3 type scale).
 * Display / Headline / Title → Sora · Body / Label → IBM Plex Sans · data → IBM Plex Mono.
 * On web the families resolve via CSS fallback stacks; on native the app must load
 * fonts registered under these exact family names (e.g. with expo-font).
 */
export const fontFamily = {
  brand: Platform.select({
    web: "'Sora', ui-sans-serif, system-ui, sans-serif",
    default: 'Sora',
  }) as string,
  body: Platform.select({
    web: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
    default: 'IBM Plex Sans',
  }) as string,
  mono: Platform.select({
    web: "'IBM Plex Mono', ui-monospace, monospace",
    default: 'IBM Plex Mono',
  }) as string,
  icon: 'Material Symbols Rounded',
};

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extra: '800',
} as const;

export type TypeRole =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'titleLarge'
  | 'titleMedium'
  | 'titleSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

export const typography = {
  displayLarge: { fontFamily: fontFamily.brand, fontSize: 57, lineHeight: 64, fontWeight: '700', letterSpacing: -0.5 },
  displayMedium: { fontFamily: fontFamily.brand, fontSize: 45, lineHeight: 52, fontWeight: '700', letterSpacing: -0.25 },
  displaySmall: { fontFamily: fontFamily.brand, fontSize: 36, lineHeight: 44, fontWeight: '700', letterSpacing: 0 },
  headlineLarge: { fontFamily: fontFamily.brand, fontSize: 32, lineHeight: 40, fontWeight: '600', letterSpacing: 0 },
  headlineMedium: { fontFamily: fontFamily.brand, fontSize: 28, lineHeight: 36, fontWeight: '600', letterSpacing: 0 },
  headlineSmall: { fontFamily: fontFamily.brand, fontSize: 24, lineHeight: 32, fontWeight: '600', letterSpacing: 0 },
  titleLarge: { fontFamily: fontFamily.brand, fontSize: 22, lineHeight: 28, fontWeight: '600', letterSpacing: 0 },
  titleMedium: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24, fontWeight: '600', letterSpacing: 0.15 },
  titleSmall: { fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0.1 },
  bodyLarge: { fontFamily: fontFamily.body, fontSize: 16, lineHeight: 24, fontWeight: '400', letterSpacing: 0.15 },
  bodyMedium: { fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20, fontWeight: '400', letterSpacing: 0.25 },
  bodySmall: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 16, fontWeight: '400', letterSpacing: 0.4 },
  labelLarge: { fontFamily: fontFamily.body, fontSize: 14, lineHeight: 20, fontWeight: '600', letterSpacing: 0.1 },
  labelMedium: { fontFamily: fontFamily.body, fontSize: 12, lineHeight: 16, fontWeight: '600', letterSpacing: 0.5 },
  labelSmall: { fontFamily: fontFamily.body, fontSize: 11, lineHeight: 16, fontWeight: '600', letterSpacing: 0.5 },
} as const satisfies Record<TypeRole, TextStyle>;
