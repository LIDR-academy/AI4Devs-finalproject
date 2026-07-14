import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';

import type { MultipleChoiceLabels } from './multiple-choice.types';
import { useMultipleChoice } from './use-multiple-choice';

const labels: MultipleChoiceLabels = {
  submit: 'Submit',
  correct: 'Correct',
  incorrect: 'Incorrect',
  explanationHeading: 'Why',
  unavailable: 'Unavailable',
};

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

const correctAnswer: MultipleChoiceAnswer = {
  slideId: slide.id,
  activityType: 'multiple-choice',
  selectedOptionId: 'opt-a',
  correctOptionId: 'opt-a',
  isCorrect: true,
};

const incorrectAnswer: MultipleChoiceAnswer = {
  slideId: slide.id,
  activityType: 'multiple-choice',
  selectedOptionId: 'opt-b',
  correctOptionId: 'opt-a',
  isCorrect: false,
};

describe('useMultipleChoice', () => {
  it('starts unanswered and available with submit disabled', async () => {
    const { result } = await renderHook(() => useMultipleChoice({ slide, labels }));

    expect(result.current.answer).toBeNull();
    expect(result.current.answered).toBe(false);
    expect(result.current.locked).toBe(false);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.isUnavailable).toBe(false);
    expect(result.current.resultLabel).toBeNull();
    expect(result.current.stateForOption('opt-a')).toBe('default');
  });

  it('marks the pending selection as selected before locking', async () => {
    const { result } = await renderHook(() => useMultipleChoice({ slide, labels }));

    await act(() => {
      result.current.setSelectedOptionId('opt-b');
    });

    expect(result.current.canSubmit).toBe(true);
    expect(result.current.stateForOption('opt-b')).toBe('selected');
    expect(result.current.stateForOption('opt-a')).toBe('default');
    expect(result.current.answered).toBe(false);
  });

  it('seeds from initialAnswer and derives correct/incorrect state', async () => {
    const { result } = await renderHook(() =>
      useMultipleChoice({ slide, initialAnswer: incorrectAnswer, labels }),
    );

    expect(result.current.answered).toBe(true);
    expect(result.current.locked).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.isCorrect).toBe(false);
    expect(result.current.resultLabel).toBe(labels.incorrect);
    expect(result.current.stateForOption('opt-a')).toBe('correct');
    expect(result.current.stateForOption('opt-b')).toBe('incorrect');
  });

  it('marks unavailable when correctOptionId is missing', async () => {
    const { result } = await renderHook(() =>
      useMultipleChoice({
        slide: { ...slide, correctOptionId: 'missing' },
        labels,
      }),
    );

    expect(result.current.isUnavailable).toBe(true);
  });

  it('updates derived state when setAnswer is called', async () => {
    const { result } = await renderHook(() => useMultipleChoice({ slide, labels }));

    await act(() => {
      result.current.setSelectedOptionId('opt-a');
      result.current.setAnswer(correctAnswer);
    });

    expect(result.current.answered).toBe(true);
    expect(result.current.locked).toBe(true);
    expect(result.current.canSubmit).toBe(false);
    expect(result.current.isCorrect).toBe(true);
    expect(result.current.resultLabel).toBe(labels.correct);
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

      await renderHook(() => useMultipleChoice({ slide, labels }));

      expect(announceSpy).not.toHaveBeenCalled();
      announceSpy.mockRestore();
    });

    it('announces when seeded with a correct answer', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useMultipleChoice({ slide, initialAnswer: correctAnswer, labels }));

      await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.correct));
      announceSpy.mockRestore();
    });

    it('does not announce on Android', async () => {
      Platform.OS = 'android';
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useMultipleChoice({ slide, initialAnswer: correctAnswer, labels }));

      expect(announceSpy).not.toHaveBeenCalled();
      announceSpy.mockRestore();
    });
  });
});
