import { expect, test } from "bun:test";
import type { ApiResult } from "../streams/api";
import type { HistoryPage } from "./chat-api";
import {
  type ChatHandlers,
  type ChatIdentity,
  type ChatSocket,
  type ChatStatus,
  createChatClient,
  isTerminalReason,
  type SocketFactory,
  type SocketListeners,
  TERMINAL_REASONS,
} from "./chat-client";
import type { ChatMessage } from "./frames";

type FakeSocket = ChatSocket & {
  readonly listeners: SocketListeners;
  readonly sent: string[];
  closed: boolean;
  open(): void;
  emit(frame: unknown): void;
  drop(): void;
};

function message(id: string, text = "m"): ChatMessage {
  return { id, sender: "u", role: "viewer", text, ts: "2026-01-01T00:00:00Z" };
}

const flush = (): Promise<void> => new Promise((resolve) => queueMicrotask(resolve));

function harness(creatorKey?: string) {
  const sockets: FakeSocket[] = [];
  const events = {
    reset: [] as ChatMessage[][],
    append: [] as ChatMessage[],
    prepend: [] as ChatMessage[][],
    status: [] as ChatStatus[],
    identity: [] as ChatIdentity[],
    errors: [] as string[],
  };
  const handlers: ChatHandlers = {
    onReset: (m) => events.reset.push(m),
    onAppend: (m) => events.append.push(m),
    onPrepend: (m) => events.prepend.push(m),
    onStatus: (s) => events.status.push(s),
    onIdentity: (i) => events.identity.push(i),
    onErrorMessage: (r) => events.errors.push(r),
  };

  const socketFactory: SocketFactory = (_url, listeners) => {
    const s: FakeSocket = {
      listeners,
      sent: [],
      closed: false,
      send: (d) => s.sent.push(d),
      close: () => {
        s.closed = true;
        listeners.onClose();
      },
      open: () => listeners.onOpen(),
      emit: (frame) => listeners.onMessage(JSON.stringify(frame)),
      drop: () => listeners.onClose(),
    };
    sockets.push(s);
    return s;
  };

  let scheduled: (() => void) | null = null;
  const schedule = (_attempt: number, run: () => void): void => {
    scheduled = run;
  };

  let resolveInitial!: (result: ApiResult<HistoryPage>) => void;
  const initialPromise = new Promise<ApiResult<HistoryPage>>((res) => {
    resolveInitial = res;
  });
  const olderQueue: ApiResult<HistoryPage>[] = [];
  const historyCalls: (string | undefined)[] = [];
  const loadHistory = (_id: string, before?: string): Promise<ApiResult<HistoryPage>> => {
    historyCalls.push(before);
    if (before === undefined) {
      return initialPromise;
    }
    return Promise.resolve(olderQueue.shift() ?? { ok: false, error: { kind: "malformed" } });
  };

  // Uses the real default terminal matcher (exact match against TERMINAL_REASONS).
  const client = createChatClient("room", creatorKey, handlers, {
    socketFactory,
    loadHistory,
    schedule,
  });

  return {
    client,
    events,
    historyCalls,
    last: (): FakeSocket => {
      const s = sockets.at(-1);
      if (s === undefined) {
        throw new Error("no socket created");
      }
      return s;
    },
    socketCount: (): number => sockets.length,
    resolveInitial,
    queueOlder: (result: ApiResult<HistoryPage>): void => {
      olderQueue.push(result);
    },
    runScheduled: (): void => {
      if (scheduled === null) {
        throw new Error("no reconnect scheduled");
      }
      const run = scheduled;
      scheduled = null;
      run();
    },
    scheduledPending: (): boolean => scheduled !== null,
  };
}

test("join omits creatorKey when none is held, includes it when held", () => {
  const noKey = harness();
  noKey.client.connect();
  noKey.last().open();
  expect(JSON.parse(noKey.last().sent[0] ?? "{}")).toEqual({ type: "join" });

  const withKey = harness("K");
  withKey.client.connect();
  withKey.last().open();
  expect(JSON.parse(withKey.last().sent[0] ?? "{}")).toEqual({ type: "join", creatorKey: "K" });
});

test("welcome frame yields identity", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  h.last().emit({ type: "welcome", sender: "falcon-x1", role: "streamer" });
  expect(h.events.identity).toEqual([{ sender: "falcon-x1", role: "streamer" }]);
});

test("a message arriving during load and also in history appears exactly once", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  // Live frame arrives before history resolves → buffered.
  h.last().emit({ type: "message", message: message("m1") });
  h.resolveInitial({
    ok: true,
    value: { messages: [message("m0"), message("m1")], nextCursor: null },
  });
  await flush();
  expect(h.events.reset).toEqual([[message("m0"), message("m1")]]);
  expect(h.events.append).toEqual([]); // m1 already in history → not re-appended
});

