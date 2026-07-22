import { afterEach, expect, test } from "bun:test";
import { createFakeAuthSession } from "./auth-session.fake";
import { authedFetch } from "./authed-fetch";
import { setAuthSession } from "./session-store";

const originalFetch = globalThis.fetch;

function captureAuth(): { headerOf: () => string } {
  let auth = "";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    auth = new Headers(init?.headers).get("Authorization") ?? "";
    return new Response(null, { status: 204 });
  }) as typeof fetch;
  return { headerOf: () => auth };
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("attaches Authorization: Bearer <token> when signed in", async () => {
  setAuthSession(createFakeAuthSession({ signedIn: true, username: "ada", token: "tok-9" }));
  const capture = captureAuth();
  await authedFetch("/streams", { method: "POST" });
  expect(capture.headerOf()).toBe("Bearer tok-9");
});

test("omits the Authorization header when signed out", async () => {
  setAuthSession(createFakeAuthSession({ signedIn: false }));
  const capture = captureAuth();
  await authedFetch("/streams", { method: "POST" });
  expect(capture.headerOf()).toBe("");
});

test("preserves caller headers alongside the token", async () => {
  setAuthSession(createFakeAuthSession({ signedIn: true, username: "ada", token: "tok-9" }));
  let contentType = "";
  globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
    contentType = new Headers(init?.headers).get("Content-Type") ?? "";
    return new Response(null, { status: 204 });
  }) as typeof fetch;
  await authedFetch("/streams", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  expect(contentType).toBe("application/json");
});
