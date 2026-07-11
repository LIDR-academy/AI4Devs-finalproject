import { AccessibilityInfo, Platform } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { FlashcardAnswer, FlashcardSlide } from '@helsoft/types';

import type { FlashcardLabels } from './flashcard.types';
import { useFlashcard } from './use-flashcard';

const labels: FlashcardLabels = {
  reveal: 'Reveal answer',
  recalled: 'Recalled',
  notRecalled: 'Not recalled',
  recalledConfirmed: 'Marked recalled',
  notRecalledConfirmed: 'Marked not recalled',
  answerHeading: 'Answer',
  explanationHeading: 'Why',
  unavailable: 'Unavailable',
};

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
  slideId: slide.id,
  activityType: 'flashcard',
  recalled: true,
  isCorrect: true,
};

describe('useFlashcard', () => {
  it('starts hidden, unlocked, and available', async () => {
    const { result } = await renderHook(() => useFlashcard({ slide, labels }));

    expect(result.current.revealed).toBe(false);
    expect(result.current.answer).toBeNull();
    expect(result.current.locked).toBe(false);
    expect(result.current.isRevealed).toBe(false);
    expect(result.current.isUnavailable).toBe(false);
  });

  it('seeds revealed and locked from initialAnswer', async () => {
    const { result } = await renderHook(() =>
      useFlashcard({ slide, initialAnswer: recalledAnswer, labels }),
    );

    expect(result.current.answer).toEqual(recalledAnswer);
    expect(result.current.locked).toBe(true);
    expect(result.current.isRevealed).toBe(true);
  });

  it('seeds isRevealed from initialRevealed without an answer', async () => {
    const { result } = await renderHook(() =>
      useFlashcard({ slide, initialRevealed: true, labels }),
    );

    expect(result.current.revealed).toBe(true);
    expect(result.current.answer).toBeNull();
    expect(result.current.locked).toBe(false);
    expect(result.current.isRevealed).toBe(true);
  });

  it('marks unavailable when the slide is invalid', async () => {
    const { result } = await renderHook(() =>
      useFlashcard({ slide: { ...slide, back: '' }, labels }),
    );

    expect(result.current.isUnavailable).toBe(true);
  });

  describe('AccessibilityInfo announcement on reveal', () => {
    const originalOS = Platform.OS;
    let announceSpy: jest.SpyInstance;

    beforeEach(() => {
      announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
      announceSpy.mockClear();
    });

    afterEach(() => {
      Platform.OS = originalOS;
      announceSpy.mockRestore();
    });

    it('does not announce while hidden', async () => {
      await renderHook(() => useFlashcard({ slide, labels }));

      expect(announceSpy).not.toHaveBeenCalled();
    });

    it('announces the answer heading when revealed', async () => {
      const { result } = await renderHook(() => useFlashcard({ slide, labels }));

      await act(async () => {
        result.current.setRevealed(true);
      });

      await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.answerHeading));
    });

    it('does not announce on Android', async () => {
      Platform.OS = 'android';

      const { result } = await renderHook(() => useFlashcard({ slide, labels }));

      await act(async () => {
        result.current.setRevealed(true);
      });

      expect(announceSpy).not.toHaveBeenCalled();
    });
  });
});
