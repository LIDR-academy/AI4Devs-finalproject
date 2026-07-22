import type { AuthSession, SessionInfo } from "./auth-session";

/** A drivable in-memory `AuthSession` for tests (task 1.3): set signed-in/username/token,
 *  make magic-link consumption fail, and inspect recorded calls. Never touches the SDK or the
 *  network, so unit tests stay deterministic and DOM-free. */

export type FakeAuthState = {
  signedIn: boolean;
  username?: string;
  token?: string;
  /** When true, `consumeMagicLink` rejects (models a bad/expired link). */
  consumeFails: boolean;
};

export type FakeCalls = {
  init: number;
  resolve: number;
  getAccessToken: number;
  requestMagicLink: string[];
  consumeMagicLink: number;
  signOut: number;
};

export type FakeAuthSession = AuthSession & {
  readonly state: FakeAuthState;
  readonly calls: FakeCalls;
  /** Drive the fake into a signed-in state with an optional access token. */
  setSignedIn(username: string, token?: string): void;
  /** Drive the fake into a signed-out state. */
  setSignedOut(): void;
};

/** Create a fake session, optionally starting signed in. */
export function createFakeAuthSession(initial: Partial<FakeAuthState> = {}): FakeAuthSession {
  const state: FakeAuthState = {
    signedIn: initial.signedIn ?? false,
    username: initial.username,
    token: initial.token,
    consumeFails: initial.consumeFails ?? false,
  };
  const calls: FakeCalls = {
    init: 0,
    resolve: 0,
    getAccessToken: 0,
    requestMagicLink: [],
    consumeMagicLink: 0,
    signOut: 0,
  };

  const info = (): SessionInfo =>
    state.signedIn ? { signedIn: true, username: state.username } : { signedIn: false };

  return {
    state,
    calls,
    setSignedIn(username, token) {
      state.signedIn = true;
      state.username = username;
      state.token = token;
    },
    setSignedOut() {
      state.signedIn = false;
      state.username = undefined;
      state.token = undefined;
    },
    init() {
      calls.init += 1;
    },
    async resolve() {
      calls.resolve += 1;
      return info();
    },
    async getAccessToken() {
      calls.getAccessToken += 1;
      return state.signedIn ? state.token : undefined;
    },
    async requestMagicLink(email) {
      calls.requestMagicLink.push(email);
    },
    async consumeMagicLink() {
      calls.consumeMagicLink += 1;
      if (state.consumeFails) {
        throw new Error("magic link could not be consumed");
      }
      state.signedIn = true;
      return info();
    },
    async signOut() {
      calls.signOut += 1;
      state.signedIn = false;
      state.username = undefined;
      state.token = undefined;
    },
  };
}
