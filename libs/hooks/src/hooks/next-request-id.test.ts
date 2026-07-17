import { nextRequestId } from './next-request-id';

describe('nextRequestId', () => {
  // Mutation — must increment (not decrement) so later requests outrank earlier ones.
  it('returns current + 1', () => {
    expect(nextRequestId(0)).toBe(1);
    expect(nextRequestId(1)).toBe(2);
    expect(nextRequestId(41)).toBe(42);
  });
});
