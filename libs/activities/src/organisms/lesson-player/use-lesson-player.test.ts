import type { Lesson } from '@helsoft/types';
import { act, renderHook } from '@testing-library/react-native';

import { useLessonPlayer } from './use-lesson-player';

const lesson: Lesson = {
  id: 'lesson-1',
  userId: 'user-1',
  title: 'Capitals',
  createdAt: '2026-07-12T12:00:00.000Z',
  slides: [
    {
      id: 's1',
      lessonId: 'lesson-1',
      title: 'Intro',
      content: 'Welcome',
      position: 0,
      kind: 'instructional',
    },
    {
      id: 's2',
      lessonId: 'lesson-1',
      title: 'Q1',
      content: 'Capital?',
      position: 1,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [
        { id: 'a', label: 'Paris' },
        { id: 'b', label: 'Berlin' },
      ],
      correctOptionId: 'a',
    },
  ],
};

describe('useLessonPlayer', () => {
  it('goNext advances currentIndex', async () => {
    const { result } = await renderHook(() => useLessonPlayer(lesson));
    expect(result.current.currentIndex).toBe(0);
    await act(async () => {
      result.current.goNext();
    });
    expect(result.current.currentIndex).toBe(1);
  });

  it('entering results sets persistOnMount true once then false on re-entry', async () => {
    const { result } = await renderHook(() => useLessonPlayer(lesson));
    await act(async () => {
      result.current.goNext();
    });
    await act(async () => {
      result.current.goNext();
    });
    expect(result.current.isResultsSlide).toBe(true);
    expect(result.current.persistOnMount).toBe(true);
    expect(result.current.attemptSaved).toBe(true);

    await act(async () => {
      result.current.goBack();
    });
    await act(async () => {
      result.current.goNext();
    });
    expect(result.current.isResultsSlide).toBe(true);
    expect(result.current.persistOnMount).toBe(false);
  });

  // @s18 / @s22 — reset clears session so next results entry may persist again.
  it('reset returns to first slide and allows a fresh persist after retake', async () => {
    const { result } = await renderHook(() => useLessonPlayer(lesson));
    await act(async () => {
      result.current.goNext();
    });
    await act(async () => {
      result.current.onAnswered({
        slideId: 's2',
        activityType: 'multiple-choice',
        selectedOptionId: 'a',
        correctOptionId: 'a',
        isCorrect: true,
      });
    });
    await act(async () => {
      result.current.goNext();
    });
    expect(result.current.isResultsSlide).toBe(true);
    expect(result.current.attemptSaved).toBe(true);
    expect(Object.keys(result.current.answers)).toHaveLength(1);

    await act(async () => {
      result.current.reset();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.answers).toEqual({});
    expect(result.current.attemptSaved).toBe(false);
    expect(result.current.persistOnMount).toBe(true);
    expect(result.current.isResultsSlide).toBe(false);

    await act(async () => {
      result.current.goNext();
    });
    await act(async () => {
      result.current.goNext();
    });
    expect(result.current.isResultsSlide).toBe(true);
    expect(result.current.persistOnMount).toBe(true);
    expect(result.current.attemptSaved).toBe(true);
  });

  // Mutation — gradedAnswers memo depends on lesson + answers.
  it('updates gradedAnswers when an activity is answered', async () => {
    const { result } = await renderHook(() => useLessonPlayer(lesson));
    expect(result.current.gradedAnswers).toEqual([
      { slideId: 's2', activityType: 'multiple-choice', isCorrect: false },
    ]);

    await act(async () => {
      result.current.onAnswered({
        slideId: 's2',
        activityType: 'multiple-choice',
        selectedOptionId: 'a',
        correctOptionId: 'a',
        isCorrect: true,
      });
    });

    expect(result.current.gradedAnswers).toEqual([
      { slideId: 's2', activityType: 'multiple-choice', isCorrect: true },
    ]);
  });

  // Review r2 — nav handlers keep stable identities across renders.
  it('keeps goNext/goBack/onAnswered/reset identities across re-renders', async () => {
    const { result, rerender } = await renderHook(() => useLessonPlayer(lesson));
    const first = {
      goNext: result.current.goNext,
      goBack: result.current.goBack,
      onAnswered: result.current.onAnswered,
      reset: result.current.reset,
    };

    rerender(undefined);

    expect(result.current.goNext).toBe(first.goNext);
    expect(result.current.goBack).toBe(first.goBack);
    expect(result.current.onAnswered).toBe(first.onAnswered);
    expect(result.current.reset).toBe(first.reset);
  });
});
