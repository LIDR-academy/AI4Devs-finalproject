import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';

import type { FillInTheBlankLabels } from './fill-in-the-blank.types';
import { useFillInTheBlank } from './use-fill-in-the-blank';

const labels: FillInTheBlankLabels = {
  submit: 'Submit',
  correct: 'Correct',
  incorrect: 'Incorrect',
  explanationHeading: 'Why',
  unavailable: 'Unavailable',
  blankInput: 'Blank',
};

const slide: FillInTheBlankSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'The capital of France is ____.',
  position: 0,
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  acceptedAnswers: ['Paris', 'City of Light'],
};

const correctAnswer: FillInTheBlankAnswer = {
  slideId: slide.id,
  activityType: 'fill-in-the-blank',
  submittedAnswer: 'paris',
  acceptedAnswerShown: 'Paris',
  isCorrect: true,
};

describe('useFillInTheBlank', () => {
  it('starts with empty value, unlocked, and available', async () => {
    const { result } = await renderHook(() => useFillInTheBlank({ slide, labels }));

    expect(result.current.value).toBe('');
    expect(result.current.answer).toBeNull();
    expect(result.current.locked).toBe(false);
    expect(result.current.isUnavailable).toBe(false);
    expect(result.current.parts).toEqual({
      before: 'The capital of France is ',
      after: '.',
    });
    expect(result.current.maxLength).toBe(7);
    expect(result.current.resultLabel).toBeNull();
  });

  it('seeds value and answer from initialAnswer', async () => {
    const { result } = await renderHook(() =>
      useFillInTheBlank({ slide, initialAnswer: correctAnswer, labels }),
    );

    expect(result.current.value).toBe('paris');
    expect(result.current.locked).toBe(true);
    expect(result.current.resultLabel).toBe(labels.correct);
  });

  it('marks unavailable when acceptedAnswers is empty', async () => {
    const { result } = await renderHook(() =>
      useFillInTheBlank({ slide: { ...slide, acceptedAnswers: [] }, labels }),
    );

    expect(result.current.isUnavailable).toBe(true);
  });

  it('marks unavailable when content has no blank', async () => {
    const { result } = await renderHook(() =>
      useFillInTheBlank({ slide: { ...slide, content: 'No blank.' }, labels }),
    );

    expect(result.current.isUnavailable).toBe(true);
    expect(result.current.parts).toBeNull();
  });

  it('updates value via setValue while unlocked', async () => {
    const { result } = await renderHook(() => useFillInTheBlank({ slide, labels }));

    await act(() => {
      result.current.setValue('Paris');
    });

    expect(result.current.value).toBe('Paris');
  });

  describe('AccessibilityInfo announcement', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      Platform.OS = originalOS;
    });

    it('does not announce while unanswered', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useFillInTheBlank({ slide, labels }));

      expect(announceSpy).not.toHaveBeenCalled();
      announceSpy.mockRestore();
    });

    it('announces when seeded with an answer', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useFillInTheBlank({ slide, initialAnswer: correctAnswer, labels }));

      await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.correct));
      announceSpy.mockRestore();
    });

    it('does not announce on Android', async () => {
      Platform.OS = 'android';
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useFillInTheBlank({ slide, initialAnswer: correctAnswer, labels }));

      expect(announceSpy).not.toHaveBeenCalled();
      announceSpy.mockRestore();
    });
  });
});
