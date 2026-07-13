jest.mock('@helsoft/supabase-services', () => ({
  LessonGenerationService: { generate: jest.fn() },
  GENERATION_ERROR_CODES: {
    missing_key: true,
    invalid_key: true,
    rate_limited: true,
    timeout: true,
    generation_failed: true,
    document_not_ready: true,
    network_error: true,
    unauthenticated: true,
  },
}));
jest.mock('./use-session', () => ({ useSession: jest.fn() }));

import { LessonGenerationService } from '@helsoft/supabase-services';
import { act, renderHook } from '@testing-library/react';

import { useLessonGeneration } from './use-lesson-generation';
import { useSession } from './use-session';

const service = LessonGenerationService as jest.Mocked<typeof LessonGenerationService>;
const mockUseSession = useSession as jest.Mock;

const request = { documentId: 'doc-1', composition: 'both' as const };

describe('useLessonGeneration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseSession.mockReturnValue({ session: { user: { id: 'user-1' } }, isLoading: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Initial state, before any generate() call.
  it('starts at stage idle with no result and no error', () => {
    const { result } = renderHook(() => useLessonGeneration());

    expect(result.current.stage).toBe('idle');
    expect(result.current.result).toBeUndefined();
    expect(result.current.error).toBeUndefined();
  });

  // @s14 — calling generate() moves to stage generating, starting at the first step.
  it('moves to stage generating with currentStep reading as soon as generate is called', async () => {
    let resolve!: (value: unknown) => void;
    let pending!: Promise<void>;
    service.generate.mockReturnValue(new Promise((r) => (resolve = r)) as never);
    const { result } = renderHook(() => useLessonGeneration());

    act(() => {
      pending = result.current.generate(request);
    });

    expect(result.current.stage).toBe('generating');
    expect(result.current.currentStep).toBe('reading');

    await act(async () => {
      resolve(undefined);
      await pending;
    });
  });

  // @s14 — currentStep advances through the fixed ordered phases while the call is in flight,
  // and never advances past the last step.
  it('advances currentStep through reading -> generating -> attaching, capping at attaching', async () => {
    let resolve!: (value: unknown) => void;
    let pending!: Promise<void>;
    service.generate.mockReturnValue(new Promise((r) => (resolve = r)) as never);
    const { result } = renderHook(() => useLessonGeneration());

    act(() => {
      pending = result.current.generate(request);
    });
    expect(result.current.currentStep).toBe('reading');

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(result.current.currentStep).toBe('generating');

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(result.current.currentStep).toBe('attaching');

    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(result.current.currentStep).toBe('attaching');

    await act(async () => {
      resolve(undefined);
      await pending;
    });
  });

  // @s3/@s14 — a successful call settles to stage content with the returned deck, and the
  // stepper stops advancing.
  it('settles to stage content with the returned deck once generation resolves', async () => {
    const lesson = {
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both' as const,
      slides: [],
    };
    service.generate.mockResolvedValue(lesson);
    const { result } = renderHook(() => useLessonGeneration());

    await act(async () => {
      await result.current.generate(request);
    });

    expect(result.current.stage).toBe('content');
    expect(result.current.result).toBe(lesson);
    expect(result.current.error).toBeUndefined();
  });

  // A failed call settles to stage error with the service's normalized code.
  it('settles to stage error with the normalized code once generation rejects', async () => {
    service.generate.mockRejectedValue(Object.assign(new Error('bad'), { code: 'timeout' }));
    const { result } = renderHook(() => useLessonGeneration());

    await act(async () => {
      await result.current.generate(request);
    });

    expect(result.current.stage).toBe('error');
    expect(result.current.error).toBe('timeout');
    expect(result.current.result).toBeUndefined();
  });

  // Off-contract rejection (missing/unrecognized code) falls back to network_error rather than
  // trusting an unchecked cast (mirrors useAuth/useApiKey's isXShape guards).
  it('falls back to network_error when the rejection carries no recognized code', async () => {
    service.generate.mockRejectedValue(new Error('unexpected'));
    const { result } = renderHook(() => useLessonGeneration());

    await act(async () => {
      await result.current.generate(request);
    });

    expect(result.current.error).toBe('network_error');
  });

  // review.md round-1 finding #3 (major) — a rapid double-press before React commits
  // stage -> 'generating' must not fire two concurrent LLM calls, and the first (stale) call's
  // resolution must never clobber whatever the (ignored) second call would have produced.
  it('ignores a second concurrent generate() call while one is already in flight', async () => {
    let resolveFirst!: (value: unknown) => void;
    service.generate.mockReturnValueOnce(new Promise((r) => (resolveFirst = r)) as never);
    const { result } = renderHook(() => useLessonGeneration());

    let firstCall!: Promise<void>;
    let secondCall!: Promise<void>;
    act(() => {
      firstCall = result.current.generate(request);
      secondCall = result.current.generate(request);
    });

    expect(service.generate).toHaveBeenCalledTimes(1);

    const lesson = {
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both' as const,
      slides: [],
    };
    await act(async () => {
      resolveFirst(lesson);
      await firstCall;
      await secondCall;
    });

    expect(result.current.stage).toBe('content');
    expect(result.current.result).toBe(lesson);
  });

  // Once the in-flight call settles, a later generate() call is no longer blocked.
  it('allows a new generate() call once the previous one has settled', async () => {
    service.generate.mockResolvedValueOnce({
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both' as const,
      slides: [],
    });
    const { result } = renderHook(() => useLessonGeneration());

    await act(async () => {
      await result.current.generate(request);
    });

    service.generate.mockResolvedValueOnce({
      lessonId: 'lesson-2',
      title: 'Cell Biology',
      composition: 'both' as const,
      slides: [],
    });
    await act(async () => {
      await result.current.generate(request);
    });

    expect(service.generate).toHaveBeenCalledTimes(2);
    expect(result.current.result?.lessonId).toBe('lesson-2');
  });

  // Passes documentId/composition through to the service, along with the session's userId.
  it('calls the service with the request and the current session userId', async () => {
    service.generate.mockResolvedValue({
      lessonId: 'lesson-1',
      title: 'Photosynthesis',
      composition: 'both',
      slides: [],
    });
    const { result } = renderHook(() => useLessonGeneration());

    await act(async () => {
      await result.current.generate(request);
    });

    expect(service.generate).toHaveBeenCalledWith(request, 'user-1');
  });

  // task-13, @s15 — retry() re-invokes generate() with the exact same last request (no
  // duplicate side effects, task-13 Goal), and a successful retry settles to content.
  describe('retry() (task-13)', () => {
    it('re-invokes generate with the same documentId/composition as the failed attempt', async () => {
      service.generate.mockRejectedValueOnce(
        Object.assign(new Error('timeout'), { code: 'timeout' }),
      );
      const lesson = {
        lessonId: 'lesson-1',
        title: 'Photosynthesis',
        composition: 'both' as const,
        slides: [],
      };
      service.generate.mockResolvedValueOnce(lesson);
      const { result } = renderHook(() => useLessonGeneration());

      await act(async () => {
        await result.current.generate(request);
      });
      expect(result.current.stage).toBe('error');
      expect(result.current.error).toBe('timeout');

      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.stage).toBe('content');
      expect(result.current.result).toBe(lesson);
      const [firstCall, secondCall] = service.generate.mock.calls;
      expect(secondCall[0]).toBe(firstCall[0]);
      expect(secondCall[1]).toBe(firstCall[1]);
      expect(service.generate).toHaveBeenCalledTimes(2);
    });

    // Guard — calling retry() before any generate() attempt is a no-op (nothing to retry).
    it('does nothing when generate has never been called', async () => {
      const { result } = renderHook(() => useLessonGeneration());

      await act(async () => {
        await result.current.retry();
      });

      expect(service.generate).not.toHaveBeenCalled();
      expect(result.current.stage).toBe('idle');
    });
  });
});
