import type { VehicleVisit } from '@/features/history/types/history.types';
import { formatMileage } from './formatMileage';

/**
 * Latest non-null mileage recorded for the vehicle, optionally excluding
 * the current work order (when editing that visit).
 */
export function getPreviousVisitMileage(
  visits: VehicleVisit[],
  excludeWorkOrderId?: string,
): number | null {
  const candidates = visits
    .filter(
      (visit) =>
        visit.mileage !== null &&
        visit.mileage !== undefined &&
        visit.workOrderId !== excludeWorkOrderId,
    )
    .sort(
      (left, right) =>
        new Date(right.checkedInAt).getTime() -
        new Date(left.checkedInAt).getTime(),
    );

  return candidates[0]?.mileage ?? null;
}

/**
 * Reference odometer to warn against: max of previous visit mileage and the
 * value currently stored on this work order (when editing).
 */
export function resolveMileageBaseline(
  previousVisitMileage: number | null,
  currentMileage: number | null | undefined,
): number | null {
  const values = [previousVisitMileage, currentMileage ?? null].filter(
    (value): value is number => value !== null && value !== undefined,
  );

  if (values.length === 0) {
    return null;
  }

  return Math.max(...values);
}

export function isMileageDecrease(
  newMileage: number | null | undefined,
  baseline: number | null,
): boolean {
  if (newMileage === null || newMileage === undefined || baseline === null) {
    return false;
  }

  return newMileage < baseline;
}

export function lowerMileageConfirmMessage(
  newMileage: number,
  baseline: number,
): string {
  return `El kilometraje ${formatMileage(newMileage)} es menor que el registrado anteriormente (${formatMileage(baseline)}). ¿Seguro que quieres guardar un valor menor?`;
}
