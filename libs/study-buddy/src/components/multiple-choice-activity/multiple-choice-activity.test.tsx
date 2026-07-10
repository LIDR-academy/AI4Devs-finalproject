import type { MultipleChoiceSlide } from '@helsoft/types';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { MultipleChoiceActivity } from './multiple-choice-activity';

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
});
