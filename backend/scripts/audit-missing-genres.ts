/**
 * Audits books with null genre in the database:
 * fetches raw genre strings from Open Library + Google Books,
 * runs them through GenreNormalizerService, and reports unmatched values.
 *
 * Usage:
 *   npm run audit:genres
 *   npm run audit:genres -- --user-id=<uuid> --limit=50
 *   npm run audit:genres -- --json
 */
import axios from 'axios';
import { IsNull } from 'typeorm';
import dataSource from '../src/data-source';
import { Book } from '../src/books/entities/book.entity';
import { pickGenreFromSubjects } from '../src/books/catalog/open-library-enrichment';
import { CATALOG_HTTP_HEADERS } from '../src/books/catalog/catalog-http.constants';
import { GenreNormalizerService } from '../src/books/genre-normalizer.service';
import type { CanonicalGenre } from '../src/books/genre-normalizer.map';

interface CliOptions {
  userId?: string;
  limit: number;
  delayMs: number;
  json: boolean;
}

interface RawGenreHit {
  source: 'open_library_search' | 'open_library_work' | 'google_books';
  value: string;
}

interface BookAuditRow {
  id: string;
  title: string;
  authors: string;
  isbn: string | null;
  raw_genres: RawGenreHit[];
  normalized: CanonicalGenre | null;
  unmatched_raw: string[];
  api_notes: string[];
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    limit: 30,
    delayMs: Number(process.env.CATALOG_MIN_INTERVAL_MS ?? 2500),
    json: false,
  };

  for (const arg of argv) {
    if (arg === '--json') {
      options.json = true;
    } else if (arg.startsWith('--user-id=')) {
      options.userId = arg.slice('--user-id='.length);
    } else if (arg.startsWith('--limit=')) {
      options.limit = Number(arg.slice('--limit='.length));
    } else if (arg.startsWith('--delay=')) {
      options.delayMs = Number(arg.slice('--delay='.length));
    }
  }

  return options;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function fetchOpenLibrarySearch(
  query: string,
): Promise<{ subjects: string[]; workKey: string | null; notes: string[] }> {
  const notes: string[] = [];
  try {
    const { data } = await axios.get<{ docs?: Record<string, unknown>[] }>(
      'https://openlibrary.org/search.json',
      { params: { q: query, limit: 1 }, timeout: 10_000, headers: CATALOG_HTTP_HEADERS },
    );
    const doc = data.docs?.[0];
    if (!doc) {
      notes.push('open_library_search: no hits');
      return { subjects: [], workKey: null, notes };
    }

    const searchSubjects = Array.isArray(doc.subject)
      ? doc.subject.filter((s): s is string => typeof s === 'string')
      : [];
    const workKey =
      typeof doc.key === 'string' && doc.key.startsWith('/works/')
        ? doc.key
        : null;

    return { subjects: searchSubjects, workKey, notes };
  } catch (err) {
    notes.push(
      `open_library_search: ${err instanceof Error ? err.message : String(err)}`,
    );
    return { subjects: [], workKey: null, notes };
  }
}

async function fetchOpenLibraryWorkSubjects(workKey: string): Promise<string[]> {
  try {
    const path = workKey.startsWith('/works/') ? workKey : `/works/${workKey}`;
    const { data } = await axios.get<{ subjects?: string[]; subject?: string[] }>(
      `https://openlibrary.org${path}.json`,
      { timeout: 10_000, headers: CATALOG_HTTP_HEADERS },
    );
    return [...(data.subjects ?? []), ...(data.subject ?? [])];
  } catch {
    return [];
  }
}

