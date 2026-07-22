import { afterEach, expect, mock, test } from "bun:test";
import van from "vanjs-core";
import { COPY } from "../streams/copy";
import type { ChatHandlers } from "./chat-client";
import { type ChatController, createChatPanel } from "./chat-panel";
import type { ChatMessage } from "./frames";

const flush = async (): Promise<void> => {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
  }
};

function msg(id: string): ChatMessage {
  return { id, sender: "u", role: "viewer", text: `t${id}`, ts: "t" };
}

function fakeController(): ChatController {
  return {
    connect: mock(() => {}),
    send: mock(() => {}),
    loadOlder: mock(async () => {}),
    close: mock(() => {}),
  };
}

afterEach(() => {
  document.body.replaceChildren();
});

test("mount connects and unmount closes the controller", () => {
  const controller = fakeController();
  const panel = createChatPanel("room", { createController: () => controller });
  panel.mount();
  expect(controller.connect).toHaveBeenCalledTimes(1);
  panel.unmount();
  expect(controller.close).toHaveBeenCalledTimes(1);
});

test("handlers render messages and status into the panel", () => {
  let captured: ChatHandlers | null = null;
  const controller = fakeController();
  const panel = createChatPanel("room", {
    createController: (handlers) => {
      captured = handlers;
      return controller;
    },
  });
  if (captured === null) {
    throw new Error("handlers were not captured");
  }
  const handlers: ChatHandlers = captured;
  handlers.onReset([msg("1")]);
  handlers.onAppend(msg("2"));
  expect(panel.el.querySelectorAll("li").length).toBe(2);
  handlers.onStatus("reconnecting");
  expect(panel.el.textContent).toContain(COPY.chatReconnecting);
});

test("onEnded fires when status becomes ended, not on reconnecting", () => {
  let captured: ChatHandlers | null = null;
  const controller = fakeController();
  const onEnded = mock(() => {});
  createChatPanel("room", {
    createController: (handlers) => {
      captured = handlers;
      return controller;
    },
    onEnded,
  });
  if (captured === null) {
    throw new Error("handlers were not captured");
  }
  const handlers: ChatHandlers = captured;
  handlers.onStatus("reconnecting");
  expect(onEnded).not.toHaveBeenCalled();
  handlers.onStatus("ended");
  expect(onEnded).toHaveBeenCalledTimes(1);
});

test("a signed-in user sees the composer; submit sends through the controller", () => {
  const controller = fakeController();
  const panel = createChatPanel("room", {
    createController: () => controller,
    signedIn: () => true,
  });
  const inputEl = panel.el.querySelector<HTMLInputElement>('input[name="message"]');
  const formEl = panel.el.querySelector("form");
  if (inputEl === null || formEl === null) {
    throw new Error("composer not found");
  }
  inputEl.value = "hey";
  formEl.dispatchEvent(new Event("submit"));
  expect(controller.send).toHaveBeenCalledWith("hey");
});

test("an anonymous user sees a calm Sign in to chat affordance, not the composer", () => {
  const onSignIn = mock(() => {});
  const panel = createChatPanel("room", {
    createController: () => fakeController(),
    signedIn: () => false,
    onSignIn,
  });
  expect(panel.el.querySelector('input[name="message"]')).toBeNull();
  expect(panel.el.textContent).toContain(COPY.signInToChat);
  const signIn = [...panel.el.querySelectorAll("button")].find(
    (b) => b.textContent === COPY.signInAction,
  );
  expect(signIn).toBeDefined();
  signIn?.click();
  expect(onSignIn).toHaveBeenCalledTimes(1);
});

test("an auth_required error prompts re-auth calmly", async () => {
  let captured: ChatHandlers | null = null;
  const panel = createChatPanel("room", {
    createController: (handlers) => {
      captured = handlers;
      return fakeController();
    },
    signedIn: () => true,
  });
  if (captured === null) {
    throw new Error("handlers were not captured");
  }
  // Mount with van.add so the composer's reactive error text flushes.
  van.add(document.body, panel.el);
  (captured as ChatHandlers).onErrorMessage("auth_required");
  await flush();
  expect(panel.el.textContent).toContain(COPY.signInToContinue);
});
