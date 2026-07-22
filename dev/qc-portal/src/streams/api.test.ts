import { afterEach, beforeEach, expect, test } from "bun:test";
import { createFakeAuthSession } from "../auth/auth-session.fake";
import { setAuthSession } from "../auth/session-store";
import { createStream, endStream, listStreams } from "./api";

const originalFetch = globalThis.fetch;

type FetchImpl = (input: RequestInfo | URL, init?: RequestInit) => Response;

function stubFetch(impl: FetchImpl): void {
  // Test double for the boundary; cast is justified — a bare async fn is a valid fetch stub.
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) =>
    impl(input, init)) as typeof fetch;
}

beforeEach(() => {
  // Default to signed-in with a token so protected calls carry the Bearer header.
  setAuthSession(createFakeAuthSession({ signedIn: true, username: "u", token: "tok" }));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("listStreams returns streams on 200", async () => {
  stubFetch(
    () =>
      new Response(JSON.stringify([{ id: "a", username: "u", title: "T", description: "" }]), {
        status: 200,
      }),
  );
  expect(await listStreams()).toEqual({
    ok: true,
    value: [{ id: "a", username: "u", title: "T", description: "" }],
  });
});

test("listStreams returns an empty array", async () => {
  stubFetch(() => new Response("[]", { status: 200 }));
  expect(await listStreams()).toEqual({ ok: true, value: [] });
});

test("listStreams flags a stream missing username", async () => {
  stubFetch(
    () => new Response(JSON.stringify([{ id: "a", title: "T", description: "" }]), { status: 200 }),
  );
  expect(await listStreams()).toEqual({ ok: false, error: { kind: "malformed" } });
});

test("listStreams flags a non-JSON body", async () => {
  stubFetch(() => new Response("not json", { status: 200 }));
  expect(await listStreams()).toEqual({ ok: false, error: { kind: "malformed" } });
});

test("listStreams surfaces an http error status", async () => {
  stubFetch(() => new Response("{}", { status: 500 }));
  expect(await listStreams()).toEqual({ ok: false, error: { kind: "http", status: 500 } });
});

test("listStreams surfaces a network failure", async () => {
  stubFetch(() => {
    throw new TypeError("offline");
  });
  expect(await listStreams()).toEqual({ ok: false, error: { kind: "network" } });
});

test("listStreams is a public read — no Authorization header", async () => {
  let auth = "";
  stubFetch((_url, init) => {
    auth = new Headers(init?.headers).get("Authorization") ?? "";
    return new Response("[]", { status: 200 });
  });
  await listStreams();
  expect(auth).toBe("");
});

test("createStream returns the created stream on 201 (no creatorKey)", async () => {
  stubFetch(
    () =>
      new Response(JSON.stringify({ id: "x", username: "u", title: "T", description: "d" }), {
        status: 201,
      }),
  );
  expect(await createStream({ title: "T", description: "d" })).toEqual({
    ok: true,
    value: { id: "x", username: "u", title: "T", description: "d" },
  });
});

test("createStream flags a malformed 201 body", async () => {
  stubFetch(() => new Response(JSON.stringify({ id: "x", title: "T" }), { status: 201 }));
  expect(await createStream({ title: "T", description: "d" })).toEqual({
    ok: false,
    error: { kind: "malformed" },
  });
});

test("createStream surfaces a 401 (unauthenticated)", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "unauth" }), { status: 401 }));
  expect(await createStream({ title: "T", description: "d" })).toEqual({
    ok: false,
    error: { kind: "http", status: 401 },
  });
});

test("createStream surfaces a 409 (already streaming)", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "conflict" }), { status: 409 }));
  expect(await createStream({ title: "T", description: "d" })).toEqual({
    ok: false,
    error: { kind: "http", status: 409 },
  });
});

test("createStream surfaces a 400", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "bad" }), { status: 400 }));
  expect(await createStream({ title: "", description: "" })).toEqual({
    ok: false,
    error: { kind: "http", status: 400 },
  });
});

test("createStream POSTs title + description (no username) as JSON with a Bearer token", async () => {
  let url = "";
  let init: RequestInit | undefined;
  stubFetch((requestUrl, requestInit) => {
    url = String(requestUrl);
    init = requestInit;
    return new Response(JSON.stringify({ id: "x", username: "u", title: "T", description: "d" }), {
      status: 201,
    });
  });
  await createStream({ title: "T", description: "d" });
  expect(url).toBe("/streams");
  expect(init?.method).toBe("POST");
  expect(JSON.parse(String(init?.body))).toEqual({ title: "T", description: "d" });
  expect(new Headers(init?.headers).get("Authorization")).toBe("Bearer tok");
});

test("endStream returns ok on 204", async () => {
  stubFetch(() => new Response(null, { status: 204 }));
  expect(await endStream("x")).toEqual({ ok: true, value: null });
});

test("endStream surfaces a 404 (already ended)", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "gone" }), { status: 404 }));
  expect(await endStream("x")).toEqual({ ok: false, error: { kind: "http", status: 404 } });
});

test("endStream surfaces a 403 (not the owner)", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "forbidden" }), { status: 403 }));
  expect(await endStream("x")).toEqual({ ok: false, error: { kind: "http", status: 403 } });
});

test("endStream sends the session's Bearer token", async () => {
  let auth = "";
  stubFetch((_url, init) => {
    auth = new Headers(init?.headers).get("Authorization") ?? "";
    return new Response(null, { status: 204 });
  });
  await endStream("x");
  expect(auth).toBe("Bearer tok");
});

test("endStream encodes the id in the path", async () => {
  let url = "";
  stubFetch((requestUrl) => {
    url = String(requestUrl);
    return new Response(null, { status: 204 });
  });
  await endStream("a/b");
  expect(url).toBe("/streams/a%2Fb");
});
