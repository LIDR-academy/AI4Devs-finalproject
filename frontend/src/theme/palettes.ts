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

export const DEFAULT_THEME_PALETTE_ID: ThemePaletteId = 'veranda';

export type ThemePaletteSlots = {
  primary: string;
  secondary: string;
  surfaceCard: string;
  highlight: string;
  accentKpi: string;
  primaryHover?: string;
  surfaceMuted?: string;
  primaryText?: string;
  border?: string;
};

export type ThemePaletteDefinition = {
  id: ThemePaletteId;
  label: string;
  preview: [string, string, string, string, string];
  vars: Record<string, string>;
};

function buildPalette(
  id: ThemePaletteId,
  label: string,
  slots: ThemePaletteSlots,
): ThemePaletteDefinition {
  const preview: ThemePaletteDefinition['preview'] = [
    slots.primary,
    slots.secondary,
    slots.surfaceCard,
    slots.highlight,
    slots.accentKpi,
  ];

  return {
    id,
    label,
    preview,
    vars: {
      '--color-primary': slots.primary,
      '--color-primary-hover': slots.primaryHover ?? slots.primary,
      '--color-primary-text': slots.primaryText ?? '#ffffff',
      '--color-secondary': slots.secondary,
      '--color-secondary-text': '#2d4a4a',
      '--color-background': '#ffffff',
      '--color-surface': '#ffffff',
      '--color-surface-card': slots.surfaceCard,
      '--color-surface-muted': slots.surfaceMuted ?? slots.surfaceCard,
      '--color-highlight': slots.highlight,
      '--color-accent-kpi': slots.accentKpi,
      '--color-text': '#2d4a4a',
      '--color-text-muted': '#5a7373',
      '--color-text-heading': '#1a3333',
      '--color-border': slots.border ?? '#d4ddd9',
      '--color-border-strong': slots.secondary,
      '--color-focus-ring': slots.primary,
    },
  };
}

export const THEME_PALETTES: Record<ThemePaletteId, ThemePaletteDefinition> = {
  veranda: buildPalette('veranda', 'Veranda', {
    primary: '#6bb1ad',
    secondary: '#a7bcbd',
    surfaceCard: '#ececdb',
    highlight: '#e5a9a9',
    accentKpi: '#e6748e',
    primaryHover: '#5a9e9a',
    surfaceMuted: '#f7f6ef',
  }),
  primavera: buildPalette('primavera', 'Primavera', {
    primary: '#e2889f',
    secondary: '#deecf5',
    surfaceCard: '#ffdfb6',
    highlight: '#ffcfe4',
    accentKpi: '#f8aa80',
    primaryHover: '#d6768d',
    surfaceMuted: '#fff4e8',
  }),
  strawberry: buildPalette('strawberry', 'Fresa', {
    primary: '#e24b5a',
    secondary: '#8e9a5a',
    surfaceCard: '#f6e7b8',
    highlight: '#f9c3cb',
    accentKpi: '#f06c78',
    primaryHover: '#c93f4d',
    surfaceMuted: '#faf3e0',
  }),
  'lotus-pond': buildPalette('lotus-pond', 'Estanque de loto', {
    primary: '#105666',
    secondary: '#839958',
    surfaceCard: '#f7f4d5',
    highlight: '#d3968c',
    accentKpi: '#0a3323',
    primaryHover: '#0d4652',
    surfaceMuted: '#fbf9eb',
  }),
  'ocean-deep': buildPalette('ocean-deep', 'Océano profundo', {
    primary: '#206abc',
    secondary: '#7997e6',
    surfaceCard: '#caa9f3',
    highlight: '#b37ad4',
    accentKpi: '#0e155e',
    primaryHover: '#1a5aa0',
    surfaceMuted: '#e8dcf9',
  }),
  'pool-party': buildPalette('pool-party', 'Fiesta en la piscina', {
    primary: '#227e9d',
    secondary: '#96d0d2',
    surfaceCard: '#fdf9fa',
    highlight: '#fda5cc',
    accentKpi: '#fd50a4',
    primaryHover: '#51acc5',
    surfaceMuted: '#f5fbfb',
  }),
  sunset: buildPalette('sunset', 'Atardecer', {
    primary: '#6b5fa4',
    secondary: '#8787ce',
    surfaceCard: '#fdd2a3',
    highlight: '#fdb5a5',
    accentKpi: '#bf93d0',
    primaryHover: '#5a4f8f',
    surfaceMuted: '#fef0dc',
  }),
  'pastel-dream': buildPalette('pastel-dream', 'Sueño pastel', {
    primary: '#a1e3fa',
    secondary: '#c4c3f3',
    surfaceCard: '#fcf0b9',
    highlight: '#edc3f1',
    accentKpi: '#fdc2c9',
    primaryHover: '#7fd4f2',
    surfaceMuted: '#b7f8d3',
    primaryText: '#1a3333',
  }),
  'fresh-green': buildPalette('fresh-green', 'Verde fresco', {
    primary: '#9abf17',
    secondary: '#84bf93',
    surfaceCard: '#f3eeb6',
    highlight: '#aed9c5',
    accentKpi: '#d4db74',
    primaryHover: '#85a814',
    surfaceMuted: '#ddecf1',
    primaryText: '#1a3333',
  }),
};

export const THEME_PALETTE_LIST = THEME_PALETTE_IDS.map((id) => THEME_PALETTES[id]);

export function isThemePaletteId(value: string): value is ThemePaletteId {
  return (THEME_PALETTE_IDS as readonly string[]).includes(value);
}

export function themeCacheKey(userId: string): string {
  return `theme_palette_id:${userId}`;
}
