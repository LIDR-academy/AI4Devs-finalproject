import { ApiRequestError } from './errors';
import type {
  AnnualGoalResponse,
  ApiError,
  Audience,
  AudienceAffectedBooksResponse,
  Book,
  BookCoverSearchResponse,
  BookCreatedResponse,
  CatalogEdition,
  CatalogSearchResponse,
  CreateBookPayload,
  EditionCoversResponse,
  Format,
  FormatAffectedReadingsResponse,
  Genre,
  GenreAffectedBooksResponse,
  GoodreadsImportResponse,
  ImportJobAcceptedResponse,
  ImportJobStatusResponse,
  MonthlyStatsResponse,
  YearlyStatsResponse,
  MonthlyTbrResponse,
  PatchBookPayload,
  PatchReadingRecordPayload,
  ReadingRecordPatchedResponse,
  TbrEntry,
} from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/v1';

let onUnauthorized: (() => void) | null = null;

/** Clears session and redirects when the API returns 401. Wired from AuthProvider. */
export function setOnUnauthorized(handler: (() => void) | null) {
  onUnauthorized = handler;
}

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiError;
    if (res.status === 401) {
      onUnauthorized?.();
    }
    throw new ApiRequestError(res.status, body);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function devLogin(email: string) {
  return request<{ access_token: string; user: { id: string; email: string } }>(
    '/auth/dev-login',
    { method: 'POST', body: JSON.stringify({ email }) },
  );
}

export async function listAudiences(): Promise<Audience[]> {
  return request('/audiences');
}

