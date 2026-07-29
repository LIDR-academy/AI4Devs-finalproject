import { isHalfStepRating } from '../validators/half-step-rating.validator';

describe('half-step-rating.validator', () => {
  it('accepts half-step values from 0.5 to 5', () => {
    for (let value = 0.5; value <= 5; value += 0.5) {
      expect(isHalfStepRating(value)).toBe(true);
    }
  });

  it('rejects integers outside the allowed range', () => {
    expect(isHalfStepRating(0)).toBe(false);
    expect(isHalfStepRating(6)).toBe(false);
  });

  it('rejects non-half-step decimals', () => {
    expect(isHalfStepRating(3.3)).toBe(false);
    expect(isHalfStepRating(4.25)).toBe(false);
  });

  it('rejects non-numbers', () => {
    expect(isHalfStepRating('3.5')).toBe(false);
    expect(isHalfStepRating(null)).toBe(false);
  });
});
