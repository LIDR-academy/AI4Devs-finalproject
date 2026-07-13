jest.mock('@helsoft/supabase-services', () => ({
  AuthService: {
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

import { act, renderHook } from '@testing-library/react';
import { AuthService } from '@helsoft/supabase-services';

import { useAuth } from './use-auth';

const service = AuthService as jest.Mocked<typeof AuthService>;

describe('useAuth', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s2 — signIn delegates to AuthService with the given credentials.
  it('signIn calls AuthService.signIn with the given email and password', async () => {
    service.signIn.mockResolvedValue({ session: null, user: null } as never);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signIn('user@example.com', 'secret1');
    });

    expect(service.signIn).toHaveBeenCalledWith('user@example.com', 'secret1');
  });

  // @s3 — isSubmitting is true while the sign-in call is in flight, false once it resolves.
  it('sets isSubmitting true during sign-in and false after it resolves', async () => {
    let resolveSignIn: (value: unknown) => void = () => {};
    service.signIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      }) as never,
    );
    const { result } = renderHook(() => useAuth());

    expect(result.current.isSubmitting).toBe(false);

    let signInPromise!: Promise<void>;
    act(() => {
      signInPromise = result.current.signIn('user@example.com', 'secret1');
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSignIn({ session: null, user: null });
      await signInPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  // @s5/@s6 — a failed signIn exposes the normalized AuthErrorCode via `error`, so the UI can
  // render the right banner without ever seeing the raw service/DAO error.
  it('sets error to the failed signIn code, and null on a subsequent successful signIn', async () => {
    service.signIn.mockRejectedValueOnce({ code: 'invalid_credentials' });
    const { result } = renderHook(() => useAuth());

    expect(result.current.error).toBeNull();

    await act(async () => {
      await expect(result.current.signIn('user@example.com', 'wrong')).rejects.toBeTruthy();
    });

    expect(result.current.error).toBe('invalid_credentials');

    service.signIn.mockResolvedValueOnce({ session: null, user: null } as never);

    await act(async () => {
      await result.current.signIn('user@example.com', 'secret1');
    });

    expect(result.current.error).toBeNull();
  });

  // @s3/@s6 — the Loading state shows "no error yet" (spec.md UI-states table): a stale error
  // from a previous failed attempt must clear as soon as a new signIn attempt starts, not only
  // once it resolves.
  it('clears a previous error immediately when a new signIn attempt starts, before it resolves', async () => {
    service.signIn.mockRejectedValueOnce({ code: 'network_error' });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.signIn('user@example.com', 'secret1')).rejects.toBeTruthy();
    });
    expect(result.current.error).toBe('network_error');

    let resolveSignIn: (value: unknown) => void = () => {};
    service.signIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      }) as never,
    );

    let signInPromise!: Promise<void>;
    act(() => {
      signInPromise = result.current.signIn('user@example.com', 'secret1');
    });

    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolveSignIn({ session: null, user: null });
      await signInPromise;
    });
  });

  // @s4 — signOut delegates to AuthService.
  it('signOut calls AuthService.signOut', async () => {
    service.signOut.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(service.signOut).toHaveBeenCalledWith();
  });

  // @s4 — isSubmitting mirrors the same in-flight/resolved lifecycle for signOut.
  it('sets isSubmitting true during sign-out and false after it resolves', async () => {
    let resolveSignOut: (value: unknown) => void = () => {};
    service.signOut.mockReturnValue(
      new Promise((resolve) => {
        resolveSignOut = resolve;
      }) as never,
    );
    const { result } = renderHook(() => useAuth());

    let signOutPromise!: Promise<void>;
    act(() => {
      signOutPromise = result.current.signOut();
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSignOut(undefined);
      await signOutPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  // @s3 — isSubmitting also returns to false when the sign-in call rejects (not just resolves).
  it('sets isSubmitting back to false after a failed sign-in', async () => {
    service.signIn.mockRejectedValue(new Error('invalid_credentials'));
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.signIn('user@example.com', 'wrong')).rejects.toThrow();
    });

    expect(result.current.isSubmitting).toBe(false);
  });

  // Guard against a hypothetical AuthService contract violation (Round-1 slice-2 review,
  // Minor 4) — if signIn ever rejects with a cause lacking a valid string `.code`, useAuth must
  // not trust an unchecked `as AuthError` cast (which would silently read `undefined`); it falls
  // back to the safe network_error default instead.
  it('falls back to network_error when the rejected cause has no valid string code', async () => {
    service.signIn.mockRejectedValueOnce({ message: 'boom' });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.signIn('user@example.com', 'wrong')).rejects.toBeTruthy();
    });

    expect(result.current.error).toBe('network_error');
  });

  // Full-review Round 1, Minor 7 — isAuthErrorShape only checked `typeof code === 'string'`, not
  // actual membership in the closed AuthErrorCode union, so an out-of-union string code would
  // have silently passed through instead of falling back to the safe network_error default.
  it('falls back to network_error when the rejected cause has a string code outside the AuthErrorCode union', async () => {
    service.signIn.mockRejectedValueOnce({ code: 'something_else' });
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.signIn('user@example.com', 'wrong')).rejects.toBeTruthy();
    });

    expect(result.current.error).toBe('network_error');
  });

  // Memoization — signIn/signOut must stay referentially stable across re-renders that
  // don't change any dependency, so a memoized consumer (e.g. React.memo'd button) never
  // re-renders needlessly.
  it('keeps signIn and signOut referentially stable across re-renders', () => {
    const { result, rerender } = renderHook(() => useAuth());

    const firstSignIn = result.current.signIn;
    const firstSignOut = result.current.signOut;

    rerender();

    expect(result.current.signIn).toBe(firstSignIn);
    expect(result.current.signOut).toBe(firstSignOut);
  });

  // Stale-closure guard — a signIn reference captured on an early render must still drive
  // the *current* isSubmitting state correctly on a later render, not a stale snapshot.
  it('a signIn reference captured on an earlier render still drives the current isSubmitting state', async () => {
    let resolveSignIn: (value: unknown) => void = () => {};
    service.signIn.mockReturnValue(
      new Promise((resolve) => {
        resolveSignIn = resolve;
      }) as never,
    );
    const { result, rerender } = renderHook(() => useAuth());
    const signInFromFirstRender = result.current.signIn;

    rerender();

    let signInPromise!: Promise<void>;
    act(() => {
      signInPromise = signInFromFirstRender('user@example.com', 'secret1');
    });

    expect(result.current.isSubmitting).toBe(true);

    await act(async () => {
      resolveSignIn({ session: null, user: null });
      await signInPromise;
    });

    expect(result.current.isSubmitting).toBe(false);
  });
});
