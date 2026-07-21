import { afterEach, expect, test } from "bun:test";
import { fetchMediaToken } from "./media-api";
import type { MediaToken } from "./types";

const originalFetch = globalThis.fetch;

type FetchImpl = (input: RequestInfo | URL, init?: RequestInit) => Response;

function stubFetch(impl: FetchImpl): void {
  // Test double for the boundary; cast is justified — a bare async fn is a valid fetch stub.
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
    impl(input, init)) as typeof fetch;
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const token: MediaToken = { token: "jwt", url: "ws://livekit", identity: "neo", role: "streamer" };

test("returns a parsed token on 200", async () => {
  stubFetch(() => new Response(JSON.stringify(token), { status: 200 }));
  expect(await fetchMediaToken("room", "k")).toEqual({ ok: true, value: token });
});

test("sends the creatorKey as Authorization: Bearer when held", async () => {
  let auth = "";
  let url = "";
  stubFetch((requestUrl, init) => {
    url = String(requestUrl);
    auth = new Headers(init?.headers).get("Authorization") ?? "";
    return new Response(JSON.stringify(token), { status: 200 });
  });
  await fetchMediaToken("a/b", "secret");
  expect(url).toBe("/streams/a%2Fb/media-token");
  expect(auth).toBe("Bearer secret");
});

test("omits Authorization when no key is held", async () => {
  let hasAuth = true;
  stubFetch((_url, init) => {
    hasAuth = new Headers(init?.headers).has("Authorization");
    return new Response(JSON.stringify({ ...token, role: "viewer" }), { status: 200 });
  });
  await fetchMediaToken("room");
  expect(hasAuth).toBe(false);
});

test("flags a malformed token (bad role)", async () => {
  stubFetch(() => new Response(JSON.stringify({ ...token, role: "admin" }), { status: 200 }));
  expect(await fetchMediaToken("room")).toEqual({ ok: false, error: { kind: "malformed" } });
});

test("flags a token missing a field", async () => {
  stubFetch(() => new Response(JSON.stringify({ token: "x", url: "y" }), { status: 200 }));
  expect(await fetchMediaToken("room")).toEqual({ ok: false, error: { kind: "malformed" } });
});

test("surfaces a 404 for a nonexistent room", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "no room" }), { status: 404 }));
  expect(await fetchMediaToken("room", "k")).toEqual({
    ok: false,
    error: { kind: "http", status: 404 },
  });
});

test("surfaces a network failure", async () => {
  stubFetch(() => {
    throw new TypeError("offline");
  });
  expect(await fetchMediaToken("room")).toEqual({ ok: false, error: { kind: "network" } });
});
