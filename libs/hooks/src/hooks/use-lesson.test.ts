jest.mock('@helsoft/supabase-services', () => ({
  LessonsService: { getLesson: jest.fn() },
}));

import { LessonsService } from '@helsoft/supabase-services';
import type { Lesson } from '@helsoft/types';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useLesson } from './use-lesson';

const service = LessonsService as jest.Mocked<typeof LessonsService>;

const lesson: Lesson = {
  id: 'lesson-1',
  userId: 'user-1',
  title: 'Capitals',
  createdAt: '2026-07-12T12:00:00.000Z',
  slides: [
    {
      id: 'slide-1',
      lessonId: 'lesson-1',
      title: 'Intro',
      content: 'Hello',
      position: 0,
      kind: 'instructional',
    },
  ],
};

describe('useLesson', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s17 — first render is loading before effects flush.
  it('initializes isLoading to true on the first render before effects flush', () => {
    const loadingOnRender: boolean[] = [];
    service.getLesson.mockReturnValue(new Promise(() => {}) as never);

    renderHook(() => {
      const value = useLesson('lesson-1');
      loadingOnRender.push(value.isLoading);
      return value;
    });

    expect(loadingOnRender[0]).toBe(true);
  });

  // @s17 — Loading until resolve; then Content with the lesson.
  it('starts loading and resolves with the lesson from LessonsService.getLesson', async () => {
    service.getLesson.mockResolvedValue(lesson);
    const { result } = renderHook(() => useLesson('lesson-1'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.lesson).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(service.getLesson).toHaveBeenCalledWith('lesson-1');
    expect(result.current.lesson).toEqual(lesson);
    expect(result.current.error).toBeNull();
  });

  // Empty = loaded lesson with slides: [] (feeds s15).
  it('resolves with a lesson that has zero slides', async () => {
    const empty: Lesson = { ...lesson, slides: [] };
    service.getLesson.mockResolvedValue(empty);
    const { result } = renderHook(() => useLesson('lesson-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lesson).toEqual(empty);
    expect(result.current.error).toBeNull();
  });

  // Error path feeds s16.
  it('sets error and clears loading when the service rejects', async () => {
    const failure = new Error('LessonsService.getLesson: failed to load lesson');
    service.getLesson.mockRejectedValue(failure);
    const { result } = renderHook(() => useLesson('lesson-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(failure);
    expect(result.current.lesson).toBeNull();
  });

  it('refetch reloads the lesson from the service', async () => {
    service.getLesson
      .mockResolvedValueOnce({ ...lesson, slides: [] })
      .mockResolvedValueOnce(lesson);
    const { result } = renderHook(() => useLesson('lesson-1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lesson?.slides).toEqual([]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.lesson).toEqual(lesson));
    expect(service.getLesson).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it('ignores a stale successful load that resolves after a newer refetch', async () => {
    let resolveFirst: (value: unknown) => void = () => {};
    let resolveSecond: (value: unknown) => void = () => {};
    service.getLesson
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)) as never)
      .mockReturnValueOnce(new Promise((resolve) => (resolveSecond = resolve)) as never);

    const { result } = renderHook(() => useLesson('lesson-1'));

    await act(async () => {
      result.current.refetch();
    });

    await act(async () => {
      resolveSecond(lesson);
    });
    await waitFor(() => expect(result.current.lesson).toEqual(lesson));

    await act(async () => {
      resolveFirst({ ...lesson, title: 'Stale' });
    });

    expect(result.current.lesson).toEqual(lesson);
    expect(result.current.isLoading).toBe(false);
  });
});
