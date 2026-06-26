export function normalizeFullName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}

export function normalizeNationalId(raw: string): string {
  return raw.trim();
}

export function normalizeNationalIdForSearch(raw: string): string {
  return raw.trim().replace(/[\s-]/g, '');
}

export function normalizePhone(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }

  const digits = raw.replace(/\D/g, '');
  return digits.length > 0 ? digits : undefined;
}

export function normalizeEmail(raw?: string): string | undefined {
  if (!raw) {
    return undefined;
  }

  const normalized = raw.trim().toLowerCase();
  return normalized.length > 0 ? normalized : undefined;
}
