jest.mock('@helsoft/supabase-services', () => ({
  LessonsService: { getLessons: jest.fn(), deleteLesson: jest.fn() },
}));

import { LessonsService } from '@helsoft/supabase-services';
import { act, renderHook, waitFor } from '@testing-library/react';

import { useLessons } from './use-lessons';

const service = LessonsService as jest.Mocked<typeof LessonsService>;

const lessons = [
  { id: 'lesson-2', title: 'Newer', createdAt: '2026-07-13T12:00:00.000Z' },
  { id: 'lesson-1', title: 'Older', createdAt: '2026-07-12T12:00:00.000Z' },
];

describe('useLessons', () => {
  beforeEach(() => jest.clearAllMocks());

  // Mutation: isLoading starts true — first render must be loading before load() effect runs.
  it('initializes isLoading to true on the first render before effects flush', () => {
    const loadingOnRender: boolean[] = [];
    service.getLessons.mockReturnValue(new Promise(() => {}) as never);

    renderHook(() => {
      const value = useLessons();
      loadingOnRender.push(value.isLoading);
      return value;
    });

    expect(loadingOnRender[0]).toBe(true);
  });

  // @s4 — loads own lessons on mount (newest-first ordering comes from the DAO).
  it('starts loading and resolves with lessons from LessonsService.getLessons', async () => {
    service.getLessons.mockResolvedValue(lessons);
    const { result } = renderHook(() => useLessons());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.lessons).toEqual([]);
    expect(result.current.error).toBeNull();

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(service.getLessons).toHaveBeenCalledTimes(1);
    expect(result.current.lessons).toEqual(lessons);
    expect(result.current.error).toBeNull();
  });

  // Empty list is a successful Content→Empty handoff for task-4, not an error (@s5 feed).
  it('resolves with an empty lessons array when the service returns none', async () => {
    service.getLessons.mockResolvedValue([]);
    const { result } = renderHook(() => useLessons());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.lessons).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  // Error path feeds task-4's Error + retry UI (@s14 feed).
  it('sets error and clears loading when the service rejects', async () => {
    const failure = new Error('LessonsService.getLessons: failed to load lessons');
    service.getLessons.mockRejectedValue(failure);
    const { result } = renderHook(() => useLessons());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(failure);
    expect(result.current.lessons).toEqual([]);
  });

  // @s7 feed — refetch after login / retry reloads from the service.
  it('refetch reloads lessons from the service', async () => {
    service.getLessons.mockResolvedValueOnce([]).mockResolvedValueOnce(lessons);
    const { result } = renderHook(() => useLessons());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lessons).toEqual([]);

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.lessons).toEqual(lessons));
    expect(service.getLessons).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeNull();
  });

  it('refetch clears a prior error on success', async () => {
    service.getLessons.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(lessons);
    const { result } = renderHook(() => useLessons());

    await waitFor(() => expect(result.current.error).not.toBeNull());

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => expect(result.current.error).toBeNull());
    expect(result.current.lessons).toEqual(lessons);
  });

  it('does not log a state-update-after-unmount warning once an in-flight load resolves', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let resolveLoad: (value: unknown) => void = () => {};
    service.getLessons.mockReturnValue(new Promise((resolve) => (resolveLoad = resolve)) as never);
    const { unmount } = renderHook(() => useLessons());

    unmount();

    await act(async () => {
      resolveLoad(lessons);
    });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // Mutation: drop isMounted / requestId success guard — stale in-flight must not overwrite.
  it('ignores a stale successful load that resolves after a newer refetch', async () => {
    let resolveFirst: (value: unknown) => void = () => {};
    let resolveSecond: (value: unknown) => void = () => {};
    service.getLessons
      .mockReturnValueOnce(new Promise((resolve) => (resolveFirst = resolve)) as never)
      .mockReturnValueOnce(new Promise((resolve) => (resolveSecond = resolve)) as never);

    const { result } = renderHook(() => useLessons());

    await act(async () => {
      result.current.refetch();
    });

    await act(async () => {
      resolveSecond(lessons);
    });
    await waitFor(() => expect(result.current.lessons).toEqual(lessons));

    await act(async () => {
      resolveFirst([{ id: 'stale', title: 'Stale', createdAt: '2026-01-01T00:00:00.000Z' }]);
    });

    expect(result.current.lessons).toEqual(lessons);
    expect(result.current.isLoading).toBe(false);
  });

  // Mutation: drop isMounted / requestId error guard — stale rejection must not clear a newer success.
  it('ignores a stale rejected load that settles after a newer refetch succeeds', async () => {
    let rejectFirst: (reason?: unknown) => void = () => {};
    let resolveSecond: (value: unknown) => void = () => {};
    service.getLessons
      .mockReturnValueOnce(new Promise((_, reject) => (rejectFirst = reject)) as never)
      .mockReturnValueOnce(new Promise((resolve) => (resolveSecond = resolve)) as never);

    const { result } = renderHook(() => useLessons());

    await act(async () => {
      result.current.refetch();
    });

    await act(async () => {
      resolveSecond(lessons);
    });
    await waitFor(() => expect(result.current.lessons).toEqual(lessons));

    await act(async () => {
      rejectFirst(new Error('stale failure'));
    });

    expect(result.current.lessons).toEqual(lessons);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // Mutation: unmount cleanup / isMounted success guard — no setState after unmount.
  it('does not apply a successful load after unmount', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let resolveLoad: (value: unknown) => void = () => {};
    service.getLessons.mockReturnValue(new Promise((resolve) => (resolveLoad = resolve)) as never);

    const { unmount } = renderHook(() => useLessons());
    unmount();

    await act(async () => {
      resolveLoad(lessons);
    });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // Mutation: unmount cleanup / isMounted error guard — no setState after unmount on reject.
  it('does not apply a rejected load after unmount', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let rejectLoad: (reason?: unknown) => void = () => {};
    service.getLessons.mockReturnValue(new Promise((_, reject) => (rejectLoad = reject)) as never);

    const { unmount } = renderHook(() => useLessons());
    unmount();

    await act(async () => {
      rejectLoad(new Error('gone'));
    });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // Mutation: delete success isMounted guard — setState after unmount must not warn.
  it('does not update state when delete resolves after unmount', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    service.getLessons.mockResolvedValue(lessons);
    let resolveDelete: () => void = () => {};
    service.deleteLesson.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveDelete = resolve;
      }) as never,
    );

    const { result, unmount } = renderHook(() => useLessons());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let deletePromise: Promise<void> = Promise.resolve();
    await act(async () => {
      deletePromise = result.current.deleteLesson('lesson-2');
    });

    unmount();

    await act(async () => {
      resolveDelete();
      await deletePromise;
    });

    expect(service.deleteLesson).toHaveBeenCalledWith('lesson-2');
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // Mutation: delete error `if (isMounted)` → `if (true)` — setError after unmount must not warn.
  it('does not set error state when deleteLesson rejects after unmount', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    service.getLessons.mockResolvedValue(lessons);
    let rejectDelete: (reason?: unknown) => void = () => {};
    service.deleteLesson.mockReturnValue(
      new Promise((_, reject) => (rejectDelete = reject)) as never,
    );

    const { result, unmount } = renderHook(() => useLessons());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let deletePromise: Promise<void> = Promise.resolve();
    await act(async () => {
      deletePromise = result.current.deleteLesson('lesson-2');
    });

    unmount();

    const failure = new Error('delete failed after unmount');
    await act(async () => {
      rejectDelete(failure);
      await expect(deletePromise).rejects.toBe(failure);
    });

    expect(service.deleteLesson).toHaveBeenCalledWith('lesson-2');
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  // @s8 — deleteLesson calls the service and removes the lesson from the local list.
  it('deleteLesson removes the lesson from the list after a successful service delete', async () => {
    service.getLessons.mockResolvedValue(lessons);
    service.deleteLesson.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLessons());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.lessons).toEqual(lessons);

    await act(async () => {
      await result.current.deleteLesson('lesson-2');
    });

    expect(service.deleteLesson).toHaveBeenCalledWith('lesson-2');
    expect(result.current.lessons).toEqual([
      { id: 'lesson-1', title: 'Older', createdAt: '2026-07-12T12:00:00.000Z' },
    ]);
  });

  // @s8 — a failed delete leaves the list unchanged and surfaces the error.
  it('deleteLesson leaves the list unchanged and sets error when the service rejects', async () => {
    const failure = new Error('LessonsService.deleteLesson: failed to delete lesson');
    service.getLessons.mockResolvedValue(lessons);
    service.deleteLesson.mockRejectedValue(failure);
    const { result } = renderHook(() => useLessons());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await expect(result.current.deleteLesson('lesson-2')).rejects.toBe(failure);
    });

    expect(result.current.lessons).toEqual(lessons);
    expect(result.current.error).toBe(failure);
  });
});