async function fetchGoogleBooksCategories(isbn: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  const params: Record<string, string | number> = {
    q: `isbn:${isbn.replace(/-/g, '')}`,
    maxResults: 1,
    printType: 'books',
  };
  if (apiKey) {
    params.key = apiKey;
  }

  try {
    const { data } = await axios.get<{
      items?: { volumeInfo?: { categories?: string[] } }[];
      error?: { message?: string };
    }>('https://www.googleapis.com/books/v1/volumes', {
      params,
      timeout: 10_000,
    });

    if (data.error?.message) {
      return [];
    }

    return data.items?.[0]?.volumeInfo?.categories ?? [];
  } catch {
    return [];
  }
}

function collectRawGenres(
  olSearchSubjects: string[],
  olWorkSubjects: string[],
  gbCategories: string[],
): RawGenreHit[] {
  const hits: RawGenreHit[] = [];

  for (const value of olSearchSubjects) {
    hits.push({ source: 'open_library_search', value });
  }
  for (const value of olWorkSubjects) {
    hits.push({ source: 'open_library_work', value });
  }
  const olWorkPick = pickGenreFromSubjects(olWorkSubjects);
  if (olWorkPick && !hits.some((h) => h.value === olWorkPick)) {
    hits.push({ source: 'open_library_work', value: olWorkPick });
  }
  for (const value of gbCategories) {
    hits.push({ source: 'google_books', value });
  }

  return hits;
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)];
}

async function auditBook(
  book: Book,
  normalizer: GenreNormalizerService,
): Promise<BookAuditRow> {
  const isbn = book.isbn13 ?? book.isbn10;
  const apiNotes: string[] = [];
  let olSearchSubjects: string[] = [];
  let olWorkSubjects: string[] = [];
  let gbCategories: string[] = [];

  if (isbn) {
    const ol = await fetchOpenLibrarySearch(`isbn:${isbn.replace(/-/g, '')}`);
    olSearchSubjects = ol.subjects;
    apiNotes.push(...ol.notes);
    if (ol.workKey) {
      olWorkSubjects = await fetchOpenLibraryWorkSubjects(ol.workKey);
      if (olWorkSubjects.length === 0) {
        apiNotes.push('open_library_work: no subjects');
      }
    }
    gbCategories = await fetchGoogleBooksCategories(isbn);
    if (gbCategories.length === 0) {
      apiNotes.push('google_books: no categories');
    }
  }

  const rawFromIsbn = collectRawGenres(
    olSearchSubjects,
    olWorkSubjects,
    gbCategories,
  );
  const isbnHasGenreData = rawFromIsbn.length > 0;

  if (!isbnHasGenreData && book.title.trim() && book.authors.trim()) {
    const query = `title:${book.title} author:${book.authors}`;
    const ol = await fetchOpenLibrarySearch(query);
    if (ol.workKey) {
      const titleWorkSubjects = await fetchOpenLibraryWorkSubjects(ol.workKey);
      if (titleWorkSubjects.length > 0) {
        apiNotes.push('title_author_fallback: used');
        olWorkSubjects = [...olWorkSubjects, ...titleWorkSubjects];
      } else {
        apiNotes.push('title_author_fallback: work has no subjects');
      }
    } else {
      apiNotes.push('title_author_fallback: no hits');
    }
    olSearchSubjects = [...olSearchSubjects, ...ol.subjects];
  } else if (!isbn) {
    const query = `title:${book.title} author:${book.authors}`;
    const ol = await fetchOpenLibrarySearch(query);
    olSearchSubjects = ol.subjects;
    apiNotes.push(...ol.notes);
    if (ol.workKey) {
      olWorkSubjects = await fetchOpenLibraryWorkSubjects(ol.workKey);
    }
    apiNotes.push('google_books: skipped (no ISBN)');
  }

  const rawGenres = collectRawGenres(
    olSearchSubjects,
    olWorkSubjects,
    gbCategories,
  );
  const rawValues = uniqueStrings(rawGenres.map((hit) => hit.value));

  const normalizedCandidates = rawValues
    .map((value) => normalizer.normalize(value))
    .filter((value): value is CanonicalGenre => value !== null);
  const normalized = normalizedCandidates[0] ?? null;

  const unmatchedRaw = rawValues.filter(
    (value) => normalizer.normalize(value) === null,
  );

  if (rawValues.length === 0) {
    apiNotes.push('no raw genre strings from any provider');
  } else if (!normalized) {
    apiNotes.push('raw genres found but none matched dictionary');
  }

  return {
    id: book.id,
    title: book.title,
    authors: book.authors,
    isbn,
    raw_genres: rawGenres,
    normalized,
    unmatched_raw: unmatchedRaw,
    api_notes: apiNotes,
  };
}

