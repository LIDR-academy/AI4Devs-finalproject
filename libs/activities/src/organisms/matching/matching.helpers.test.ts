import { findPairForItem, itemAccessibilityLabel } from './matching.helpers';
import type { MatchingItemView, MatchingLabels, MatchingPairSelection } from './matching.types';

const labels: MatchingLabels = {
  submit: 'Submit',
  correct: 'All correct!',
  incorrect: 'Not quite',
  correctPair: 'correct',
  incorrectPair: 'incorrect',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
};

const pairs: MatchingPairSelection[] = [
  { leftId: 'l1', rightId: 'r1' },
  { leftId: 'l2', rightId: 'r2' },
];

const item: MatchingItemView = { id: 'l1', label: 'France' };

describe('findPairForItem', () => {
  it('returns the pair when itemId matches leftId', () => {
    expect(findPairForItem(pairs, 'l1')).toEqual({ leftId: 'l1', rightId: 'r1' });
  });

  it('returns the pair when itemId matches rightId', () => {
    expect(findPairForItem(pairs, 'r2')).toEqual({ leftId: 'l2', rightId: 'r2' });
  });

  it('returns undefined when itemId is not in any pair', () => {
    expect(findPairForItem(pairs, 'l9')).toBeUndefined();
  });

  it('returns undefined for an empty pairs list', () => {
    expect(findPairForItem([], 'l1')).toBeUndefined();
  });
});

describe('itemAccessibilityLabel', () => {
  it('appends correctPair when state is correct', () => {
    expect(itemAccessibilityLabel(item, 'correct', labels)).toBe(`France, ${labels.correctPair}`);
  });

  it('appends incorrectPair when state is incorrect', () => {
    expect(itemAccessibilityLabel(item, 'incorrect', labels)).toBe(
      `France, ${labels.incorrectPair}`,
    );
  });

  it.each([
    'pending',
    'paired',
    undefined,
  ] as const)('returns the bare label when state is %s', (state) => {
    expect(itemAccessibilityLabel(item, state, labels)).toBe('France');
  });
});
