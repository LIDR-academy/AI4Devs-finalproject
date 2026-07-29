import {
  DEFAULT_THEME_PALETTE_ID,
  THEME_PALETTES,
  type ThemePaletteId,
  isThemePaletteId,
} from './palettes';

export function applyTheme(paletteId: ThemePaletteId): void {
  const palette = THEME_PALETTES[paletteId];
  const root = document.documentElement;

  for (const [name, value] of Object.entries(palette.vars)) {
    root.style.setProperty(name, value);
  }

  root.dataset.theme = paletteId;
}

export function applyThemeById(paletteId: string | null | undefined): ThemePaletteId {
  const resolved = paletteId && isThemePaletteId(paletteId) ? paletteId : DEFAULT_THEME_PALETTE_ID;
  applyTheme(resolved);
  return resolved;
}

export function clearAppliedTheme(): void {
  applyTheme(DEFAULT_THEME_PALETTE_ID);
}
