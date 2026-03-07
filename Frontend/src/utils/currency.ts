/**
 * Currency utility functions
 * Handles formatting and parsing of currency amounts (COP and USD)
 */

import type { TripCurrency } from '@/types/trip.types';

/**
 * Formats a number as currency (COP or USD)
 * COP format: "$ 25.000" (no decimals, thousands separator with dot)
 * USD format: "$ 25,000.00" (with decimals, thousands separator with comma)
 * @param amount - Amount to format
 * @param currency - Currency type (COP or USD). Defaults to COP for backward compatibility
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: TripCurrency = 'COP'): string {
  if (isNaN(amount) || amount < 0) {
    return `${getCurrencySymbol(currency)} 0`;
  }

  // Check if amount is finite and within safe integer range after rounding
  if (!Number.isFinite(amount) || Math.round(amount) > Number.MAX_SAFE_INTEGER) {
    return `${getCurrencySymbol(currency)} 0`;
  }

  if (currency === 'USD') {
    // USD: format with 2 decimal places, comma as thousands separator
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `$ ${formatted}`;
  }

  // COP: format without decimals, dot as thousands separator
  const integer_amount = Math.round(amount);
  const formatted = integer_amount.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `$ ${formatted}`;
}

/**
 * Gets the currency symbol for a given currency type
 * @param currency - Currency type (COP or USD)
 * @returns Currency symbol string
 */
export function getCurrencySymbol(currency: TripCurrency = 'COP'): string {
  return '$';
}

/**
 * Parses a currency string to a number
 * Removes currency symbols, dots (thousands separators), and commas (decimal separators)
 * @param value - Currency string to parse (e.g., "$ 25.000" or "25000")
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrency(value: string): number {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remove currency symbols, spaces, and dots (thousands separators)
  // Keep only digits
  const cleaned = value.replace(/[^\d]/g, '');

  if (cleaned === '') {
    return 0;
  }

  const parsed = parseInt(cleaned, 10);

  return isNaN(parsed) ? 0 : parsed;
}