test("a distinct message arriving during load is appended once after history", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  h.last().emit({ type: "message", message: message("m2") });
  h.resolveInitial({ ok: true, value: { messages: [message("m0")], nextCursor: null } });
  await flush();
  expect(h.events.reset).toEqual([[message("m0")]]);
  expect(h.events.append).toEqual([message("m2")]);
});

test("malformed frames are dropped", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  h.resolveInitial({ ok: true, value: { messages: [], nextCursor: null } });
  await flush();
  h.last().listeners.onMessage("not json");
  h.last().emit({ type: "mystery" });
  expect(h.events.append).toEqual([]);
});

test("a non-terminal error frame is surfaced, not added to the log", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  h.resolveInitial({ ok: true, value: { messages: [], nextCursor: null } });
  await flush();
  h.last().emit({ type: "error", reason: "message is empty" });
  expect(h.events.errors).toEqual(["message is empty"]);
  expect(h.events.append).toEqual([]);
  expect(h.events.status.at(-1)).toBe("live"); // not terminal
});

test("a transient drop reconnects and re-joins", async () => {
  const h = harness("K");
  h.client.connect();
  h.last().open();
  h.resolveInitial({ ok: true, value: { messages: [], nextCursor: null } });
  await flush();
  const firstCount = h.socketCount();
  h.last().drop();
  expect(h.events.status).toContain("reconnecting");
  h.runScheduled();
  expect(h.socketCount()).toBe(firstCount + 1);
  h.last().open();
  expect(JSON.parse(h.last().sent[0] ?? "{}")).toEqual({ type: "join", creatorKey: "K" });
});

test("room ended is terminal: status ended and no reconnect", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  h.resolveInitial({ ok: true, value: { messages: [], nextCursor: null } });
  await flush();
  h.last().emit({ type: "error", reason: "room ended" });
  expect(h.events.status.at(-1)).toBe("ended");
  expect(h.scheduledPending()).toBe(false);
});

test("room not found is terminal: status ended and no reconnect", () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  // A join to a nonexistent room errors before any history resolves.
  h.last().emit({ type: "error", reason: "room not found" });
  expect(h.events.status.at(-1)).toBe("ended");
  expect(h.scheduledPending()).toBe(false);
});

test("isTerminalReason exact-matches the agreed terminal set", () => {
  expect(TERMINAL_REASONS).toEqual(new Set(["room ended", "room not found", "expected join"]));
  expect(isTerminalReason("room ended")).toBe(true);
  expect(isTerminalReason("room not found")).toBe(true);
  expect(isTerminalReason("expected join")).toBe(true);
  // Non-terminal: validation and other errors stay inline; case must match exactly.
  expect(isTerminalReason("message is empty")).toBe(false);
  expect(isTerminalReason("message must be at most 500 characters")).toBe(false);
  expect(isTerminalReason("invalid frame")).toBe(false);
  expect(isTerminalReason("could not send message")).toBe(false);
  expect(isTerminalReason("Room Ended")).toBe(false);
});

test("an unknown error reason immediately followed by a close is terminal (invariant)", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  h.resolveInitial({ ok: true, value: { messages: [], nextCursor: null } });
  await flush();
  // A reason not in the known terminal set, but the server closes right after → terminal.
  h.last().emit({ type: "error", reason: "some future terminal reason" });
  h.last().drop();
  expect(h.events.status.at(-1)).toBe("ended");
  expect(h.scheduledPending()).toBe(false);
});

test("a non-terminal error, then a message, then a drop reconnects (flag reset)", async () => {
  const h = harness("K");
  h.client.connect();
  h.last().open();
  h.resolveInitial({ ok: true, value: { messages: [], nextCursor: null } });
  await flush();
  h.last().emit({ type: "error", reason: "message is empty" });
  h.last().emit({ type: "message", message: message("mx") }); // resets the error-preceded-close flag
  h.last().drop();
  expect(h.events.status).toContain("reconnecting");
});

test("scroll-up loads older pages until the cursor is null, then stops", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  h.resolveInitial({ ok: true, value: { messages: [message("m5")], nextCursor: "c1" } });
  await flush();

  h.queueOlder({ ok: true, value: { messages: [message("m4")], nextCursor: "c2" } });
  await h.client.loadOlder();
  expect(h.events.prepend).toEqual([[message("m4")]]);

  h.queueOlder({ ok: true, value: { messages: [message("m3")], nextCursor: null } });
  await h.client.loadOlder();
  expect(h.events.prepend).toEqual([[message("m4")], [message("m3")]]);

  const callsBefore = h.historyCalls.length;
  await h.client.loadOlder(); // cursor is null now → no request
  expect(h.historyCalls.length).toBe(callsBefore);
});

test("user close does not reconnect", async () => {
  const h = harness();
  h.client.connect();
  h.last().open();
  h.resolveInitial({ ok: true, value: { messages: [], nextCursor: null } });
  await flush();
  h.client.close();
  expect(h.scheduledPending()).toBe(false);
});
