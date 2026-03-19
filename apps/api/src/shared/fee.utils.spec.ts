import { calculateFee } from './fee.utils';

describe('calculateFee', () => {
  it('returns 5% for amount <= 10', () => {
    expect(calculateFee(10)).toEqual({ percentage: 5, amount: 0.5 });
    expect(calculateFee(5)).toEqual({ percentage: 5, amount: 0.25 });
  });

  it('returns 2.5% for amount >= 100', () => {
    expect(calculateFee(100)).toEqual({ percentage: 2.5, amount: 2.5 });
    expect(calculateFee(150)).toEqual({ percentage: 2.5, amount: 3.75 });
  });

  it('returns linear scale for 10 < amount < 100', () => {
    const { percentage, amount } = calculateFee(55);
    expect(percentage).toBeCloseTo(3.75, 2);
    expect(amount).toBeCloseTo(2.06, 2);
  });
});
