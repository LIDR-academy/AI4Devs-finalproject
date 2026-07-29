export const DEFAULT_FORMAT_NAMES = ['Audio', 'Ebook', 'Físico'] as const;

export const LEGACY_READ_FORMAT_BY_NAME: Record<string, string> = {
  Físico: 'fisico',
  Ebook: 'ebook',
  Audio: 'audio',
};

export const LEGACY_NAME_BY_READ_FORMAT: Record<string, string> = {
  fisico: 'Físico',
  ebook: 'Ebook',
  audio: 'Audio',
};

export function legacySlugFromFormatName(
  name: string | null | undefined,
): string | null {
  if (!name) {
    return null;
  }
  return LEGACY_READ_FORMAT_BY_NAME[name] ?? null;
}
