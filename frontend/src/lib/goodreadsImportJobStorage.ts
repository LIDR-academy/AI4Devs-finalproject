const STORAGE_KEY = 'rap.goodreads_import_job_id';

export function getStoredImportJobId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeImportJobId(jobId: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, jobId);
  } catch {
    // Ignore quota or private-mode errors; polling still works in-session.
  }
}

export function clearStoredImportJobId(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore.
  }
}
