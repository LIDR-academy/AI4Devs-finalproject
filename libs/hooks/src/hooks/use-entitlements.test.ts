jest.mock('@helsoft/supabase-services', () => ({
  EntitlementsService: { getEntitlements: jest.fn() },
}));
jest.mock('./use-api-key', () => ({ useApiKey: jest.fn() }));
jest.mock('./use-session', () => ({ useSession: jest.fn() }));

import { EntitlementsService } from '@helsoft/supabase-services';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { createElement, type ReactNode } from 'react';

import { useApiKey } from './use-api-key';
import { EntitlementsProvider, useEntitlements } from './use-entitlements';
import { useSession } from './use-session';

const service = EntitlementsService as jest.Mocked<typeof EntitlementsService>;
const mockUseApiKey = useApiKey as jest.Mock;
const mockUseSession = useSession as jest.Mock;

describe('useEntitlements', () => {
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
    service.getEntitlements.mockResolvedValue({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreateWithoutKey: false,
    });

    const { result } = renderHook(() => useEntitlements());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entitlements).toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreateWithoutKey: false,
      canCreate: true,
    });
    expect(result.current.error).toBeNull();
  });

  it('@s3 disables creation for a free plan without a saved key', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      status: { hasKey: false },
    });
    service.getEntitlements.mockResolvedValue({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreateWithoutKey: false,
    });

    const { result } = renderHook(() => useEntitlements());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entitlements?.canCreate).toBe(false);
  });

  it('@s4 hides entitlements while key status is loading', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      isLoading: true,
    });
    service.getEntitlements.mockResolvedValue({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreateWithoutKey: false,
    });

    const { result } = renderHook(() => useEntitlements());

    await waitFor(() => expect(service.getEntitlements).toHaveBeenCalled());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.entitlements).toBeNull();
  });

  it('@s4 hides entitlements while the plan request is still pending', () => {
    service.getEntitlements.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useEntitlements());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.entitlements).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('@s5 exposes a retryable error and no entitlements after a plan read failure', async () => {
    const error = new Error('Profile not found');
    service.getEntitlements.mockRejectedValue(error);

    const { result } = renderHook(() => useEntitlements());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entitlements).toBeNull();
    expect(result.current.error).toBe(error);
    expect(result.current.retry).toEqual(expect.any(Function));
  });

  it('@s6 clears an error and derives current controls after retry succeeds', async () => {
    service.getEntitlements.mockRejectedValueOnce(new Error('read failed')).mockResolvedValueOnce({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreateWithoutKey: true,
    });

    const { result } = renderHook(() => useEntitlements());
    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.entitlements).toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreateWithoutKey: true,
      canCreate: true,
    });
  });

  it('@s9 enables paid creation without a user key and hides key settings', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      status: { hasKey: false },
    });
    service.getEntitlements.mockResolvedValue({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreateWithoutKey: true,
    });

    const { result } = renderHook(() => useEntitlements());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entitlements).toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreateWithoutKey: true,
      canCreate: true,
    });
  });

  it('@s12 reloads paid to free and keeps creation enabled when the user key is present', async () => {
    service.getEntitlements
      .mockResolvedValueOnce({
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
        canCreateWithoutKey: true,
      })
      .mockResolvedValueOnce({
        plan: 'free',
        keySource: 'user',
        showKeySettings: true,
        showAds: true,
        canCreateWithoutKey: false,
      });

    const { result } = renderHook(() => useEntitlements());
    await waitFor(() => expect(result.current.entitlements?.plan).toBe('paid'));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.entitlements?.plan).toBe('free'));
    expect(result.current.entitlements).toEqual({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreateWithoutKey: false,
      canCreate: true,
    });
  });

  it('@s12 reloads paid to free and disables creation when the user key is absent', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      status: { hasKey: false },
    });
    service.getEntitlements
      .mockResolvedValueOnce({
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
        canCreateWithoutKey: true,
      })
      .mockResolvedValueOnce({
        plan: 'free',
        keySource: 'user',
        showKeySettings: true,
        showAds: true,
        canCreateWithoutKey: false,
      });

    const { result } = renderHook(() => useEntitlements());
    await waitFor(() => expect(result.current.entitlements?.plan).toBe('paid'));

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.entitlements?.plan).toBe('free'));
    expect(result.current.entitlements?.canCreate).toBe(false);
  });

  it('@s17 reloads free to paid and enables creation without a user key', async () => {
    mockUseApiKey.mockReturnValue({
      ...mockUseApiKey(),
      status: { hasKey: false },
    });
    service.getEntitlements
      .mockResolvedValueOnce({
        plan: 'free',
        keySource: 'user',
        showKeySettings: true,
        showAds: true,
        canCreateWithoutKey: false,
      })
      .mockResolvedValueOnce({
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
        canCreateWithoutKey: true,
      });

    const { result } = renderHook(() => useEntitlements());
    await waitFor(() => expect(result.current.entitlements?.plan).toBe('free'));
    expect(result.current.entitlements?.canCreate).toBe(false);

    act(() => result.current.retry());

    await waitFor(() => expect(result.current.entitlements?.plan).toBe('paid'));
    expect(result.current.entitlements).toEqual({
      plan: 'paid',
      keySource: 'platform',
      showKeySettings: false,
      showAds: false,
      canCreateWithoutKey: true,
      canCreate: true,
    });
  });

  it('@s6 ignores an older failed request after a newer retry succeeds', async () => {
    let rejectFirst: (error: Error) => void = () => {};
    service.getEntitlements
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
        canCreateWithoutKey: true,
      });

    const { result } = renderHook(() => useEntitlements());
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => rejectFirst(new Error('stale failure')));

    expect(result.current.error).toBeNull();
    expect(result.current.entitlements?.plan).toBe('paid');
  });

  it('shares one profile fetch across consumers under EntitlementsProvider', async () => {
    service.getEntitlements.mockResolvedValue({
      plan: 'free',
      keySource: 'user',
      showKeySettings: true,
      showAds: true,
      canCreateWithoutKey: false,
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(EntitlementsProvider, null, children);

    const { result } = renderHook(
      () => ({
        a: useEntitlements(),
        b: useEntitlements(),
      }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.a.isLoading).toBe(false));
    expect(result.current.a.entitlements).toEqual(result.current.b.entitlements);
    expect(service.getEntitlements).toHaveBeenCalledTimes(1);
  });
});
