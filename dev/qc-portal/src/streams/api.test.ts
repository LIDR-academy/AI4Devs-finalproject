import { afterEach, expect, test } from "bun:test";
import { createStream, endStream, listStreams } from "./api";

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

test("createStream returns the created stream with a creatorKey on 201", async () => {
  stubFetch(
    () =>
      new Response(
        JSON.stringify({ id: "x", username: "u", title: "T", description: "d", creatorKey: "k" }),
        { status: 201 },
      ),
  );
  expect(await createStream({ username: "u", title: "T", description: "d" })).toEqual({
    ok: true,
    value: { id: "x", username: "u", title: "T", description: "d", creatorKey: "k" },
  });
});

test("createStream flags a 201 body without a creatorKey", async () => {
  stubFetch(
    () =>
      new Response(JSON.stringify({ id: "x", username: "u", title: "T", description: "d" }), {
        status: 201,
      }),
  );
  expect(await createStream({ username: "u", title: "T", description: "d" })).toEqual({
    ok: false,
    error: { kind: "malformed" },
  });
});

test("createStream surfaces a 400", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "bad" }), { status: 400 }));
  expect(await createStream({ username: "", title: "", description: "" })).toEqual({
    ok: false,
    error: { kind: "http", status: 400 },
  });
});

test("createStream POSTs username, title, description as JSON to /streams", async () => {
  let url = "";
  let init: RequestInit | undefined;
  stubFetch((requestUrl, requestInit) => {
    url = String(requestUrl);
    init = requestInit;
    return new Response(
      JSON.stringify({ id: "x", username: "u", title: "T", description: "d", creatorKey: "k" }),
      { status: 201 },
    );
  });
  await createStream({ username: "u", title: "T", description: "d" });
  expect(url).toBe("/streams");
  expect(init?.method).toBe("POST");
  expect(JSON.parse(String(init?.body))).toEqual({ username: "u", title: "T", description: "d" });
});

test("endStream returns ok on 204", async () => {
  stubFetch(() => new Response(null, { status: 204 }));
  expect(await endStream("x", "k")).toEqual({ ok: true, value: null });
});

test("endStream surfaces a 404", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "gone" }), { status: 404 }));
  expect(await endStream("x", "k")).toEqual({ ok: false, error: { kind: "http", status: 404 } });
});

test("endStream surfaces a 403 (wrong or absent key)", async () => {
  stubFetch(() => new Response(JSON.stringify({ error: "forbidden" }), { status: 403 }));
  expect(await endStream("x", "bad")).toEqual({ ok: false, error: { kind: "http", status: 403 } });
});

test("endStream sends the creatorKey as an Authorization: Bearer header", async () => {
  let auth = "";
  stubFetch((_url, init) => {
    auth = new Headers(init?.headers).get("Authorization") ?? "";
    return new Response(null, { status: 204 });
  });
  await endStream("x", "secret-key");
  expect(auth).toBe("Bearer secret-key");
});

test("endStream encodes the id in the path", async () => {
  let url = "";
  stubFetch((requestUrl) => {
    url = String(requestUrl);
    return new Response(null, { status: 204 });
  });
  await endStream("a/b", "k");
  expect(url).toBe("/streams/a%2Fb");
});
