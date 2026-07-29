/**
 * Imports backend/data/catalog_seed.csv into catalog_editions (idempotent).
 *
 * Usage:
 *   cd backend
 *   npm run seed:catalog
 *   npm run seed:catalog -- --file=data/catalog_seed.csv
 *   npm run seed:catalog -- --force          # allow re-run even if prior seed recorded
 *   DATABASE_URL=postgresql://...@neon... npm run seed:catalog   # production (once)
 */
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { resolve } from 'path';
import dataSource from '../src/data-source';

interface CliOptions {
  file: string;
  force: boolean;
  batchSize: number;
}

interface SeedRow {
  title: string;
  authors: string;
  isbn_13: string | null;
  isbn_10: string | null;
  cover_image_url: string | null;
  page_count: number | null;
  series_name: string | null;
  publication_year: number | null;
  catalog_genre: string | null;
  data_source: string;
  external_provider_id: string;
}

const CURRENT_YEAR = new Date().getUTCFullYear();

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    file: resolve(__dirname, '../data/catalog_seed.csv'),
    force: false,
    batchSize: 500,
  };

  for (const arg of argv) {
    if (arg === '--force') {
      options.force = true;
    } else if (arg.startsWith('--file=')) {
      options.file = resolve(arg.slice('--file='.length));
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = Number(arg.slice('--batch-size='.length)) || 500;
    }
  }

  return options;
}

