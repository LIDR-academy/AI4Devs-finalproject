/**
 * Utilidades para formatear moneda
 */

export interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Formatea un número como moneda
 * @param amount - Cantidad a formatear
 * @param options - Opciones de formato
 * @returns String formateado como moneda
 */
export function formatCurrency(
  amount: number | string,
  options: CurrencyOptions = {}
): string {
  const {
    currency = 'MXN',
    locale = 'es-MX',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2
  } = options;

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '$0';
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(numericAmount);
}

/**
 * Formatea un número con separadores de miles
 * @param amount - Cantidad a formatear
 * @param locale - Locale para el formato
 * @returns String formateado con separadores
 */
export function formatNumber(
  amount: number | string,
  locale: string = 'es-MX'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '0';
  }

  return new Intl.NumberFormat(locale).format(numericAmount);
}

/**
 * Convierte un string de moneda a número
 * @param currencyString - String de moneda (ej: "$1,234.56")
 * @returns Número extraído
 */
export function parseCurrency(currencyString: string): number {
  if (!currencyString) return 0;
  
  // Remover símbolos de moneda y espacios
  const cleanString = currencyString
    .replace(/[^\d.,]/g, '')
    .replace(',', '');
  
  return parseFloat(cleanString) || 0;
}

/**
 * Formatea precio por metro cuadrado
 * @param price - Precio total
 * @param sqMeters - Metros cuadrados
 * @param options - Opciones de formato
 * @returns String formateado
 */
export function formatPricePerSqm(
  price: number | string,
  sqMeters: number | string,
  options: CurrencyOptions = {}
): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numericSqm = typeof sqMeters === 'string' ? parseFloat(sqMeters) : sqMeters;
  
  if (isNaN(numericPrice) || isNaN(numericSqm) || numericSqm === 0) {
    return 'N/A';
  }
  
  const pricePerSqm = numericPrice / numericSqm;
  return formatCurrency(pricePerSqm, options);
}

/**
 * Formatea rango de precios
 * @param minPrice - Precio mínimo
 * @param maxPrice - Precio máximo
 * @param options - Opciones de formato
 * @returns String formateado del rango
 */
export function formatPriceRange(
  minPrice: number | string,
  maxPrice: number | string,
  options: CurrencyOptions = {}
): string {
  const numericMin = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice;
  const numericMax = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice;
  
  if (isNaN(numericMin) && isNaN(numericMax)) {
    return 'N/A';
  }
  
  if (isNaN(numericMin)) {
    return `Hasta ${formatCurrency(numericMax, options)}`;
  }
  
  if (isNaN(numericMax)) {
    return `Desde ${formatCurrency(numericMin, options)}`;
  }
  
  if (numericMin === numericMax) {
    return formatCurrency(numericMin, options);
  }
  
  return `${formatCurrency(numericMin, options)} - ${formatCurrency(numericMax, options)}`;
}

/**
 * Formatea moneda para input (sin símbolo de moneda)
 * @param amount - Cantidad a formatear
 * @param locale - Locale para el formato
 * @returns String formateado para input
 */
export function formatCurrencyForInput(
  amount: number | string,
  locale: string = 'es-MX'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return '';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(numericAmount);
}

/**
 * Máscara para input de moneda
 * @param value - Valor del input
 * @returns Valor con máscara aplicada
 */
export function currencyMask(value: string): string {
  if (!value) return '';
  
  // Remover todo excepto números y punto decimal
  const cleanValue = value.replace(/[^\d.]/g, '');
  
  // Evitar múltiples puntos decimales
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limitar a 2 decimales
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return cleanValue;
}

/**
 * Convierte input de moneda a número
 * @param inputValue - Valor del input
 * @returns Número extraído
 */
export function currencyInputToNumber(inputValue: string): number {
  if (!inputValue) return 0;
  
  const cleanValue = inputValue.replace(/[^\d.]/g, '');
  return parseFloat(cleanValue) || 0;
}
