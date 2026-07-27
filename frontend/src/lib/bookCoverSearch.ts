import type { BookCoverSearchEdition, CoverOption } from '../api/types';

export function buildBookCoverSearchQuery(title: string, authors: string): string {
  return `${title} ${authors}`.trim();
}

export function flattenBookCoverSearchItems(
  items: BookCoverSearchEdition[],
): CoverOption[] {
  const seen = new Set<string>();
  const result: CoverOption[] = [];

  for (const item of items) {
    for (const cover of item.covers) {
      const id = `${item.external_provider_id}:${cover.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({
        id,
        url: cover.url,
        label: cover.label ?? item.title,
      });
    }
  }

  return result;
}
