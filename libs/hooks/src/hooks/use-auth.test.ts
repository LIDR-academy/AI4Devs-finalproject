jest.mock('@helsoft/services', () => ({
  AuthService: {
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

import { act, renderHook } from '@testing-library/react';
import { AuthService } from '@helsoft/services';

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
});
