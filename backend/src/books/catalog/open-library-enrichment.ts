/** Helpers to resolve genre and page_count from Open Library work/edition APIs. */

export function pickGenreFromSubjects(subjects?: string[]): string | null {
  if (!subjects?.length) return null;

  for (const raw of subjects) {
    const s = raw.trim();
    if (!s || s.startsWith('series:')) continue;
    if (s.startsWith('place:') || s.startsWith('person:')) continue;
    const cleaned = s.replace(/_/g, ' ');
    if (cleaned.length > 0 && cleaned.length <= 100) {
      return cleaned;
    }
  }

  return null;
}

export interface OlSearchDocFields {
  key?: string;
  title?: string;
  author_name?: string[];
  cover_i?: number;
  cover_edition_key?: string;
  number_of_pages_median?: number;
  subject?: string[];
  series_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
}

export interface OlEditionEntry {
  key?: string;
  number_of_pages?: number;
  subjects?: string[];
  series?: string[];
  works?: { key: string }[];
}

export interface OlWorkDetail {
  subjects?: string[];
  subject?: string[];
}

export function resolveGenre(
  workSubjects?: string[],
  docSubjects?: string[],
  seriesName?: string[],
): string | null {
  return (
    pickGenreFromSubjects(workSubjects) ??
    pickGenreFromSubjects(docSubjects) ??
    seriesName?.[0]?.trim() ??
    null
  );
}

export function resolvePageCount(
  median?: number,
  coverEditionKey?: string,
  editions?: OlEditionEntry[],
): number | null {
  if (median != null && median > 0) return median;

  if (coverEditionKey && editions?.length) {
    const editionPath = coverEditionKey.startsWith('/books/')
      ? coverEditionKey
      : `/books/${coverEditionKey}`;
    const match = editions.find((e) => e.key === editionPath);
    if (match?.number_of_pages) return match.number_of_pages;
  }

  for (const edition of editions ?? []) {
    if (edition.number_of_pages && edition.number_of_pages > 0) {
      return edition.number_of_pages;
    }
  }

  return null;
}
