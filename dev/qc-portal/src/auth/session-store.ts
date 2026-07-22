// Type-only import keeps `supertokens-web-js` (imported by auth-session) out of the store's
// runtime graph, so tests inject a fake AuthSession and never load the SDK.
import type { AuthSession } from "./auth-session";

/** The reactive session store (design D-P2). Holds the signed-in state + username that the
 *  UI renders from, backed by an injected `AuthSession`. Tests call `setAuthSession(fake)`. */

export type SessionStatus = "loading" | "anonymous" | "signed-in";
export type SessionState = { readonly status: SessionStatus; readonly username?: string };

let authSession: AuthSession | null = null;
let state: SessionState = { status: "loading" };
const subscribers = new Set<() => void>();

/** Install the AuthSession (real at app start, fake in tests). */
export function setAuthSession(session: AuthSession): void {
  authSession = session;
}

export function sessionState(): SessionState {
  return state;
}

export function isSignedIn(): boolean {
  return state.status === "signed-in";
}

export function currentUsername(): string | undefined {
  return state.username;
}

export function subscribe(handler: () => void): () => void {
  subscribers.add(handler);
  return () => subscribers.delete(handler);
}

function setState(next: SessionState): void {
  state = next;
  for (const handler of subscribers) {
    handler();
  }
}

/** Resolve the current session once on boot and publish it to subscribers. */
export async function resolveSession(): Promise<void> {
  if (authSession === null) {
    setState({ status: "anonymous" });
    return;
  }
  const info = await authSession.resolve();
  setState(
    info.signedIn ? { status: "signed-in", username: info.username } : { status: "anonymous" },
  );
}

/** The current access token for authenticated requests, or undefined when signed out. */
export async function accessToken(): Promise<string | undefined> {
  return authSession === null ? undefined : authSession.getAccessToken();
}

export async function requestMagicLink(email: string): Promise<void> {
  if (authSession !== null) {
    await authSession.requestMagicLink(email);
  }
}

/** Consume the magic link on the landing route; updates the store on success. */
export async function consumeMagicLink(): Promise<boolean> {
  if (authSession === null) {
    return false;
  }
  try {
    const info = await authSession.consumeMagicLink();
    setState({ status: "signed-in", username: info.username });
    return true;
  } catch {
    return false;
  }
}

/** Sign out and return the store to anonymous. Stream-ending is handled by the sign-out flow. */
export async function signOutSession(): Promise<void> {
  if (authSession !== null) {
    await authSession.signOut();
  }
  setState({ status: "anonymous" });
}