function printHumanReport(rows: BookAuditRow[]): void {
  const unmatchedAggregate = new Map<string, number>();
  let withRaw = 0;
  let withMatch = 0;
  let noApiData = 0;

  for (const row of rows) {
    const rawValues = uniqueStrings(row.raw_genres.map((hit) => hit.value));
    if (rawValues.length === 0) {
      noApiData += 1;
    } else {
      withRaw += 1;
    }
    if (row.normalized) {
      withMatch += 1;
    }
    for (const value of row.unmatched_raw) {
      unmatchedAggregate.set(value, (unmatchedAggregate.get(value) ?? 0) + 1);
    }
  }

  console.log('\n=== Genre audit summary ===');
  console.log(`Books scanned:              ${rows.length}`);
  console.log(`API returned raw genres:    ${withRaw}`);
  console.log(`Dictionary matched:         ${withMatch}`);
  console.log(`No API genre data:          ${noApiData}`);
  console.log(`Still unmatched (raw):      ${unmatchedAggregate.size} unique strings\n`);

  if (unmatchedAggregate.size > 0) {
    console.log('--- Unmatched raw genres (add to genre-normalizer.map.ts) ---');
    const sorted = [...unmatchedAggregate.entries()].sort((a, b) => b[1] - a[1]);
    for (const [value, count] of sorted) {
      console.log(`  ${count}x  ${value}`);
    }
    console.log('');
  }

  console.log('--- Per book ---');
  for (const row of rows) {
    const rawValues = uniqueStrings(row.raw_genres.map((hit) => hit.value));
    console.log(`\n• ${row.title} — ${row.authors}`);
    console.log(`  ISBN: ${row.isbn ?? '(none)'}`);
    if (rawValues.length === 0) {
      console.log('  Raw genres: (none)');
    } else {
      console.log(`  Raw genres: ${rawValues.join(' | ')}`);
    }
    console.log(`  Normalized: ${row.normalized ?? '(no match)'}`);
    if (row.unmatched_raw.length > 0) {
      console.log(`  Unmatched:  ${row.unmatched_raw.join(' | ')}`);
    }
    if (row.api_notes.length > 0) {
      console.log(`  Notes:      ${row.api_notes.join('; ')}`);
    }
  }
  console.log('');
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const normalizer = new GenreNormalizerService();

  await dataSource.initialize();

  try {
    const books = await dataSource.getRepository(Book).find({
      where: {
        genreId: IsNull(),
        ...(options.userId ? { userId: options.userId } : {}),
      },
      order: { createdAt: 'DESC' },
      take: options.limit,
    });

    if (books.length === 0) {
      console.log('No books with null genre found.');
      return;
    }

    console.log(
      `Auditing ${books.length} book(s) without genre (delay ${options.delayMs}ms between calls)...`,
    );

    const rows: BookAuditRow[] = [];
    for (let i = 0; i < books.length; i += 1) {
      const book = books[i];
      process.stdout.write(`[${i + 1}/${books.length}] ${book.title.slice(0, 50)}...\n`);
      rows.push(await auditBook(book, normalizer));
      if (i < books.length - 1) {
        await sleep(options.delayMs);
      }
    }

    if (options.json) {
      console.log(JSON.stringify(rows, null, 2));
    } else {
      printHumanReport(rows);
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
