export const DEFAULT_THEME_PALETTE_ID = 'veranda';

export const THEME_PALETTE_IDS = [
  'veranda',
  'primavera',
  'strawberry',
  'lotus-pond',
  'ocean-deep',
  'pool-party',
  'sunset',
  'pastel-dream',
  'fresh-green',
] as const;

export type ThemePaletteId = (typeof THEME_PALETTE_IDS)[number];

export function isThemePaletteId(value: string): value is ThemePaletteId {
  return (THEME_PALETTE_IDS as readonly string[]).includes(value);
}
