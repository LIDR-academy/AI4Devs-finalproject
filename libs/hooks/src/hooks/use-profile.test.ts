jest.mock('@helsoft/supabase-services', () => ({
  ProfileService: { getProfile: jest.fn() },
}));
jest.mock('./use-api-key', () => ({ useApiKey: jest.fn() }));
jest.mock('./use-session', () => ({ useSession: jest.fn() }));

import { ProfileService } from '@helsoft/supabase-services';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createElement, type ReactNode } from 'react';

import { useApiKey } from './use-api-key';
import { ProfileProvider, useProfile } from './use-profile';
import { useSession } from './use-session';

const service = ProfileService as jest.Mocked<typeof ProfileService>;
const mockUseApiKey = useApiKey as jest.Mock;
const mockUseSession = useSession as jest.Mock;

describe('useProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      session: { user: { id: 'user-1' } },
      isLoading: false,
    });
    mockUseApiKey.mockReturnValue({
      status: { hasKey: true },
      isLoading: false,
      isSubmitting: false,
      error: null,
      saveApiKey: jest.fn(),
      removeApiKey: jest.fn(),
    });
  });

  it('@s2 exposes free entitlements with creation enabled when a saved key exists', async () => {
    service.getProfile.mockResolvedValue({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile).toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreate: true,
    });
    expect(result.current.error).toBeNull();
  });

  it('@s3 disables creation for a free plan without a saved key', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      status: { hasKey: false },
    });
    service.getProfile.mockResolvedValue({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile?.canCreate).toBe(false);
  });

  it('@s4 hides entitlements while key status is loading', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      isLoading: true,
    });
    service.getProfile.mockResolvedValue({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(service.getProfile).toHaveBeenCalled());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
  });

  it('@s4 hides entitlements while the plan request is still pending', () => {
    service.getProfile.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useProfile());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('@s5 exposes a retryable error and no entitlements after a plan read failure', async () => {
    const error = new Error('Profile not found');
    service.getProfile.mockRejectedValue(error);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile).toBeNull();
    expect(result.current.error).toBe(error);
    expect(result.current.retry).toEqual(expect.any(Function));
  });

  it('@s6 clears an error and derives current controls after retry succeeds', async () => {
    service.getProfile.mockRejectedValueOnce(new Error('read failed')).mockResolvedValueOnce({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
    });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.profile).toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreate: true,
    });
  });

  it('@s9 enables paid creation without a user key and hides key settings', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      status: { hasKey: false },
    });
    service.getProfile.mockResolvedValue({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.profile).toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreate: true,
    });
  });

  it('@s12 reloads paid to free and keeps creation enabled when the user key is present', async () => {
    service.getProfile
      .mockResolvedValueOnce({
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
      })
      .mockResolvedValueOnce({
        plan: 'free',
        keySource: 'user',
        showKeySettings: true,
        showAds: true,
      });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.profile?.plan).toBe('paid'));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.profile?.plan).toBe('free'));
    expect(result.current.profile).toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreate: true,
    });
  });

  it('@s12 reloads paid to free and disables creation when the user key is absent', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      status: { hasKey: false },
    });
    service.getProfile
      .mockResolvedValueOnce({
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
      })
      .mockResolvedValueOnce({
        plan: 'free',
        keySource: 'user',
        showKeySettings: true,
        showAds: true,
      });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.profile?.plan).toBe('paid'));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.profile?.plan).toBe('free'));
    expect(result.current.profile?.canCreate).toBe(false);
  });

  it('@s17 reloads free to paid and enables creation without a user key', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      status: { hasKey: false },
    });
    service.getProfile
      .mockResolvedValueOnce({
        plan: 'free',
        keySource: 'user',
        showKeySettings: true,
        showAds: true,
      })
      .mockResolvedValueOnce({
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
      });

    const { result } = renderHook(() => useProfile());
    await waitFor(() => expect(result.current.profile?.plan).toBe('free'));
    expect(result.current.profile?.canCreate).toBe(false);

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.profile?.plan).toBe('paid'));
    expect(result.current.profile).toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreate: true,
    });
  });

  it('@s6 ignores an older failed request after a newer retry succeeds', async () => {
    let rejectFirst: (error: Error) => void = () => {};
    service.getProfile
      .mockReturnValueOnce(
        new Promise((_, reject) => {
          rejectFirst = reject;
        }),
      )
      .mockResolvedValueOnce({
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
      });

    const { result } = renderHook(() => useProfile());
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => rejectFirst(new Error('stale failure')));

    expect(result.current.error).toBeNull();
    expect(result.current.profile?.plan).toBe('paid');
  });

  it('shares one profile fetch across consumers under ProfileProvider', async () => {
    service.getProfile.mockResolvedValue({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(ProfileProvider, null, children);

    const { result } = renderHook(
      () => ({
        a: useProfile(),
        b: useProfile(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.a.isLoading).toBe(false));
    expect(result.current.a.profile).toEqual(result.current.b.profile);
    expect(service.getProfile).toHaveBeenCalledTimes(1);
  });
});