function emptyToNull(value: string | undefined): string | null {
  if (value == null) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseIntOrNull(value: string | undefined): number | null {
  const raw = emptyToNull(value);
  if (!raw) {
    return null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function sanitizeYear(value: number | null): number | null {
  if (value == null) {
    return null;
  }
  if (value < 1000 || value > CURRENT_YEAR + 1) {
    return null;
  }
  return value;
}

/** Minimal RFC4180 CSV line parser (handles quoted fields). */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

async function* readSeedRows(filePath: string): AsyncGenerator<SeedRow> {
  const rl = createInterface({
    input: createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  });

  let header: string[] | null = null;

  for await (const line of rl) {
    if (!line.trim()) {
      continue;
    }
    const cols = parseCsvLine(line);
    if (!header) {
      header = cols.map((c) => c.trim());
      continue;
    }

    const get = (name: string): string => {
      const idx = header!.indexOf(name);
      return idx >= 0 ? cols[idx] ?? '' : '';
    };

    const title = emptyToNull(get('title'));
    const authors = emptyToNull(get('authors')) ?? 'Unknown';
    const externalProviderId = emptyToNull(get('external_provider_id'));
    const dataSource = emptyToNull(get('data_source')) ?? 'open_library';

    if (!title || !externalProviderId) {
      continue;
    }

    yield {
      title,
      authors,
      isbn_13: emptyToNull(get('isbn_13')),
      isbn_10: emptyToNull(get('isbn_10')),
      cover_image_url: emptyToNull(get('cover_image_url')),
      page_count: parseIntOrNull(get('page_count')),
      series_name: emptyToNull(get('series_name')),
      publication_year: sanitizeYear(parseIntOrNull(get('publication_year'))),
      catalog_genre: emptyToNull(get('catalog_genre')),
      data_source: dataSource,
      external_provider_id: externalProviderId,
    };
  }
}

async function ensureSeedRunsTable(): Promise<void> {
  await dataSource.query(`
    CREATE TABLE IF NOT EXISTS catalog_seed_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source_file TEXT NOT NULL,
      rows_read INTEGER NOT NULL,
      rows_inserted INTEGER NOT NULL,
      rows_skipped INTEGER NOT NULL,
      completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function hasPriorSeedRun(): Promise<boolean> {
  const rows = (await dataSource.query(
    `SELECT 1 FROM catalog_seed_runs LIMIT 1`,
  )) as unknown[];
  return rows.length > 0;
}

async function insertBatch(rows: SeedRow[]): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  // Deduplicate within the batch (CSV can map multiple works to the same ISBN).
  const byProvider = new Map<string, SeedRow>();
  const seenIsbn = new Set<string>();
  for (const row of rows) {
    const providerKey = `${row.data_source}:${row.external_provider_id}`;
    if (byProvider.has(providerKey)) {
      continue;
    }
    if (row.isbn_13) {
      if (seenIsbn.has(row.isbn_13)) {
        continue;
      }
      seenIsbn.add(row.isbn_13);
    }
    byProvider.set(providerKey, row);
  }
  const uniqueRows = Array.from(byProvider.values());

  let inserted = 0;
  for (const row of uniqueRows) {
    const result = (await dataSource.query(
      `
      INSERT INTO catalog_editions (
        title, authors, isbn_13, isbn_10, cover_image_url, page_count,
        series_name, publication_year, catalog_genre, data_source, external_provider_id
      )
      SELECT
        $1::text,
        $2::text,
        $3::varchar(13),
        $4::varchar(10),
        $5::text,
        $6::integer,
        $7::varchar(255),
        $8::smallint,
        $9::varchar(255),
        $10::varchar(32),
        $11::varchar(128)
      WHERE NOT EXISTS (
        SELECT 1 FROM catalog_editions c
        WHERE (
          c.data_source = $10::text
          AND c.external_provider_id = $11::text
        )
        OR (
          $3::text IS NOT NULL
          AND c.isbn_13 = $3::text
        )
      )
      RETURNING id
      `,
      [
        row.title,
        row.authors,
        row.isbn_13,
        row.isbn_10,
        row.cover_image_url,
        row.page_count,
        row.series_name,
        row.publication_year,
        row.catalog_genre,
        row.data_source,
        row.external_provider_id,
      ],
    )) as unknown[];
    inserted += result.length;
  }

  return inserted;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  console.log('Catalog seed import');
  console.log(`  file: ${options.file}`);
  console.log(`  force: ${options.force}`);

  await dataSource.initialize();
  try {
    await ensureSeedRunsTable();

    if (!options.force && (await hasPriorSeedRun())) {
      console.log(
        'A previous catalog seed run is already recorded. Use --force to import again (still idempotent).',
      );
      return;
    }

    let rowsRead = 0;
    let rowsInserted = 0;
    let batch: SeedRow[] = [];
    const seenProviders = new Set<string>();
    const seenIsbns = new Set<string>();

    for await (const row of readSeedRows(options.file)) {
      rowsRead += 1;
      const providerKey = `${row.data_source}:${row.external_provider_id}`;
      if (seenProviders.has(providerKey)) {
        continue;
      }
      if (row.isbn_13 && seenIsbns.has(row.isbn_13)) {
        continue;
      }
      seenProviders.add(providerKey);
      if (row.isbn_13) {
        seenIsbns.add(row.isbn_13);
      }
      batch.push(row);
      if (batch.length >= options.batchSize) {
        rowsInserted += await insertBatch(batch);
        batch = [];
        if (rowsRead % 5_000 === 0) {
          console.log(`  …${rowsRead.toLocaleString()} rows processed`);
        }
      }
    }

    if (batch.length > 0) {
      rowsInserted += await insertBatch(batch);
    }

    const rowsSkipped = rowsRead - rowsInserted;

    await dataSource.query(
      `
      INSERT INTO catalog_seed_runs (source_file, rows_read, rows_inserted, rows_skipped)
      VALUES ($1, $2, $3, $4)
      `,
      [options.file, rowsRead, rowsInserted, rowsSkipped],
    );

    const total = (
      (await dataSource.query(
        `SELECT COUNT(*)::int AS c FROM catalog_editions`,
      )) as Array<{ c: number }>
    )[0]?.c;

    console.log(`Done.`);
    console.log(`  rows read:      ${rowsRead.toLocaleString()}`);
    console.log(`  rows inserted:  ${rowsInserted.toLocaleString()}`);
    console.log(`  rows skipped:   ${rowsSkipped.toLocaleString()}`);
    console.log(`  catalog total:  ${Number(total).toLocaleString()}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
