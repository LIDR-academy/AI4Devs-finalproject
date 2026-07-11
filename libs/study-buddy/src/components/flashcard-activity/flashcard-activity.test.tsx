jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import type { FlashcardSlide } from '@helsoft/types';

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
});
