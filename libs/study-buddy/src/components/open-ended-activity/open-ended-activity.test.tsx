jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { isSystemCheckedActivity } from '@helsoft/types';
import type { OpenEndedSlide } from '@helsoft/types';

import { OpenEndedActivity } from './open-ended-activity';

const slide: OpenEndedSlide = {
  id: 'slide-oe-1',
  lessonId: 'lesson-1',
  title: 'Explain',
  content: 'What is photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'open-ended',
  modelAnswer: 'Conversion of light energy into chemical energy.',
  explanation: 'Key process in plants.',
};

const labels = {
  submit: 'activity.openEnded.submit',
  yourAnswer: 'activity.openEnded.yourAnswer',
  modelAnswer: 'activity.openEnded.modelAnswer',
  explanationHeading: 'activity.openEnded.explanationHeading',
  unavailable: 'activity.openEnded.unavailable',
  answerInput: 'activity.openEnded.answerInput',
};

const answerInput = () => screen.getByLabelText(labels.answerInput);
const submitButton = () => screen.getByRole('button', { name: labels.submit });

describe('OpenEndedActivity', () => {
  // @s2 / @s6 — submit emits answered-state once, no isCorrect, excluded from score.
  it('emits OpenEndedAnswer once on submit without isCorrect', async () => {
    const onAnswered = jest.fn();
    await render(<OpenEndedActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.changeText(answerInput(), 'plants convert light');
    });
    await act(async () => {
      fireEvent.press(submitButton());
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-oe-1',
      activityType: 'open-ended',
      submittedAnswer: 'plants convert light',
    });
    expect(onAnswered.mock.calls[0][0]).not.toHaveProperty('isCorrect');

    expect(screen.getByText(slide.modelAnswer)).toBeTruthy();
    expect(isSystemCheckedActivity('open-ended')).toBe(false);
  });

  // @s4 — ignore second submit
  it('does not emit onAnswered again after the first submit', async () => {
    const onAnswered = jest.fn();
    await render(<OpenEndedActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.changeText(answerInput(), 'first');
    });
    await act(async () => {
      fireEvent.press(submitButton());
    });
    await act(async () => {
      fireEvent.press(submitButton());
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-oe-1',
      activityType: 'open-ended',
      submittedAnswer: 'first',
    });
  });

  // @s5 — empty submit still reveals + records empty submittedAnswer
  it('emits submittedAnswer empty string and reveals model answer on empty submit', async () => {
    const onAnswered = jest.fn();
    await render(<OpenEndedActivity slide={slide} onAnswered={onAnswered} />);

    expect(answerInput().props.value).toBe('');
    await act(async () => {
      fireEvent.press(submitButton());
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-oe-1',
      activityType: 'open-ended',
      submittedAnswer: '',
    });
    expect(answerInput().props.editable).toBe(false);
    expect(screen.getByText(slide.modelAnswer)).toBeTruthy();
  });

  // @s7 — invalid prompt or model answer → unavailable, no emission
  it.each([
    ['prompt', { content: '' }],
    ['prompt', { content: '   ' }],
    ['model answer', { modelAnswer: '' }],
    ['model answer', { modelAnswer: '\t\n' }],
  ] as const)('shows unavailable when %s is empty or whitespace-only', async (_field, patch) => {
    const onAnswered = jest.fn();
    await render(
      <OpenEndedActivity slide={{ ...slide, ...patch }} onAnswered={onAnswered} />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.answerInput)).toBeNull();
    expect(screen.queryByRole('button', { name: labels.submit })).toBeNull();
    expect(onAnswered).not.toHaveBeenCalled();
  });
});
