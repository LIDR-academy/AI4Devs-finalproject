import { getStepStatus } from './generation-progress.helpers';

describe('getStepStatus', () => {
  it('marks every index before currentIndex as done', () => {
    expect(getStepStatus(0, 2)).toBe('done');
    expect(getStepStatus(1, 2)).toBe('done');
  });

  it('marks the index equal to currentIndex as current', () => {
    expect(getStepStatus(2, 2)).toBe('current');
  });

  it('marks every index after currentIndex as upcoming', () => {
    expect(getStepStatus(2, 0)).toBe('upcoming');
  });
});
