jest.mock('@helsoft/supabase-services', () => ({
  LessonAttemptService: { saveAttempt: jest.fn() },
}));

import { LessonAttemptService } from '@helsoft/supabase-services';
import { act, renderHook } from '@testing-library/react';

import { useLessonAttempt } from './use-lesson-attempt';

const service = LessonAttemptService as jest.Mocked<typeof LessonAttemptService>;
const input = { lessonId: 'lesson-1', score: 3, total: 3 };

describe('useLessonAttempt', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s5 — the hook exposes a "saving" status while the save promise is in flight, driving the
  // results Loading state.
  it('sets status to saving while saveAttempt is in flight', async () => {
    let resolveSave: (value: unknown) => void = () => {};
    service.saveAttempt.mockReturnValue(new Promise((resolve) => (resolveSave = resolve)) as never);
    const { result } = renderHook(() => useLessonAttempt());

    expect(result.current.status).toBe('idle');

    act(() => {
      result.current.saveAttempt(input);
    });

    expect(result.current.status).toBe('saving');

    await act(async () => {
      resolveSave({ id: 'attempt-1', ...input, createdAt: '2026-07-11T00:00:00.000Z' });
    });
  });

  // @s6 — a successful save transitions to "saved" with the returned LessonAttempt.
  it('transitions to saved with the returned LessonAttempt on a successful save', async () => {
    const savedAttempt = { id: 'attempt-1', ...input, createdAt: '2026-07-11T00:00:00.000Z' };
    service.saveAttempt.mockResolvedValue(savedAttempt);
    const { result } = renderHook(() => useLessonAttempt());

    await act(async () => {
      result.current.saveAttempt(input);
    });

    expect(result.current.status).toBe('saved');
    expect(result.current.attempt).toEqual(savedAttempt);
  });

  // @s6 — each saveAttempt call is a fresh insert: calling it twice (two separate completions,
  // e.g. after a retake) delegates to the service twice with no overwrite semantics in the hook.
  it('calls the service again on a second saveAttempt call (fresh insert, no overwrite)', async () => {
    const firstAttempt = { id: 'attempt-1', ...input, createdAt: '2026-07-11T00:00:00.000Z' };
    const secondAttempt = { id: 'attempt-2', ...input, createdAt: '2026-07-11T01:00:00.000Z' };
    service.saveAttempt.mockResolvedValueOnce(firstAttempt).mockResolvedValueOnce(secondAttempt);
    const { result } = renderHook(() => useLessonAttempt());

    await act(async () => {
      result.current.saveAttempt(input);
    });
    await act(async () => {
      result.current.saveAttempt(input);
    });

    expect(service.saveAttempt).toHaveBeenCalledTimes(2);
    expect(result.current.attempt).toEqual(secondAttempt);
  });

  // Error path — a rejected save sets status: 'error' and keeps no stale attempt.
  it('sets status to error when the save rejects', async () => {
    service.saveAttempt.mockRejectedValue(new Error('insert failed'));
    const { result } = renderHook(() => useLessonAttempt());

    await act(async () => {
      result.current.saveAttempt(input);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.attempt).toBeNull();
  });

  // retry re-invokes the service with the last input and returns to saving, then to saved
  // once the retried call resolves.
  it('retry re-invokes the service with the last input and eventually saves', async () => {
    service.saveAttempt.mockRejectedValueOnce(new Error('insert failed'));
    const { result } = renderHook(() => useLessonAttempt());

    await act(async () => {
      result.current.saveAttempt(input);
    });
    expect(result.current.status).toBe('error');

    const savedAttempt = { id: 'attempt-1', ...input, createdAt: '2026-07-11T00:00:00.000Z' };
    service.saveAttempt.mockResolvedValueOnce(savedAttempt);

    await act(async () => {
      result.current.retry();
    });

    expect(service.saveAttempt).toHaveBeenCalledTimes(2);
    expect(service.saveAttempt).toHaveBeenNthCalledWith(2, input);
    expect(result.current.status).toBe('saved');
    expect(result.current.attempt).toEqual(savedAttempt);
  });

  // retry is a no-op when there is no prior saveAttempt input to replay.
  it('retry does nothing when there is no prior saveAttempt call', () => {
    const { result } = renderHook(() => useLessonAttempt());

    act(() => {
      result.current.retry();
    });

    expect(service.saveAttempt).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  // Guard against overlapping saves — calling saveAttempt again while already saving does not
  // re-fire the service (no double-fire / double-insert risk R4/R5).
  it('does not call the service again when saveAttempt is called while already saving', async () => {
    let resolveSave: (value: unknown) => void = () => {};
    service.saveAttempt.mockReturnValue(new Promise((resolve) => (resolveSave = resolve)) as never);
    const { result } = renderHook(() => useLessonAttempt());

    act(() => {
      result.current.saveAttempt(input);
    });
    act(() => {
      result.current.saveAttempt(input);
    });

    expect(service.saveAttempt).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveSave({ id: 'attempt-1', ...input, createdAt: '2026-07-11T00:00:00.000Z' });
    });
  });

  // Guard against overlapping saves via retry — calling retry again while a save triggered by a
  // prior retry() (or saveAttempt()) is still in flight does not re-fire the service (no
  // double-fire / double-insert risk R4/R5, same invariant as the saveAttempt-only overlap test
  // above, now also enforced for the retry call site).
  it('does not call the service again when retry is called while a save is already in flight', async () => {
    service.saveAttempt.mockRejectedValueOnce(new Error('insert failed'));
    const { result } = renderHook(() => useLessonAttempt());

    await act(async () => {
      result.current.saveAttempt(input);
    });
    expect(result.current.status).toBe('error');

    let resolveRetry: (value: unknown) => void = () => {};
    service.saveAttempt.mockReturnValue(
      new Promise((resolve) => (resolveRetry = resolve)) as never,
    );

    act(() => {
      result.current.retry();
    });
    act(() => {
      result.current.retry();
    });

    expect(service.saveAttempt).toHaveBeenCalledTimes(2);

    await act(async () => {
      resolveRetry({ id: 'attempt-1', ...input, createdAt: '2026-07-11T00:00:00.000Z' });
    });
  });

  // Safe against unmount — no console.error ("state update on an unmounted component") fires
  // once an in-flight save resolves after the component has already unmounted.
  it('does not log a state-update-after-unmount warning once the in-flight save resolves post-unmount', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    let resolveSave: (value: unknown) => void = () => {};
    service.saveAttempt.mockReturnValue(new Promise((resolve) => (resolveSave = resolve)) as never);
    const { result, unmount } = renderHook(() => useLessonAttempt());

    act(() => {
      result.current.saveAttempt(input);
    });
    unmount();

    await act(async () => {
      resolveSave({ id: 'attempt-1', ...input, createdAt: '2026-07-11T00:00:00.000Z' });
    });

    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
