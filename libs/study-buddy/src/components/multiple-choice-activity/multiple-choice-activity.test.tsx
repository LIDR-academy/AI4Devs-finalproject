jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

// Wraps the real MultipleChoice by default (every existing test below renders it for real); only
// the re-selection-guard test further down swaps in a fake implementation for one render.
jest.mock('@helsoft/activities', () => {
  const actual = jest.requireActual('@helsoft/activities');
  return { ...actual, MultipleChoice: jest.fn(actual.MultipleChoice) };
});

import type { MultipleChoiceSlide } from '@helsoft/types';
import { MultipleChoice, MultipleChoiceProps } from '@helsoft/activities';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { MultipleChoiceActivity } from './multiple-choice-activity';

const mockUseLocalization = useLocalization as jest.Mock;
const mockMultipleChoice = MultipleChoice as jest.Mock;
const actualMultipleChoice = jest.requireActual('@helsoft/activities').MultipleChoice;

// A fake MultipleChoice that never disables its options, regardless of `selectedOptionId` —
// simulating a presentational component whose own locking doesn't block a second `onSelectOption`
// call, so the wrapper's own re-selection guard is what's under test, in isolation.
const AlwaysEnabledMultipleChoice = ({ options, onSelectOption }: MultipleChoiceProps) => (
  <>
    {options.map((option) => (
      <Pressable key={option.id} accessibilityRole="button" onPress={() => onSelectOption(option.id)}>
        <Text>{option.label}</Text>
      </Pressable>
    ))}
  </>
);

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

describe('MultipleChoiceActivity', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue(localizationValue());
    mockMultipleChoice.mockImplementation(actualMultipleChoice);
  });

  // @s2 — selecting an option sets the answer and locks every option (they become disabled).
  it('locks every option once the learner selects one', async () => {
    await render(<MultipleChoiceActivity slide={slide} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[0]);
    });

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => expect(button.props.accessibilityState.disabled).toBe(true));
  });

  // @s6 — once answered, attempting to select a different option is a no-op: the original
  // answer is unchanged and onAnswered fires exactly once.
  it('ignores a second selection and calls onAnswered exactly once', async () => {
    const onAnswered = jest.fn();
    await render(<MultipleChoiceActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[1]);
    });
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[0]);
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(expect.objectContaining({ selectedOptionId: 'opt-b' }));
  });

  // Mutation-kill (Full-review Round 1 mutation survivor) — the test above never actually
  // exercises `handleSelect`'s own `if (selectedOptionId) return` guard: the real MultipleChoice
  // organism already disables every option once answered, so the second `fireEvent.press` in that
  // test is blocked by RN's Pressable itself before `onSelectOption` is ever called again — a
  // mutant that deletes the guard still passes that test. This test swaps in a fake MultipleChoice
  // whose options are never disabled, so a second `onSelectOption` call really reaches
  // `handleSelect`, proving the wrapper's own guard — not just the organism's UI locking — rejects
  // the re-selection.
  it('rejects a second onSelectOption call from the presentational component even when it is not itself locked', async () => {
    mockMultipleChoice.mockImplementation(AlwaysEnabledMultipleChoice);
    const onAnswered = jest.fn();
    await render(<MultipleChoiceActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[1]); // opt-b
    });
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[0]); // attempted re-selection: opt-a
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(expect.objectContaining({ selectedOptionId: 'opt-b' }));
  });

  // @s7 — slice integration test (wrapper → real grader → organism, nothing mocked): the
  // graded result is exposed as the answered state R7/R9 will consume, and the organism
  // reflects it (correct tile + correct banner) in the same render pass.
  it('exposes the graded answered state and renders the matching feedback, end to end', async () => {
    const onAnswered = jest.fn();
    await render(<MultipleChoiceActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[0]);
    });

    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-1',
      activityType: 'multiple-choice',
      selectedOptionId: 'opt-a',
      correctOptionId: 'opt-a',
      isCorrect: true,
    });
    expect(screen.getAllByText('check_circle')).toHaveLength(1);
  });

  // @s10 — the correct-answer banner is sourced from useLocalization()'s t(), not a hardcoded
  // string. localizationValue()'s t() returns the key itself, so the rendered text is the key.
  it('labels the correct-answer banner from useLocalization()', async () => {
    await render(<MultipleChoiceActivity slide={slide} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[0]);
    });

    expect(screen.getByText('activity.mcq.correct')).toBeTruthy();
  });

  // @s10 — documents the mismatch-branch generalization (same shape as the Slice-1 grader
  // cycles): the incorrect banner and the explanation heading are keyed the same way, so once
  // the labels object above is built from t(), both render correctly without further changes.
  it('labels the incorrect-answer banner and the explanation heading from useLocalization()', async () => {
    const slideWithExplanation: MultipleChoiceSlide = {
      ...slide,
      explanation: 'Paris has been the capital since the 12th century.',
    };
    await render(<MultipleChoiceActivity slide={slideWithExplanation} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[1]);
    });

    expect(screen.getByText('activity.mcq.incorrect')).toBeTruthy();
    expect(screen.getByText('activity.mcq.explanation')).toBeTruthy();
  });

  // @s10 — the Empty-state unavailable notice is also sourced from useLocalization()'s t().
  it('labels the unavailable notice from useLocalization()', async () => {
    const slideWithNoOptions: MultipleChoiceSlide = { ...slide, options: [] };
    await render(<MultipleChoiceActivity slide={slideWithNoOptions} />);

    expect(screen.getByText('activity.mcq.unavailable')).toBeTruthy();
  });
});
