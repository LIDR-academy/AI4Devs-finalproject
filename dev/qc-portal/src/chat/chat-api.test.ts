import { afterEach, expect, test } from "bun:test";
import { fetchHistory } from "./chat-api";
import type { ChatMessage } from "./frames";

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

const msg: ChatMessage = {
  id: "1",
  sender: "u",
  role: "viewer",
  text: "hi",
  ts: "2026-01-01T00:00:00Z",
};

test("returns a page with a string nextCursor", async () => {
  stubFetch(
    () => new Response(JSON.stringify({ messages: [msg], nextCursor: "c1" }), { status: 200 }),
  );
  expect(await fetchHistory("room")).toEqual({
    ok: true,
    value: { messages: [msg], nextCursor: "c1" },
  });
});

test("accepts a null nextCursor", async () => {
  stubFetch(
    () => new Response(JSON.stringify({ messages: [], nextCursor: null }), { status: 200 }),
  );
  expect(await fetchHistory("room")).toEqual({
    ok: true,
    value: { messages: [], nextCursor: null },
  });
});

test("flags a malformed page", async () => {
  stubFetch(
    () =>
      new Response(JSON.stringify({ messages: [{ id: 1 }], nextCursor: null }), { status: 200 }),
  );
  expect(await fetchHistory("room")).toEqual({ ok: false, error: { kind: "malformed" } });
});

test("surfaces a 404 for a missing room", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "no room" }), { status: 404 }));
  expect(await fetchHistory("room")).toEqual({ ok: false, error: { kind: "http", status: 404 } });
});

test("requests the latest page with no before param", async () => {
  let url = "";
  stubFetch((requestUrl) => {
    url = String(requestUrl);
    return new Response(JSON.stringify({ messages: [], nextCursor: null }), { status: 200 });
  });
  await fetchHistory("a/b");
  expect(url).toBe("/streams/a%2Fb/messages");
});

test("encodes the before cursor in the query", async () => {
  let url = "";
  stubFetch((requestUrl) => {
    url = String(requestUrl);
    return new Response(JSON.stringify({ messages: [], nextCursor: null }), { status: 200 });
  });
  await fetchHistory("room", "cur sor");
  expect(url).toBe("/streams/room/messages?before=cur%20sor");
});
