import van from "vanjs-core";
import { accessToken, isSignedIn, subscribe } from "../auth/session-store";
import { goToSignIn } from "../auth/sign-in-navigation";
import { COPY } from "../streams/copy";
import { type ChatHandlers, type ChatStatus, createChatClient } from "./chat-client";
import { createComposer } from "./composer";
import { createMessageList } from "./message-list";

/** The chat panel wires the message list + composer to a chat controller. Anonymous users
 *  read history/live messages but see a calm "Sign in to chat" affordance in place of the
 *  composer (D6). The controller and the sign-in action are injected for testing. */

const { section, div, p, button } = van.tags;

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
    onSignIn?: () => void;
    signedIn?: () => boolean;
  } = {},
): ChatPanel {
  const signedIn = deps.signedIn ?? isSignedIn;
  const onSignIn = deps.onSignIn ?? goToSignIn;

  const list = createMessageList({ onReachTop: () => void controller.loadOlder() });
  const composer = createComposer({ onSend: (text) => controller.send(text) });

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
    onErrorMessage: (reason) => {
      composer.setError(reason === "auth_required" ? COPY.signInToContinue : COPY.messageRejected);
    },
  };

  const createController =
    deps.createController ?? ((h) => createChatClient(streamId, accessToken, h));
  const controller = createController(handlers);

  // The composer area shows the input for signed-in users, else a calm sign-in affordance.
  const signInAffordance = div(
    { class: "flex flex-col gap-2 items-start" },
    p({ class: "text-sm text-gray-strong" }, COPY.signInToChat),
    button(
      { class: "btn btn-secondary transition-calm", type: "button", onclick: () => onSignIn() },
      COPY.signInAction,
    ),
  );
  const composerArea = div({ class: "border-t border-gray-line p-3" });
  const renderComposerArea = (): void => {
    composerArea.replaceChildren(signedIn() ? composer.el : signInAffordance);
  };
  renderComposerArea();
  const unsubscribe = subscribe(renderComposerArea);

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
    composerArea,
  );

  return {
    el,
    mount: () => controller.connect(),
    unmount: () => {
      unsubscribe();
      controller.close();
    },
  };
}
