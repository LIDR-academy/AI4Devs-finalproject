export const GOODREADS_CSV_MAX_BYTES = 10 * 1024 * 1024;

export type GoodreadsFileValidationResult =
  | { valid: true }
  | { valid: false; message: string };

export function validateGoodreadsCsvFile(
  file: File | null,
): GoodreadsFileValidationResult {
  if (!file) {
    return { valid: false, message: 'Selecciona un archivo CSV de Goodreads.' };
  }

  const name = file.name.toLowerCase();
  const isCsv =
    name.endsWith('.csv') ||
    file.type === 'text/csv' ||
    file.type === 'application/vnd.ms-excel';

  if (!isCsv) {
    return {
      valid: false,
      message: 'El archivo debe ser un CSV exportado desde Goodreads.',
    };
  }

  if (file.size > GOODREADS_CSV_MAX_BYTES) {
    return {
      valid: false,
      message: 'El archivo supera el límite de 10 MB.',
    };
  }

  if (file.size === 0) {
    return { valid: false, message: 'El archivo está vacío.' };
  }

  return { valid: true };
}
