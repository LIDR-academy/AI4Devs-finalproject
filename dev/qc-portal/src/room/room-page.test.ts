import { afterEach, expect, mock, test } from "bun:test";
import type { ChatPanel } from "../chat/chat-panel";
import type { ApiResult } from "../streams/api";
import { COPY } from "../streams/copy";
import { clearCreatorKey, getCreatorKey, setCreatorKey } from "../streams/creator-key";
import type { Stream } from "../streams/types";
import { createRoomPage } from "./room-page";

function fakeChat() {
  const mount = mock(() => {});
  const unmount = mock(() => {});
  const panel: ChatPanel = { el: document.createElement("div"), mount, unmount };
  return { panel, mount, unmount };
}

function stream(): Stream {
  return { id: "r1", username: "neo", title: "My Stream", description: "desc" };
}

const ended = async (): Promise<ApiResult<null>> => ({ ok: true, value: null });
const noStream = async (): Promise<Stream | null> => null;
const flush = (): Promise<void> => new Promise((resolve) => queueMicrotask(resolve));
const hasKey = (): string | undefined => "k";
const noKey = (): string | undefined => undefined;

afterEach(() => {
  clearCreatorKey("r1");
  document.body.replaceChildren();
});

function hasEndButton(el: HTMLElement): boolean {
  return [...el.querySelectorAll("button")].some((b) => b.textContent === COPY.endAction);
}

test("mounts chat on creation", () => {
  const chat = fakeChat();
  createRoomPage("r1", {
    loadStream: () => Promise.resolve(stream()),
    navigate: () => {},
    buildChat: () => chat.panel,
    getKey: noKey,
  });
  expect(chat.mount).toHaveBeenCalledTimes(1);
});

test("renders the header username, title, and description after load", async () => {
  const chat = fakeChat();
  const page = createRoomPage("r1", {
    loadStream: () => Promise.resolve(stream()),
    navigate: () => {},
    buildChat: () => chat.panel,
    getKey: noKey,
  });
  await flush();
  expect(page.el.textContent).toContain("neo");
  expect(page.el.textContent).toContain("My Stream");
  expect(page.el.textContent).toContain("desc");
});

test("shows the End control only for the creator (creatorKey in memory)", () => {
  const creator = createRoomPage("r1", {
    loadStream: noStream,
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    getKey: hasKey,
  });
  expect(creator.isCreator).toBe(true);
  expect(hasEndButton(creator.el)).toBe(true);

  const viewer = createRoomPage("r1", {
    loadStream: noStream,
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    getKey: noKey,
  });
  expect(viewer.isCreator).toBe(false);
  expect(hasEndButton(viewer.el)).toBe(false);
});

test("End sends the creatorKey to the API", async () => {
  const end = mock(async () => ({ ok: true, value: null }) as ApiResult<null>);
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end,
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    getKey: () => "secret",
  });
  await page.end();
  expect(end).toHaveBeenCalledWith("r1", "secret");
});

test("End on 204 clears the key, unmounts chat, and redirects home", async () => {
  setCreatorKey("r1", "k");
  const chat = fakeChat();
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: ended,
    navigate,
    buildChat: () => chat.panel,
    getKey: hasKey,
  });
  await page.end();
  expect(navigate).toHaveBeenCalledWith("/");
  expect(chat.unmount).toHaveBeenCalled();
  expect(getCreatorKey("r1")).toBeUndefined();
});

test("End on 404 also redirects home", async () => {
  const chat = fakeChat();
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: async () => ({ ok: false, error: { kind: "http", status: 404 } }),
    navigate,
    buildChat: () => chat.panel,
    getKey: hasKey,
  });
  await page.end();
  expect(navigate).toHaveBeenCalledWith("/");
});

test("End on 403 shows a calm not-allowed message and stays", async () => {
  const chat = fakeChat();
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: async () => ({ ok: false, error: { kind: "http", status: 403 } }),
    navigate,
    buildChat: () => chat.panel,
    getKey: hasKey,
  });
  await page.end();
  expect(navigate).not.toHaveBeenCalled();
  expect(page.errorText.val).toBe(COPY.endNotAllowed);
});

test("End on another failure shows calm copy and does not redirect", async () => {
  const chat = fakeChat();
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: async () => ({ ok: false, error: { kind: "http", status: 500 } }),
    navigate,
    buildChat: () => chat.panel,
    getKey: hasKey,
  });
  await page.end();
  expect(navigate).not.toHaveBeenCalled();
  expect(page.errorText.val).toBe(COPY.endFailed);
});

test("terminal room-ended shows a notice, unmounts chat, and redirects home", () => {
  let captured: (() => void) | null = null;
  const chat = fakeChat();
  const navigate = mock(() => {});
  const scheduleRedirect = mock((run: () => void) => run()); // run immediately for the test
  const page = createRoomPage("r1", {
    loadStream: noStream,
    navigate,
    buildChat: (_id, onEnded) => {
      captured = onEnded;
      return chat.panel;
    },
    getKey: noKey,
    scheduleRedirect,
  });
  if (captured === null) {
    throw new Error("onEnded was not wired");
  }
  const fireEnded: () => void = captured;
  fireEnded();
  expect(page.el.textContent).toContain(COPY.streamEnded);
  expect(chat.unmount).toHaveBeenCalled();
  expect(navigate).toHaveBeenCalledWith("/");
});

test("chat toggle hides and shows the chat", () => {
  const chat = fakeChat();
  const page = createRoomPage("r1", {
    loadStream: noStream,
    navigate: () => {},
    buildChat: () => chat.panel,
    getKey: noKey,
  });
  expect(page.chatVisible.val).toBe(true);
  const toggle = [...page.el.querySelectorAll("button")].find(
    (button) => button.textContent === COPY.hideChat,
  );
  expect(toggle).toBeDefined();
  toggle?.click();
  expect(page.chatVisible.val).toBe(false);
});
