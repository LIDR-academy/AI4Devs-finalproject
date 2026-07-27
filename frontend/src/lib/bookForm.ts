import type {
  Book,
  CreateBookPayload,
  PatchBookPayload,
  PatchReadingRecordPayload,
  ReadingStatus,
} from '../api/types';

export type BookFormState = {
  title: string;
  authors: string;
  cover_image_url: string;
  genre: string;
  notes: string;
  audience_id: string | null;
  page_count: string;
  publication_year: string;
  series_name: string;
  status: ReadingStatus;
  started_on: string;
  finished_on: string;
  format_id: string | null;
  rating: number | null;
};

export type BookFormFieldErrors = Partial<Record<keyof BookFormState, string>>;

export function emptyBookFormState(): BookFormState {
  return {
    title: '',
    authors: '',
    cover_image_url: '',
    genre: '',
    notes: '',
    audience_id: null,
    page_count: '',
    publication_year: '',
    series_name: '',
    status: 'pendiente',
    started_on: '',
    finished_on: '',
    format_id: null,
    rating: null,
  };
}

export function bookToFormState(book: Book): BookFormState {
  return {
    title: book.title,
    authors: book.authors,
    cover_image_url: book.cover_image_url ?? '',
    genre: book.genre ?? '',
    notes: book.notes ?? '',
    audience_id: book.audience_id ?? null,
    page_count: book.page_count != null ? String(book.page_count) : '',
    publication_year:
      book.publication_year != null ? String(book.publication_year) : '',
    series_name: book.series_name ?? '',
    status: book.reading_status ?? 'pendiente',
    started_on: book.started_on ?? '',
    finished_on: book.finished_on ?? '',
    format_id: book.format_id ?? null,
    rating: book.rating ?? null,
  };
}

export function showStartDateField(status: ReadingStatus): boolean {
  return status === 'leyendo' || status === 'leido' || status === 'dnf';
}

export function showFinishDateField(status: ReadingStatus): boolean {
  return status === 'leido';
}

export function showRatingField(status: ReadingStatus): boolean {
  return status === 'leido';
}

function parseOptionalInt(value: string): number | null | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function validateBookForm(state: BookFormState): BookFormFieldErrors {
  const errors: BookFormFieldErrors = {};

  if (!state.title.trim()) {
    errors.title = 'El título es obligatorio';
  }
  if (!state.authors.trim()) {
    errors.authors = 'La autora es obligatoria';
  }

  if (state.cover_image_url.trim() && !isValidUrl(state.cover_image_url.trim())) {
    errors.cover_image_url = 'Introduce una URL válida (http o https)';
  }

  const pageCount = parseOptionalInt(state.page_count);
  if (pageCount === undefined) {
    errors.page_count = 'Introduce un número entero';
  } else if (pageCount != null && pageCount < 0) {
    errors.page_count = 'Las páginas no pueden ser negativas';
  }

  const pubYear = parseOptionalInt(state.publication_year);
  if (pubYear === undefined) {
    errors.publication_year = 'Introduce un año válido';
  } else if (
    pubYear != null &&
    (pubYear < 1000 || pubYear > 2100)
  ) {
    errors.publication_year = 'El año debe estar entre 1000 y 2100';
  }

  if (
    showStartDateField(state.status) &&
    showFinishDateField(state.status) &&
    state.started_on &&
    state.finished_on &&
    state.finished_on < state.started_on
  ) {
    errors.finished_on = 'La fecha de fin no puede ser anterior al inicio';
  }

  return errors;
}

export function buildCreateBookPayload(state: BookFormState): CreateBookPayload {
  const pageCount = parseOptionalInt(state.page_count);
  const pubYear = parseOptionalInt(state.publication_year);

  return {
    title: state.title.trim(),
    authors: state.authors.trim(),
    data_source: 'manual',
    cover_image_url: state.cover_image_url.trim() || null,
    genre: state.genre.trim() || null,
    notes: state.notes.trim() || null,
    audience_id: state.audience_id,
    page_count: pageCount ?? null,
    publication_year: pubYear ?? null,
    series_name: state.series_name.trim() || null,
  };
}

export function buildPatchBookPayload(state: BookFormState): PatchBookPayload {
  const pageCount = parseOptionalInt(state.page_count);
  const pubYear = parseOptionalInt(state.publication_year);

  return {
    title: state.title.trim(),
    authors: state.authors.trim(),
    cover_image_url: state.cover_image_url.trim() || null,
    genre: state.genre.trim() || null,
    notes: state.notes.trim() || null,
    audience_id: state.audience_id,
    page_count: pageCount ?? null,
    publication_year: pubYear ?? null,
    series_name: state.series_name.trim() || null,
  };
}

export function buildReadingPatchPayload(
  state: BookFormState,
): PatchReadingRecordPayload {
  const payload: PatchReadingRecordPayload = { status: state.status };

  if (showStartDateField(state.status) && state.started_on) {
    payload.started_on = state.started_on;
  }
  if (showFinishDateField(state.status) && state.finished_on) {
    payload.finished_on = state.finished_on;
  }
  payload.format_id = state.format_id ?? null;
  if (showRatingField(state.status) && state.rating != null) {
    payload.rating = state.rating;
  }

  return payload;
}

export function readingFieldsChanged(
  book: Book,
  state: BookFormState,
): boolean {
  const status = book.reading_status ?? 'pendiente';
  if (state.status !== status) return true;
  if ((book.started_on ?? '') !== state.started_on) return true;
  if ((book.finished_on ?? '') !== state.finished_on) return true;
  if ((book.format_id ?? null) !== state.format_id) return true;
  if ((book.rating ?? null) !== state.rating) return true;
  return false;
}
