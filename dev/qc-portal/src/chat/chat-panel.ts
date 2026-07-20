import van from "vanjs-core";
import { COPY } from "../streams/copy";
import { getCreatorKey } from "../streams/creator-key";
import { type ChatHandlers, type ChatStatus, createChatClient } from "./chat-client";
import { createComposer } from "./composer";
import { createMessageList } from "./message-list";

/** The chat panel wires the message list + composer to a chat controller. The controller
 *  is injected (defaults to the real chat client) so the wiring is testable with a fake. */

const { section, div, p } = van.tags;

export type ChatController = {
  connect(): void;
  send(text: string): void;
  loadOlder(): Promise<void>;
  close(): void;
};

export type ChatPanel = {
  readonly el: HTMLElement;
  mount(): void;
  unmount(): void;
};

function statusText(status: ChatStatus): string {
  if (status === "connecting") {
    return COPY.chatConnecting;
  }
  if (status === "reconnecting") {
    return COPY.chatReconnecting;
  }
  if (status === "ended") {
    return COPY.chatEnded;
  }
  return "";
}

export function createChatPanel(
  streamId: string,
  deps: {
    createController?: (handlers: ChatHandlers) => ChatController;
    onEnded?: () => void;
  } = {},
): ChatPanel {
  const list = createMessageList({ onReachTop: () => void controller.loadOlder() });
  const composer = createComposer({ onSend: (text) => controller.send(text) });

  // Status is set imperatively (not a reactive binding) so it updates synchronously.
  const statusEl = p(
    { class: "px-3 py-1 text-sm text-gray-strong min-h-6", role: "status", "aria-live": "polite" },
    statusText("connecting"),
  );

  const handlers: ChatHandlers = {
    onReset: (messages) => list.reset(messages),
    onAppend: (message) => list.append(message),
    onPrepend: (messages) => list.prepend(messages),
    onStatus: (next) => {
      statusEl.textContent = statusText(next);
      if (next === "ended") {
        deps.onEnded?.();
      }
    },
    onIdentity: () => {
      // Identity is server-stamped; v0 does not surface the viewer's own id.
    },
    onErrorMessage: () => composer.setError(COPY.messageRejected),
  };

  const createController =
    deps.createController ?? ((h) => createChatClient(streamId, getCreatorKey(streamId), h));
  const controller = createController(handlers);

  const el = section(
    {
      class: "flex flex-col min-h-0 h-full bg-surface border border-gray-line",
      "aria-label": COPY.chatHeading,
    },
    p(
      {
        class:
          "px-3 py-2 border-b border-gray-line font-mono text-xs uppercase tracking-wide text-gray-strong",
      },
      COPY.chatHeading,
    ),
    statusEl,
    div({ class: "flex-1 min-h-0 flex flex-col" }, list.el),
    div({ class: "border-t border-gray-line p-3" }, composer.el),
  );

  return {
    el,
    mount: () => controller.connect(),
    unmount: () => controller.close(),
  };
}
