import { CoverOptionDto } from '../dto/edition-covers.dto';

export const MAX_COVERS = 12;

export function normalizeCoverUrl(url: string): string {
  return url.trim().replace(/^http:/, 'https:');
}

export function openLibraryCoverUrl(coverId: number | string): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

export function openLibraryIsbnCoverUrl(isbn: string): string {
  const clean = isbn.replace(/-/g, '');
  return `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg`;
}

export function extractOpenLibraryCoverIdFromUrl(url: string): string | null {
  const match = url.match(/\/b\/id\/(\d+)/);
  return match?.[1] ?? null;
}

export function finalizeCovers(
  raw: CoverOptionDto[],
  hintCoverUrl?: string,
): { covers: CoverOptionDto[]; default_cover_id: string | null } {
  const seen = new Set<string>();
  const covers: CoverOptionDto[] = [];

  for (const item of raw) {
    const url = normalizeCoverUrl(item.url);
    if (seen.has(url)) continue;
    seen.add(url);
    covers.push({ ...item, url });
    if (covers.length >= MAX_COVERS) break;
  }

  let default_cover_id: string | null = covers[0]?.id ?? null;
  if (hintCoverUrl) {
    const hintNorm = normalizeCoverUrl(hintCoverUrl);
    const match = covers.find((c) => c.url === hintNorm);
    if (match) default_cover_id = match.id;
    else {
      const hintId = extractOpenLibraryCoverIdFromUrl(hintNorm);
      if (hintId) {
        const byId = covers.find((c) => c.id === hintId);
        if (byId) default_cover_id = byId.id;
      }
    }
  }

  return { covers, default_cover_id };
}
