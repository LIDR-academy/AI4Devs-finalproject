import type { MultipleChoiceSlide } from '@helsoft/types';
import {
  hasCorrectOption,
  optionAccessibilityLabel,
  optionMarkerAt,
  optionState,
} from './multiple-choice.helpers';

const slide: MultipleChoiceSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'What is the capital of France?',
  position: 0,
  kind: 'activity',
  activityType: 'multiple-choice',
  options: [
    { id: 'opt-a', label: 'Paris' },
    { id: 'opt-b', label: 'Berlin' },
  ],
  correctOptionId: 'opt-a',
};

describe('hasCorrectOption', () => {
  it('returns true when correctOptionId is among options', () => {
    expect(hasCorrectOption(slide)).toBe(true);
  });

  it('returns false when correctOptionId is missing', () => {
    expect(hasCorrectOption({ ...slide, correctOptionId: 'missing' })).toBe(false);
  });

  it('returns false when options are empty', () => {
    expect(hasCorrectOption({ ...slide, options: [] })).toBe(false);
  });
});

describe('optionState', () => {
  it('returns default when nothing selected', () => {
    expect(optionState('opt-a', 'opt-a', null)).toBe('default');
    expect(optionState('opt-a', 'opt-a', undefined)).toBe('default');
  });

  it('returns selected for the pending choice before submit', () => {
    expect(optionState('opt-a', 'opt-a', 'opt-a', false)).toBe('selected');
    expect(optionState('opt-b', 'opt-a', 'opt-a', false)).toBe('default');
  });

  it('returns correct for the correct option once answered', () => {
    expect(optionState('opt-a', 'opt-a', 'opt-b', true)).toBe('correct');
    expect(optionState('opt-a', 'opt-a', 'opt-a', true)).toBe('correct');
  });

  it('returns incorrect for the selected wrong option once answered', () => {
    expect(optionState('opt-b', 'opt-a', 'opt-b', true)).toBe('incorrect');
  });

  it('returns default for unselected non-correct options once answered', () => {
    expect(optionState('opt-c', 'opt-a', 'opt-b', true)).toBe('default');
  });
});

describe('optionAccessibilityLabel', () => {
  it('appends correct label when state is correct', () => {
    expect(optionAccessibilityLabel('A', 'Paris', 'correct', 'Right', 'Wrong')).toBe(
      'A Paris, Right',
    );
  });

  it('appends incorrect label when state is incorrect', () => {
    expect(optionAccessibilityLabel('B', 'Berlin', 'incorrect', 'Right', 'Wrong')).toBe(
      'B Berlin, Wrong',
    );
  });

  it('returns undefined for default and selected states', () => {
    expect(optionAccessibilityLabel('A', 'Paris', 'default', 'Right', 'Wrong')).toBeUndefined();
    expect(optionAccessibilityLabel('A', 'Paris', 'selected', 'Right', 'Wrong')).toBeUndefined();
  });
});

describe('optionMarkerAt', () => {
  it('returns A/B for the first two indices', () => {
    expect(optionMarkerAt(0)).toBe('A');
    expect(optionMarkerAt(1)).toBe('B');
  });
});
