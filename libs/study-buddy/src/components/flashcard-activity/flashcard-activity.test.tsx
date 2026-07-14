jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import type { FlashcardAnswer, FlashcardSlide } from '@helsoft/types';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { FlashcardActivity } from './flashcard-activity';

const slide: FlashcardSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Photosynthesis',
  content: 'What pigment absorbs light for photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'flashcard',
  back: 'Chlorophyll',
};

const recalledAnswer: FlashcardAnswer = {
  slideId: 'slide-1',
  activityType: 'flashcard',
  recalled: true,
  isCorrect: true,
};

describe('FlashcardActivity', () => {
  // @s6 — self-marking through the thin wiring emits a FlashcardAnswer exactly once.
  it('forwards slide + onAnswered to the Flashcard organism and reports the self-mark once', async () => {
    const onAnswered = jest.fn();
    await render(<FlashcardActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.flashcard.reveal' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: /^activity\.flashcard\.recalled/ }));
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-1',
      activityType: 'flashcard',
      recalled: true,
      isCorrect: true,
    });
  });

  // @s12 — restore seeds revealed + locked from prior in-session answer.
  it('restores revealed and locked state from initialAnswer', async () => {
    const onAnswered = jest.fn();
    await render(
      <FlashcardActivity slide={slide} onAnswered={onAnswered} initialAnswer={recalledAnswer} />,
    );

    expect(screen.getByText(slide.back)).toBeTruthy();
    expect(screen.getByText('activity.flashcard.recalledConfirmed')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'activity.flashcard.recalledConfirmed' }).props
        .accessibilityState.disabled,
    ).toBe(true);
    expect(onAnswered).not.toHaveBeenCalled();
  });
});
