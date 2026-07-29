export const MIN_RATING = 0.5;
export const MAX_RATING = 5;
export const RATING_STEP = 0.5;

export function isHalfStepRating(value: number): boolean {
  if (!Number.isFinite(value) || value < MIN_RATING || value > MAX_RATING) {
    return false;
  }
  const steps = Math.round((value - MIN_RATING) / RATING_STEP);
  const normalized = MIN_RATING + steps * RATING_STEP;
  return Math.abs(value - normalized) < 1e-9;
}

export function clampHalfStepRating(value: number): number {
  const steps = Math.round((value - MIN_RATING) / RATING_STEP);
  const clampedSteps = Math.min(
    Math.round((MAX_RATING - MIN_RATING) / RATING_STEP),
    Math.max(0, steps),
  );
  return MIN_RATING + clampedSteps * RATING_STEP;
}

export function stepHalfStepRating(
  value: number | null | undefined,
  delta: number,
): number {
  const base = value && value >= MIN_RATING ? value : 0;
  if (base === 0) {
    return delta > 0 ? MIN_RATING : MIN_RATING;
  }
  return clampHalfStepRating(base + delta);
}

export type StarFillState = 'empty' | 'half' | 'full';

export function starFillState(star: number, value: number): StarFillState {
  if (value >= star) {
    return 'full';
  }
  if (value >= star - RATING_STEP) {
    return 'half';
  }
  return 'empty';
}

import { APP_LOCALE } from './locale';

export function formatRatingLabel(value: number | null | undefined): string {
  if (value == null || value < MIN_RATING) {
    return 'Sin puntuación';
  }
  const hasHalf = !Number.isInteger(value);
  return `${value.toLocaleString(APP_LOCALE, {
    minimumFractionDigits: hasHalf ? 1 : 0,
    maximumFractionDigits: 1,
  })} de 5 estrellas`;
}

export function formatAverageRating(value: number | null | undefined): string {
  if (value == null) {
    return '—';
  }
  const hasHalf = Math.abs(value * 2 - Math.round(value * 2)) > 1e-9
    ? true
    : !Number.isInteger(value);
  return value.toLocaleString(APP_LOCALE, {
    minimumFractionDigits: hasHalf ? 1 : 0,
    maximumFractionDigits: 2,
  });
}
