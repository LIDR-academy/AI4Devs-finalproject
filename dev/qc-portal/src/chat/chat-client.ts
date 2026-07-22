import type { ApiResult } from "../streams/api";
import { fetchHistory, type HistoryPage } from "./chat-api";
import type { ChatMessage, Role } from "./frames";
import { encodeJoin, encodeMessage, parseServerFrame } from "./frames";

/** The chat client owns the WebSocket + history boundary and implements the
 *  history↔live reconciliation (design D-P2/D-P3, root D2). All side effects — the
 *  socket, the history fetch, and the reconnect backoff — are injected so the whole
 *  thing is testable with a fake socket and no real timers. */

export type ChatStatus = "connecting" | "live" | "reconnecting" | "ended";
export type ChatIdentity = { readonly sender: string; readonly role: Role };

/** UI callbacks. The client never touches the DOM; it emits through these. */
export type ChatHandlers = {
  onReset(messages: ChatMessage[]): void;
  onAppend(message: ChatMessage): void;
  onPrepend(messages: ChatMessage[]): void;
  onStatus(status: ChatStatus): void;
  onIdentity(identity: ChatIdentity): void;
  onErrorMessage(reason: string): void;
};

export type SocketListeners = {
  onOpen(): void;
  onMessage(data: string): void;
  onClose(): void;
  onError(): void;
};

export type ChatSocket = { send(data: string): void; close(): void };
export type SocketFactory = (url: string, listeners: SocketListeners) => ChatSocket;

export type ChatClientDeps = {
  readonly socketFactory?: SocketFactory;
  readonly loadHistory?: (streamId: string, before?: string) => Promise<ApiResult<HistoryPage>>;
  readonly schedule?: (attempt: number, run: () => void) => void;
  readonly isTerminalReason?: (reason: string) => boolean;
};

export type ChatClient = {
  connect(): void;
  send(text: string): void;
  loadOlder(): Promise<void>;
  close(): void;
};

const RECONNECT_BASE_MS = 500;
const RECONNECT_CAP_MS = 5000;

function defaultSchedule(attempt: number, run: () => void): void {
  const delay = Math.min(RECONNECT_CAP_MS, RECONNECT_BASE_MS * 2 ** (attempt - 1));
  setTimeout(run, delay);
}

/** The terminal error reasons (agreed, recorded micro-contract with streamer): the room
 *  is gone or the connection is unusable, so the client moves to a permanent "ended" state
 *  and stops reconnecting. Each terminal error is always immediately followed by a server
 *  close. Every other error (validation, "invalid frame", "could not send message") is
 *  non-terminal — the socket stays open and normal handling continues. `"expected join"`
 *  is included for completeness; the portal always sends a proper join, so it won't occur. */
export const TERMINAL_REASONS: ReadonlySet<string> = new Set([
  "room ended",
  "room not found",
  "expected join",
]);

/** Exact-match a server error reason against the terminal set. */
export function isTerminalReason(reason: string): boolean {
  return TERMINAL_REASONS.has(reason);
}

function defaultSocketFactory(url: string, listeners: SocketListeners): ChatSocket {
  const ws = new WebSocket(url);
  ws.addEventListener("open", () => listeners.onOpen());
  ws.addEventListener("message", (event: MessageEvent) => {
    if (typeof event.data === "string") {
      listeners.onMessage(event.data);
    }
  });
  ws.addEventListener("close", () => listeners.onClose());
  ws.addEventListener("error", () => listeners.onError());
  return { send: (data) => ws.send(data), close: () => ws.close() };
}

