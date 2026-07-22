import SuperTokens from "supertokens-web-js";
import Passwordless from "supertokens-web-js/recipe/passwordless";
import Session from "supertokens-web-js/recipe/session";

/** The auth seam (design D-P1). This is the ONLY module that imports `supertokens-web-js`.
 *  The app depends on the `AuthSession` interface, not the SDK, so everything else is
 *  unit-testable with a fake — no SDK, no network. The real implementation is thin and is
 *  exercised by the compose E2E (the real magic-link loop), not by unit tests. */

/** A resolved session snapshot. `username` is the account username claim when signed in. */
export type SessionInfo = {
  readonly signedIn: boolean;
  readonly username?: string;
};

export type AuthSession = {
  /** Initialize the SDK (header mode, app's own origin). Called once at startup. */
  init(): void;
  /** Resolve the current session (does-session-exist + username claim). */
  resolve(): Promise<SessionInfo>;
  /** The current access token for `Authorization: Bearer`, or undefined if signed out. */
  getAccessToken(): Promise<string | undefined>;
  /** Request a magic link be emailed to `email`. */
  requestMagicLink(email: string): Promise<void>;
  /** Consume the magic link on the landing route; resolves to the new session. */
  consumeMagicLink(): Promise<SessionInfo>;
  signOut(): Promise<void>;
};

export type AuthSessionFactory = () => AuthSession;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function usernameFrom(payload: unknown): string | undefined {
  return isRecord(payload) && typeof payload.username === "string" ? payload.username : undefined;
}

/** The real session, backed by `supertokens-web-js` (Passwordless + Session recipes). */
export function createSuperTokensSession(): AuthSession {
  return {
    init() {
      SuperTokens.init({
        appInfo: {
          appName: "QuickChat",
          apiDomain: window.location.origin,
          apiBasePath: "/auth",
        },
        recipeList: [Session.init(), Passwordless.init()],
      });
    },
    async resolve() {
      if (!(await Session.doesSessionExist())) {
        return { signedIn: false };
      }
      const payload: unknown = await Session.getAccessTokenPayloadSecurely();
      return { signedIn: true, username: usernameFrom(payload) };
    },
    async getAccessToken() {
      return (await Session.getAccessToken()) ?? undefined;
    },
    async requestMagicLink(email) {
      await Passwordless.createCode({ email });
    },
    async consumeMagicLink() {
      const result = await Passwordless.consumeCode();
      if (result.status !== "OK") {
        throw new Error(`magic link could not be consumed: ${result.status}`);
      }
      const payload: unknown = await Session.getAccessTokenPayloadSecurely();
      return { signedIn: true, username: usernameFrom(payload) };
    },
    async signOut() {
      await Session.signOut();
    },
  };
}
