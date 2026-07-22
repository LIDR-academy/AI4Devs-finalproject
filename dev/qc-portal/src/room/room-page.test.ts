import { afterEach, expect, mock, test } from "bun:test";
import van from "vanjs-core";
import type { ChatPanel } from "../chat/chat-panel";
import type { MediaPanel } from "../media/media-panel";
import type { ApiResult } from "../streams/api";
import { COPY } from "../streams/copy";
import type { Stream } from "../streams/types";
import { createRoomPage } from "./room-page";

function fakeChat() {
  const mount = mock(() => {});
  const unmount = mock(() => {});
  const panel: ChatPanel = { el: document.createElement("div"), mount, unmount };
  return { panel, mount, unmount };
}

function fakeMedia() {
  const mount = mock(() => {});
  const unmount = mock(() => {});
  const panel: MediaPanel = { el: document.createElement("div"), mount, unmount };
  return { panel, mount, unmount };
}

function stream(): Stream {
  return { id: "r1", username: "neo", title: "My Stream", description: "desc" };
}

const ended = async (): Promise<ApiResult<null>> => ({ ok: true, value: null });
const noStream = async (): Promise<Stream | null> => null;
const flush = (): Promise<void> => new Promise((resolve) => queueMicrotask(resolve));

// Signed-out identity by default so tests are deterministic (never read the global session).
const signedOut = { signedIn: (): boolean => false, username: (): string | undefined => undefined };

afterEach(() => {
  document.body.replaceChildren();
});

function hasEndButton(el: HTMLElement): boolean {
  return [...el.querySelectorAll("button")].some((b) => b.textContent === COPY.endAction);
}

test("mounts chat and media on creation", () => {
  const chat = fakeChat();
  const media = fakeMedia();
  createRoomPage("r1", {
    loadStream: () => Promise.resolve(stream()),
    navigate: () => {},
    buildChat: () => chat.panel,
    buildMedia: () => media.panel,
    ...signedOut,
  });
  expect(chat.mount).toHaveBeenCalledTimes(1);
  expect(media.mount).toHaveBeenCalledTimes(1);
});

test("unmount tears down both chat and media", () => {
  const chat = fakeChat();
  const media = fakeMedia();
  const page = createRoomPage("r1", {
    loadStream: noStream,
    navigate: () => {},
    buildChat: () => chat.panel,
    buildMedia: () => media.panel,
    ...signedOut,
  });
  page.unmount();
  expect(chat.unmount).toHaveBeenCalledTimes(1);
  expect(media.unmount).toHaveBeenCalledTimes(1);
});

test("renders the header username, title, and description after load", async () => {
  const page = createRoomPage("r1", {
    loadStream: () => Promise.resolve(stream()),
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    ...signedOut,
  });
  await flush();
  expect(page.el.textContent).toContain("neo");
  expect(page.el.textContent).toContain("My Stream");
  expect(page.el.textContent).toContain("desc");
});

test("owner-by-session (signed-in, username matches) sees End; others do not", async () => {
  const owner = createRoomPage("r1", {
    loadStream: () => Promise.resolve(stream()),
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    signedIn: () => true,
    username: () => "neo",
  });
  van.add(document.body, owner.el);
  await flush();
  expect(owner.isOwner.val).toBe(true);
  expect(hasEndButton(owner.el)).toBe(true);

  const viewer = createRoomPage("r1", {
    loadStream: () => Promise.resolve(stream()),
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    signedIn: () => true,
    username: () => "someone-else",
  });
  van.add(document.body, viewer.el);
  await flush();
  expect(viewer.isOwner.val).toBe(false);
  expect(hasEndButton(viewer.el)).toBe(false);
});

test("a signed-out visitor is never the owner even if usernames would match", async () => {
  const page = createRoomPage("r1", {
    loadStream: () => Promise.resolve(stream()),
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    signedIn: () => false,
    username: () => "neo",
  });
  await flush();
  expect(page.isOwner.val).toBe(false);
});

test("End sends only the stream id to the API (no creatorKey)", async () => {
  const end = mock(async () => ({ ok: true, value: null }) as ApiResult<null>);
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end,
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    ...signedOut,
  });
  await page.end();
  expect(end).toHaveBeenCalledWith("r1");
});

test("End on 204 tears down chat + media and redirects home", async () => {
  const chat = fakeChat();
  const media = fakeMedia();
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: ended,
    navigate,
    buildChat: () => chat.panel,
    buildMedia: () => media.panel,
    ...signedOut,
  });
  await page.end();
  expect(navigate).toHaveBeenCalledWith("/");
  expect(chat.unmount).toHaveBeenCalled();
  expect(media.unmount).toHaveBeenCalled();
});

test("End on 404 also redirects home", async () => {
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: async () => ({ ok: false, error: { kind: "http", status: 404 } }),
    navigate,
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    ...signedOut,
  });
  await page.end();
  expect(navigate).toHaveBeenCalledWith("/");
});

test("End on 403 shows a calm not-allowed message and stays", async () => {
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: async () => ({ ok: false, error: { kind: "http", status: 403 } }),
    navigate,
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    ...signedOut,
  });
  await page.end();
  expect(navigate).not.toHaveBeenCalled();
  expect(page.errorText.val).toBe(COPY.endNotAllowed);
});

test("End on 401 also shows the calm not-allowed message", async () => {
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: async () => ({ ok: false, error: { kind: "http", status: 401 } }),
    navigate,
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    ...signedOut,
  });
  await page.end();
  expect(navigate).not.toHaveBeenCalled();
  expect(page.errorText.val).toBe(COPY.endNotAllowed);
});

test("End on another failure shows calm copy and does not redirect", async () => {
  const navigate = mock(() => {});
  const page = createRoomPage("r1", {
    loadStream: noStream,
    end: async () => ({ ok: false, error: { kind: "http", status: 500 } }),
    navigate,
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    ...signedOut,
  });
  await page.end();
  expect(navigate).not.toHaveBeenCalled();
  expect(page.errorText.val).toBe(COPY.endFailed);
});

test("terminal room-ended shows a notice, tears down chat + media, and redirects home", () => {
  let captured: (() => void) | null = null;
  const chat = fakeChat();
  const media = fakeMedia();
  const navigate = mock(() => {});
  const scheduleRedirect = mock((run: () => void) => run()); // run immediately for the test
  const page = createRoomPage("r1", {
    loadStream: noStream,
    navigate,
    buildChat: (_id, onEnded) => {
      captured = onEnded;
      return chat.panel;
    },
    buildMedia: () => media.panel,
    ...signedOut,
    scheduleRedirect,
  });
  if (captured === null) {
    throw new Error("onEnded was not wired");
  }
  const fireEnded: () => void = captured;
  fireEnded();
  expect(page.el.textContent).toContain(COPY.streamEnded);
  expect(chat.unmount).toHaveBeenCalled();
  expect(media.unmount).toHaveBeenCalled();
  expect(navigate).toHaveBeenCalledWith("/");
});

test("chat toggle hides and shows the chat", () => {
  const page = createRoomPage("r1", {
    loadStream: noStream,
    navigate: () => {},
    buildChat: () => fakeChat().panel,
    buildMedia: () => fakeMedia().panel,
    ...signedOut,
  });
  expect(page.chatVisible.val).toBe(true);
  const toggle = [...page.el.querySelectorAll("button")].find(
    (button) => button.textContent === COPY.hideChat,
  );
  expect(toggle).toBeDefined();
  toggle?.click();
  expect(page.chatVisible.val).toBe(false);
});
