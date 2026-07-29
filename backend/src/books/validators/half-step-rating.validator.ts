import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

export const MIN_RATING = 0.5;
export const MAX_RATING = 5;
export const RATING_STEP = 0.5;

export function isHalfStepRating(value: unknown): value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return false;
  }
  if (value < MIN_RATING || value > MAX_RATING) {
    return false;
  }
  const steps = Math.round((value - MIN_RATING) / RATING_STEP);
  const normalized = MIN_RATING + steps * RATING_STEP;
  return Math.abs(value - normalized) < 1e-9;
}

@ValidatorConstraint({ name: 'halfStepRating', async: false })
export class HalfStepRatingConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isHalfStepRating(value);
  }

  defaultMessage(): string {
    return 'rating must be between 0.5 and 5 in steps of 0.5';
  }
}

export function IsHalfStepRating(validationOptions?: ValidationOptions) {
  return function decorate(object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: HalfStepRatingConstraint,
    });
  };
}

export function normalizeRating(
  value: string | number | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(parsed * 10) / 10;
}
