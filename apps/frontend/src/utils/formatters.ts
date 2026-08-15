/**
 * Formateador inteligente de cantidades para la interfaz de cocina.
 * Evita ambigüedades como "12.000 UNITS" convirtiéndolo en "12 Ud.",
 * y formateando números decimales sin ceros innecesarios a la derecha.
 */

export function formatQuantity(quantity: number | string, unitOfMeasure?: string): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  if (isNaN(num)) return '0';

  const isDiscrete = unitOfMeasure
    ? ['UNITS', 'UNIDADES', 'PZA', 'PACK', 'UD', 'UDS'].includes(unitOfMeasure.toUpperCase())
    : false;

  if (isDiscrete && Number.isInteger(num)) {
    return num.toLocaleString('es-ES');
  }

  return num.toLocaleString('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: isDiscrete ? 2 : 3,
  });
}

export function formatUnitLabel(unitOfMeasure: string): string {
  if (!unitOfMeasure) return '';
  const upper = unitOfMeasure.toUpperCase();
  if (upper === 'UNITS' || upper === 'UNIDADES') return 'Ud.';
  return unitOfMeasure;
}
