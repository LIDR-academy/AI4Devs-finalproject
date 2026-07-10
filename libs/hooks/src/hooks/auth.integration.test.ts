import { act, renderHook, waitFor } from '@testing-library/react';
import { initSupabase } from '@helsoft/services';
import type { Session, SupabaseClient } from '@helsoft/services';

import { useAuth } from './use-auth';
import { useSession } from './use-session';

type EmitAuthStateChange = Parameters<SupabaseClient['auth']['onAuthStateChange']>[0];

/**
 * Slice-1 integration (login-and-logout): useAuth -> AuthService -> AuthDao and
 * useSession, both exercised for real, against a mocked Supabase client boundary
 * (only `auth.*` methods are stubbed — nothing above the DAO is mocked).
 *
 * One real `SupabaseClient` is built for the whole file and reused by every test (rather
 * than one per test) — matching how the app calls `initSupabase()` exactly once at startup
 * — so @supabase/supabase-js never sees more than one GoTrueClient instance for the same
 * storage key and never logs its "Multiple GoTrueClient instances" console.warn.
 */
let sharedClient: SupabaseClient;

const buildMockedClient = (): { client: SupabaseClient; emit: (session: Session | null) => void } => {
  let emitAuthStateChange: EmitAuthStateChange | undefined;
  jest.spyOn(sharedClient.auth, 'onAuthStateChange').mockImplementation((callback) => {
    emitAuthStateChange = callback;
    return { data: { subscription: { unsubscribe: jest.fn() } } } as never;
  });
  return {
    client: sharedClient,
    emit: (session) => emitAuthStateChange?.(session ? 'SIGNED_IN' : 'SIGNED_OUT', session),
  };
};

describe('login-and-logout slice-1 integration', () => {
  let warnSpy: jest.SpyInstance;

  beforeAll(() => {
    warnSpy = jest.spyOn(console, 'warn');
    sharedClient = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  // @s1 — with no session, useSession (which drives the app's Stack.Protected guard)
  // reports unauthenticated.
  it('reports no session at startup when none is persisted', async () => {
    const { client } = buildMockedClient();
    jest.spyOn(client.auth, 'getSession').mockResolvedValue({ data: { session: null }, error: null } as never);

    const { result } = renderHook(() => useSession());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.session).toBeNull();
  });

  // @s2 — signing in through useAuth (-> AuthService -> AuthDao -> Supabase) establishes a
  // session that useSession observes, without either hook calling the other directly.
  it('signing in establishes a session that useSession observes', async () => {
    const { client, emit } = buildMockedClient();
    jest.spyOn(client.auth, 'getSession').mockResolvedValue({ data: { session: null }, error: null } as never);
    const session = { access_token: 'tok-1' } as Session;
    jest.spyOn(client.auth, 'signInWithPassword').mockImplementation(async () => {
      emit(session);
      return { data: { session, user: { id: 'u1' } }, error: null } as never;
    });

    const { result } = renderHook(() => ({ session: useSession(), auth: useAuth() }));
    await waitFor(() => expect(result.current.session.isLoading).toBe(false));
    expect(result.current.session.session).toBeNull();

    await act(async () => {
      await result.current.auth.signIn('user@example.com', 'secret1');
    });

    expect(result.current.session.session).toBe(session);
  });

  // @s4 — signing out through useAuth clears the session useSession observes.
  it('signing out clears the session that useSession observes', async () => {
    const { client, emit } = buildMockedClient();
    const session = { access_token: 'tok-2' } as Session;
    jest.spyOn(client.auth, 'getSession').mockResolvedValue({ data: { session }, error: null } as never);
    jest.spyOn(client.auth, 'signOut').mockImplementation(async () => {
      emit(null);
      return { error: null } as never;
    });

    const { result } = renderHook(() => ({ session: useSession(), auth: useAuth() }));
    await waitFor(() => expect(result.current.session.isLoading).toBe(false));
    expect(result.current.session.session).toBe(session);

    await act(async () => {
      await result.current.auth.signOut();
    });

    expect(result.current.session.session).toBeNull();
  });

  // @s7 — a previously-persisted session is restored on a fresh mount (no manual credentials).
  it('restores a persisted session on a fresh mount without re-entering credentials', async () => {
    const { client } = buildMockedClient();
    const persisted = { access_token: 'persisted-tok' } as Session;
    jest.spyOn(client.auth, 'getSession').mockResolvedValue({ data: { session: persisted }, error: null } as never);

    const { result } = renderHook(() => useSession());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.session).toBe(persisted);
  });

  // Regression guard (Round-1 review, Minor 5): this file used to call initSupabase() fresh
  // in every test, which trips @supabase/supabase-js's "Multiple GoTrueClient instances"
  // console.warn from the second client onward — harmless to assertions, but noisy. The
  // client is now built once and reused, so no such warning should ever fire.
  it('does not trigger a "Multiple GoTrueClient instances" warning across this file', () => {
    const messages = warnSpy.mock.calls.map((call) => String(call[0]));

    expect(messages.some((message) => message.includes('Multiple GoTrueClient instances'))).toBe(false);
  });
});
