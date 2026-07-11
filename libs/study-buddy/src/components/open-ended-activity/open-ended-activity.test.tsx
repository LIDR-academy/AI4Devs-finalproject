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

  // @s7 / task-4 — invalid slide → unavailable, no emission
  it('shows unavailable and never emits when the slide is invalid', async () => {
    const onAnswered = jest.fn();
    await render(
      <OpenEndedActivity
        slide={{ ...slide, content: '   ' }}
        onAnswered={onAnswered}
      />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.answerInput)).toBeNull();
    expect(onAnswered).not.toHaveBeenCalled();
  });
});
