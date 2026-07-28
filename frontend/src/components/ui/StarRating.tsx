import { useCallback, useId, type KeyboardEvent } from 'react';
import {
  formatRatingLabel,
  MAX_RATING,
  MIN_RATING,
  RATING_STEP,
  starFillState,
  stepHalfStepRating,
} from '../../lib/rating';
import './StarRating.css';

export interface StarRatingProps {
  value: number | null | undefined;
  onChange: (rating: number) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export function StarRating({
  value,
  onChange,
  disabled,
  'aria-label': ariaLabel = 'Puntuación',
}: StarRatingProps) {
  const labelId = useId();
  const current = value ?? 0;
  const valueLabel = formatRatingLabel(value);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) {
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        onChange(stepHalfStepRating(current, RATING_STEP));
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        onChange(stepHalfStepRating(current, -RATING_STEP));
      } else if (event.key === 'Home') {
        event.preventDefault();
        onChange(MIN_RATING);
      } else if (event.key === 'End') {
        event.preventDefault();
        onChange(MAX_RATING);
      }
    },
    [current, disabled, onChange],
  );

  return (
    <div
      className="ui-star-rating"
      role="group"
      aria-labelledby={labelId}
    >
      <span id={labelId} className="ui-star-rating__sr-only">
        {ariaLabel}: {valueLabel}
      </span>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = starFillState(star, current);
        const halfValue = star - RATING_STEP;
        return (
          <span key={star} className="ui-star-rating__star-slot">
            <span
              className={`ui-star-rating__glyph ui-star-rating__glyph--${fill}`}
              aria-hidden="true"
            >
              ★
            </span>
            <button
              type="button"
              className="ui-star-rating__half ui-star-rating__half--left"
              disabled={disabled}
              aria-label={formatRatingLabel(halfValue)}
              aria-pressed={current === halfValue}
              onClick={() => onChange(halfValue)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className="ui-star-rating__half ui-star-rating__half--right"
              disabled={disabled}
              aria-label={formatRatingLabel(star)}
              aria-pressed={current === star}
              onClick={() => onChange(star)}
              onKeyDown={handleKeyDown}
            />
          </span>
        );
      })}
    </div>
  );
}
