export interface DateRangeInput {
  startDate: string;
  endDate: string;
}

/**
 * Validación de rango de fechas compartida por los casos de uso de `reports`
 * (`GetWasteReportUseCase`, `GetRotationMetricsUseCase`, `GetPreparationWasteReportUseCase`):
 * ISO 8601 válido en ambos extremos y `startDate <= endDate`. La frontera Zod del
 * controlador ya rechaza lo mismo como `400`; esta función cubre a cualquier otro
 * consumidor del caso de uso (igual criterio que `DiscardReasonRequiredException`).
 */
export function parseDateRange(input: DateRangeInput): { start: Date; end: Date } {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Las fechas deben ser cadenas ISO 8601 validas.');
  }

  if (start > end) {
    throw new Error('La fecha de inicio (startDate) no puede ser posterior a la fecha de fin (endDate).');
  }

  return { start, end };
}
