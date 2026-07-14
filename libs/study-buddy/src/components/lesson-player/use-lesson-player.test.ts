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
});
