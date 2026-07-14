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
