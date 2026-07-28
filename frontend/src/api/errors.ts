import type { ApiError } from './types';

export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: ApiError;

  constructor(status: number, body: ApiError) {
    super(body.message?.toString() ?? 'Error de la API');
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

const CODE_MESSAGES: Record<string, string> = {
  AUDIENCE_DUPLICATE: 'Ya existe un elemento con ese nombre.',
  AUDIENCE_NOT_FOUND: 'Público objetivo no encontrado.',
  BOOK_DUPLICATE: 'Este libro ya está en tu biblioteca.',
  COLUMN_COUNT_MISMATCH:
    'El CSV no tiene el número de columnas esperado. Comprueba que sea un export de Goodreads.',
  DUPLICATE_EXISTING: 'El libro ya existe en tu biblioteca.',
  DUPLICATE_IN_BATCH: 'Fila duplicada en el mismo archivo CSV.',
  ENRICHMENT_CATALOG_MISS:
    'El catálogo no devolvió metadatos para enriquecer el libro.',
  FINISHED_BEFORE_STARTED:
    'La fecha de fin no puede ser anterior a la de inicio.',
  FORMAT_DUPLICATE: 'Ya existe un formato con ese nombre.',
  FORMAT_NOT_FOUND: 'Formato no encontrado.',
  GENRE_DUPLICATE: 'Ya existe un género con ese nombre.',
  GENRE_NOT_FOUND: 'Género no encontrado.',
  MISSING_TITLE: 'Fila omitida porque el título está vacío.',
  TBR_BOOK_NOT_PENDING:
    'Solo se pueden añadir libros pendientes a la lista TBR.',
  TBR_ENTRY_DUPLICATE: 'Este libro ya está en esta lista TBR.',
  UNKNOWN_EXCLUSIVE_SHELF: 'Estantería exclusiva no reconocida en el CSV.',
};

export function messageFromApiError(status: number, body: ApiError): string {
  if (status === 401) {
    return 'Tu sesión ha expirado. Vuelve a iniciar sesión.';
  }
  if (body.code && CODE_MESSAGES[body.code]) {
    return CODE_MESSAGES[body.code];
  }
  if (status === 409 || body.code === 'BOOK_DUPLICATE') {
    return 'Este libro ya está en tu biblioteca.';
  }
  if (typeof body.message === 'string') {
    return body.message;
  }
  if (Array.isArray(body.message)) {
    return body.message.join(', ');
  }
  return 'Ha ocurrido un error. Inténtalo de nuevo.';
}

export function messageFromUnknownError(err: unknown): string {
  if (err instanceof ApiRequestError) {
    return messageFromApiError(err.status, err.body);
  }
  if (err && typeof err === 'object' && 'status' in err && 'body' in err) {
    const { status, body } = err as { status: number; body: ApiError };
    return messageFromApiError(status, body);
  }
  return 'Ha ocurrido un error. Inténtalo de nuevo.';
}