export async function createAudience(name: string): Promise<Audience> {
  return request('/audiences', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function getAudienceAffectedBookCount(
  audienceId: string,
): Promise<AudienceAffectedBooksResponse> {
  return request(`/audiences/${audienceId}/affected-books`);
}

export async function deleteAudience(audienceId: string): Promise<void> {
  return request(`/audiences/${audienceId}`, { method: 'DELETE' });
}

export async function listFormats(): Promise<Format[]> {
  return request('/formats');
}

export async function createFormat(name: string): Promise<Format> {
  return request('/formats', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function deleteFormat(formatId: string): Promise<void> {
  return request(`/formats/${formatId}`, { method: 'DELETE' });
}

export async function getFormatAffectedReadingCount(
  formatId: string,
): Promise<FormatAffectedReadingsResponse> {
  return request(`/formats/${formatId}/affected-readings`);
}

export async function listGenres(): Promise<Genre[]> {
  return request('/genres');
}

export async function createGenre(name: string): Promise<Genre> {
  return request('/genres', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function getGenreAffectedBookCount(
  genreId: string,
): Promise<GenreAffectedBooksResponse> {
  return request(`/genres/${genreId}/affected-books`);
}

export async function deleteGenre(genreId: string): Promise<void> {
  return request(`/genres/${genreId}`, { method: 'DELETE' });
}

export async function searchCatalog(
  q: string,
  limit = 20,
): Promise<CatalogSearchResponse> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return request(`/books/catalog/search?${params}`);
}

export async function fetchEditionCovers(
  dataSource: CatalogEdition['data_source'],
  externalProviderId: string,
  hintCoverUrl?: string | null,
): Promise<EditionCoversResponse> {
  const params = new URLSearchParams({
    data_source: dataSource,
    external_provider_id: externalProviderId,
  });
  if (hintCoverUrl) {
    params.set('hint_cover_url', hintCoverUrl);
  }
  return request(`/books/catalog/covers?${params}`);
}

export async function searchBookCovers(
  bookId: string,
  q?: string,
): Promise<BookCoverSearchResponse> {
  const params = new URLSearchParams();
  const trimmed = q?.trim();
  if (trimmed && trimmed.length >= 2) {
    params.set('q', trimmed);
  }
  const query = params.toString();
  return request(`/books/${bookId}/cover-search${query ? `?${query}` : ''}`);
}

export async function createBook(
  payload: CreateBookPayload,
): Promise<BookCreatedResponse> {
  return request('/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listBooks(): Promise<Book[]> {
  return request('/books');
}

export async function patchBook(
  bookId: string,
  body: PatchBookPayload,
): Promise<Book> {
  return request(`/books/${bookId}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function patchReadingRecord(
  bookId: string,
  body: PatchReadingRecordPayload,
): Promise<ReadingRecordPatchedResponse> {
  return request(`/books/${bookId}/reading-record`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function getMonthlyTbr(
  year: number,
  month: number,
): Promise<MonthlyTbrResponse> {
  return request(`/tbr/${year}/${month}`);
}

export async function addTbrEntry(
  year: number,
  month: number,
  bookId: string,
): Promise<TbrEntry> {
  return request(`/tbr/${year}/${month}/entries`, {
    method: 'POST',
    body: JSON.stringify({ book_id: bookId }),
  });
}

export async function removeTbrEntry(
  year: number,
  month: number,
  entryId: string,
): Promise<void> {
  return request(`/tbr/${year}/${month}/entries/${entryId}`, {
    method: 'DELETE',
  });
}

export async function getAnnualGoal(year: number): Promise<AnnualGoalResponse> {
  return request(`/goals/${year}`);
}

export async function upsertAnnualGoal(
  year: number,
  targetBookCount: number,
): Promise<AnnualGoalResponse> {
  return request(`/goals/${year}`, {
    method: 'PUT',
    body: JSON.stringify({ target_book_count: targetBookCount }),
  });
}

export async function getMonthlyStats(
  year: number,
  month: number,
): Promise<MonthlyStatsResponse> {
  return request(`/stats/${year}/${month}`);
}

export async function getYearlyStats(year: number): Promise<YearlyStatsResponse> {
  const params = new URLSearchParams({
    period: 'year',
    year: String(year),
  });
  return request(`/stats?${params.toString()}`);
}

export async function getImportJob(
  jobId: string,
): Promise<ImportJobStatusResponse> {
  return request<ImportJobStatusResponse>(`/import/jobs/${jobId}`);
}

const IMPORT_JOB_POLL_MS = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function pollImportJobUntilComplete(
  jobId: string,
  onProgress?: (status: ImportJobStatusResponse) => void,
): Promise<GoodreadsImportResponse> {
  for (;;) {
    const status = await getImportJob(jobId);
    onProgress?.(status);

    if (status.status === 'completed') {
      if (!status.result?.meta) {
        throw new ApiRequestError(500, {
          statusCode: 500,
          message: 'Import job completed without a result payload',
        });
      }
      return status.result;
    }

    if (status.status === 'failed') {
      throw new ApiRequestError(500, {
        statusCode: 500,
        message: status.error_message ?? 'Import job failed',
      });
    }

    await sleep(IMPORT_JOB_POLL_MS);
  }
}

export interface ImportGoodreadsCsvOptions {
  onJobAccepted?: (jobId: string) => void;
  onProgress?: (status: ImportJobStatusResponse) => void;
}

export async function startGoodreadsImport(file: File): Promise<string> {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file, file.name);

  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/import/goodreads`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as ApiError;
    if (res.status === 401) {
      onUnauthorized?.();
    }
    throw new ApiRequestError(res.status, body);
  }

  if (res.status === 202) {
    const accepted = (await res.json()) as ImportJobAcceptedResponse;
    return accepted.job_id;
  }

  throw new ApiRequestError(500, {
    statusCode: 500,
    message: 'Expected async import job response',
  });
}

export async function importGoodreadsCsv(
  file: File,
  options?: ImportGoodreadsCsvOptions,
): Promise<GoodreadsImportResponse> {
  const jobId = await startGoodreadsImport(file);
  options?.onJobAccepted?.(jobId);
  return pollImportJobUntilComplete(jobId, options?.onProgress);
}

export function catalogEditionToCreatePayload(
  edition: CatalogEdition,
  coverUrl?: string | null,
  audienceId?: string | null,
  genreId?: string | null,
): CreateBookPayload {
  return {
    title: edition.title,
    authors: edition.authors,
    isbn_13: edition.isbn_13,
    isbn_10: edition.isbn_10,
    cover_image_url: coverUrl !== undefined ? coverUrl : edition.cover_image_url,
    page_count: edition.page_count,
    genre_id: genreId ?? null,
    data_source: edition.data_source,
    external_provider_id: edition.external_provider_id,
    audience_id: audienceId ?? null,
  };
}