function buildWsUrl(streamId: string): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/streams/${encodeURIComponent(streamId)}/ws`;
}

/** Create a chat client for a room. `getToken` yields the current access token (or undefined
 *  when anonymous); it is resolved and sent on the `join` frame on each connect and reconnect. */
export function createChatClient(
  streamId: string,
  getToken: () => Promise<string | undefined>,
  handlers: ChatHandlers,
  deps: ChatClientDeps = {},
): ChatClient {
  const socketFactory = deps.socketFactory ?? defaultSocketFactory;
  const loadHistory = deps.loadHistory ?? fetchHistory;
  const schedule = deps.schedule ?? defaultSchedule;
  const terminalMatcher = deps.isTerminalReason ?? isTerminalReason;
  const url = buildWsUrl(streamId);

  let socket: ChatSocket | null = null;
  let reconciled = false;
  let initialLoaded = false;
  let closedByUser = false;
  let ended = false;
  let attempt = 0;
  let cursor: string | null = null;
  let loadingOlder = false;
  // Backstop for the streamer invariant: a (non-fast-path) error frame immediately
  // followed by a server close is terminal, even if its reason is not (yet) in the
  // known terminal set. Reset by any non-error frame and on each new connection.
  let errorPrecededClose = false;
  const pending: ChatMessage[] = [];
  const seen = new Set<string>();

  function setStatus(status: ChatStatus): void {
    handlers.onStatus(status);
  }

  function flushPending(): void {
    for (const message of pending) {
      if (!seen.has(message.id)) {
        seen.add(message.id);
        handlers.onAppend(message);
      }
    }
    pending.length = 0;
  }

  async function loadInitial(): Promise<void> {
    const result = await loadHistory(streamId);
    if (ended) {
      return;
    }
    if (!result.ok) {
      if (result.error.kind === "http" && result.error.status === 404) {
        toEnded();
        return;
      }
      // Other failures: start empty so live chat still flows.
      handlers.onReset([]);
      flushPending();
      reconciled = true;
      initialLoaded = true;
      setStatus("live");
      return;
    }
    const page = result.value;
    cursor = page.nextCursor;
    for (const message of page.messages) {
      seen.add(message.id);
    }
    handlers.onReset(page.messages);
    flushPending();
    reconciled = true;
    initialLoaded = true;
    setStatus("live");
  }

  function toEnded(): void {
    if (ended) {
      return;
    }
    ended = true;
    closedByUser = true;
    setStatus("ended");
    socket?.close();
    socket = null;
  }

  function handleFrame(data: string): void {
    const frame = parseServerFrame(data);
    if (frame === null) {
      return;
    }
    if (frame.type === "welcome") {
      errorPrecededClose = false;
      handlers.onIdentity({ sender: frame.sender, role: frame.role });
      return;
    }
    if (frame.type === "error") {
      if (terminalMatcher(frame.reason)) {
        toEnded();
        return;
      }
      // Non-terminal by reason: surface it inline. If a close follows immediately,
      // handleClose treats it as terminal via the invariant.
      errorPrecededClose = true;
      handlers.onErrorMessage(frame.reason);
      return;
    }
    errorPrecededClose = false;
    const message = frame.message;
    if (!reconciled) {
      pending.push(message);
      return;
    }
    if (seen.has(message.id)) {
      return;
    }
    seen.add(message.id);
    handlers.onAppend(message);
  }

  function handleClose(): void {
    socket = null;
    if (closedByUser || ended) {
      return;
    }
    if (errorPrecededClose) {
      // Invariant: an error frame immediately followed by a server close is terminal.
      ended = true;
      setStatus("ended");
      return;
    }
    // A bare close with no preceding error frame is a transient drop → reconnect.
    setStatus("reconnecting");
    attempt += 1;
    schedule(attempt, () => {
      if (!closedByUser && !ended) {
        openSocket();
      }
    });
  }

  function openSocket(): void {
    setStatus(initialLoaded ? "reconnecting" : "connecting");
    socket = socketFactory(url, {
      onOpen: () => {
        attempt = 0;
        errorPrecededClose = false;
        // Join carries a fresh access token (signed in) each connect/reconnect (D6).
        void (async () => {
          socket?.send(encodeJoin(await getToken()));
        })();
        if (!initialLoaded) {
          void loadInitial();
        } else {
          setStatus("live");
        }
      },
      onMessage: handleFrame,
      onClose: handleClose,
      onError: () => {
        // A socket error is followed by a close; handleClose drives reconnect.
      },
    });
  }

  return {
    connect(): void {
      closedByUser = false;
      openSocket();
    },
    send(text: string): void {
      socket?.send(encodeMessage(text));
    },
    async loadOlder(): Promise<void> {
      if (cursor === null || loadingOlder) {
        return;
      }
      loadingOlder = true;
      const result = await loadHistory(streamId, cursor);
      loadingOlder = false;
      if (!result.ok) {
        return;
      }
      cursor = result.value.nextCursor;
      const fresh = result.value.messages.filter((message) => !seen.has(message.id));
      for (const message of fresh) {
        seen.add(message.id);
      }
      if (fresh.length > 0) {
        handlers.onPrepend(fresh);
      }
    },
    close(): void {
      closedByUser = true;
      socket?.close();
      socket = null;
    },
  };
}
