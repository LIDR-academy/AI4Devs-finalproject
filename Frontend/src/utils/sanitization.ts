/**
 * Security utilities for input sanitization and XSS prevention.
 * Follows OWASP guidelines for client-side security.
 */

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Removes potentially dangerous HTML tags and attributes.
 */
export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Create a temporary div to parse HTML
  const temp = document.createElement('div');
  temp.textContent = input;
  return temp.innerHTML;
}

/**
 * Sanitizes plain text input by escaping HTML characters.
 * Use this for user input that should be displayed as plain text.
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates and sanitizes email addresses.
 * Returns null if invalid, sanitized email if valid.
 */
export function sanitizeEmail(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = input.trim().toLowerCase();
  
  if (!emailRegex.test(trimmed)) {
    return null;
  }

  // Additional length check
  if (trimmed.length > 254) {
    return null;
  }

  return trimmed;
}

/**
 * Validates and sanitizes URLs.
 * Returns null if invalid, sanitized URL if valid.
 */
export function sanitizeUrl(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  try {
    const url = new URL(input);
    
    // Only allow http and https protocols
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitizes coordinates (latitude/longitude).
 * Returns null if invalid, sanitized coordinates if valid.
 */
export function sanitizeCoordinates(lat: number, lng: number): { lat: number; lng: number } | null {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  // Validate coordinate ranges
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  // Check for NaN or Infinity
  if (!isFinite(lat) || !isFinite(lng)) {
    return null;
  }

  return { lat, lng };
}

/**
 * Sanitizes numeric input with range validation.
 */
export function sanitizeNumber(
  input: string | number, 
  min: number = Number.MIN_SAFE_INTEGER, 
  max: number = Number.MAX_SAFE_INTEGER
): number | null {
  const num = typeof input === 'string' ? parseFloat(input) : input;
  
  if (typeof num !== 'number' || !isFinite(num)) {
    return null;
  }

  if (num < min || num > max) {
    return null;
  }

  return num;
}

/**
 * Sanitizes string input with length validation.
 */
export function sanitizeString(
  input: string, 
  maxLength: number = 1000,
  allowEmpty: boolean = false
): string | null {
  if (typeof input !== 'string') {
    return allowEmpty ? '' : null;
  }

  const trimmed = input.trim();
  
  if (!allowEmpty && trimmed.length === 0) {
    return null;
  }

  if (trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitizes UUID strings.
 */
export function sanitizeUuid(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const trimmed = input.trim().toLowerCase();
  
  if (!uuidRegex.test(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Sanitizes date strings (ISO 8601 format).
 */
export function sanitizeDate(input: string): string | null {
  if (!input || typeof input !== 'string') {
    return null;
  }

  try {
    const date = new Date(input);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return null;
    }

    // Return ISO string
    return date.toISOString();
  } catch {
    return null;
  }
}

/**
 * Sanitizes search parameters to prevent injection attacks.
 */
export function sanitizeSearchParams(params: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof key === 'string' && typeof value === 'string') {
      const sanitizedKey = sanitizeString(key, 100);
      const sanitizedValue = sanitizeString(value, 500);
      
      if (sanitizedKey && sanitizedValue) {
        sanitized[sanitizedKey] = sanitizedValue;
      }
    }
  }
  
  return sanitized;
}
