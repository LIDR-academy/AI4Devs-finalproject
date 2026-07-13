jest.mock('@helsoft/supabase-services', () => ({
  LessonGenerationService: { generate: jest.fn() },
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
});
