import van from "vanjs-core";
import { currentUsername, isSignedIn } from "../auth/session-store";
import { type ChatPanel, createChatPanel } from "../chat/chat-panel";
import { createMediaPanel, type MediaPanel } from "../media/media-panel";
import { navigate } from "../router/router";
import type { ApiResult } from "../streams/api";
import { endStream, listStreams } from "../streams/api";
import { COPY } from "../streams/copy";
import type { Stream } from "../streams/types";

/** The room page (`/stream/{id}`): header + media area + chat. Ownership is by session
 *  (signed-in AND the session username equals the stream's username — creatorKey retired,
 *  D4); the owner sees End and (via the media token role) the publisher experience, and it
 *  survives reload. On terminal room-ended it shows a calm notice and redirects. Side
 *  effects are injected for testing. */

const { section, div, header, h1, p, span, button } = van.tags;

const REDIRECT_DELAY_MS = 2000;

type RoomPageDeps = {
  readonly loadStream?: (id: string) => Promise<Stream | null>;
  readonly end?: (id: string) => Promise<ApiResult<null>>;
  readonly navigate?: (path: string) => void;
  readonly buildChat?: (id: string, onEnded: () => void) => ChatPanel;
  readonly buildMedia?: (id: string) => MediaPanel;
  readonly signedIn?: () => boolean;
  readonly username?: () => string | undefined;
  readonly scheduleRedirect?: (run: () => void) => void;
};

/** The room's metadata comes from the stream listing (there is no single-stream GET). */
async function defaultLoadStream(id: string): Promise<Stream | null> {
  const result = await listStreams();
  if (!result.ok) {
    return null;
  }
  return result.value.find((stream) => stream.id === id) ?? null;
}

export type RoomPage = {
  readonly el: HTMLElement;
  end(): Promise<void>;
  unmount(): void;
  readonly errorText: { readonly val: string };
  readonly chatVisible: { readonly val: boolean };
  readonly isOwner: { readonly val: boolean };
};

export function createRoomPage(streamId: string, deps: RoomPageDeps = {}): RoomPage {
  const loadStream = deps.loadStream ?? defaultLoadStream;
  const endFn = deps.end ?? endStream;
  const nav = deps.navigate ?? navigate;
  const buildChat = deps.buildChat ?? ((id, onEnded) => createChatPanel(id, { onEnded }));
  const buildMedia = deps.buildMedia ?? createMediaPanel;
  const signedIn = deps.signedIn ?? isSignedIn;
  const username = deps.username ?? currentUsername;
  const scheduleRedirect = deps.scheduleRedirect ?? ((run) => setTimeout(run, REDIRECT_DELAY_MS));

  const errorText = van.state("");
  const ending = van.state(false);
  const chatVisible = van.state(true);
  const isOwner = van.state(false);

  let endedHandled = false;
  const onEnded = (): void => {
    if (endedHandled) {
      return;
    }
    endedHandled = true;
    chat.unmount();
    media.unmount();
    el.replaceChildren(endedNotice());
    scheduleRedirect(() => nav("/"));
  };

  const chat = buildChat(streamId, onEnded);
  const media = buildMedia(streamId);

  const headerBox = header({ class: "flex flex-col gap-1" });
  void loadStream(streamId).then((stream) => {
    if (stream === null) {
      return;
    }
    if (signedIn() && username() === stream.username) {
      isOwner.val = true;
    }
    const parts: HTMLElement[] = [
      span(
        { class: "font-mono text-xs uppercase tracking-wide text-gray-strong" },
        stream.username,
      ),
      h1({ class: "text-2xl font-semibold" }, stream.title),
    ];
    if (stream.description.length > 0) {
      parts.push(p({ class: "text-base text-gray-strong" }, stream.description));
    }
    headerBox.replaceChildren(...parts);
  });

  const end = async (): Promise<void> => {
    if (ending.val) {
      return;
    }
    ending.val = true;
    const result = await endFn(streamId);
    ending.val = false;
    if (result.ok || (result.error.kind === "http" && result.error.status === 404)) {
      chat.unmount();
      media.unmount();
      nav("/");
      return;
    }
    if (
      result.error.kind === "http" &&
      (result.error.status === 403 || result.error.status === 401)
    ) {
      errorText.val = COPY.endNotAllowed;
      return;
    }
    errorText.val = COPY.endFailed;
  };

  const endedNotice = (): HTMLElement =>
    div(
      { class: "mx-auto max-w-5xl px-4 py-16 flex flex-col items-center gap-2 text-center" },
      p({ class: "text-xl font-semibold" }, COPY.streamEnded),
      p({ class: "text-sm text-gray-strong" }, COPY.redirecting),
    );

  const cameraWrap = div(
    {
      class: () =>
        `min-h-0 ${chatVisible.val ? "lg:col-span-2" : "lg:col-span-3 row-span-2 lg:row-span-1"}`,
    },
    media.el,
  );
  const chatWrap = div({ class: () => `min-h-0 ${chatVisible.val ? "" : "hidden"}` }, chat.el);

  const toggleButton = button(
    {
      class: "btn btn-secondary transition-calm",
      type: "button",
      "aria-pressed": () => (chatVisible.val ? "true" : "false"),
      onclick: () => {
        chatVisible.val = !chatVisible.val;
      },
    },
    () => (chatVisible.val ? COPY.hideChat : COPY.showChat),
  );

  const endButton = button(
    {
      class: "btn btn-primary transition-calm",
      type: "button",
      disabled: () => ending.val,
      onclick: () => {
        void end();
      },
    },
    COPY.endAction,
  );

  const el = section(
    { class: "mx-auto max-w-5xl px-4 py-6 flex flex-col gap-4" },
    div(
      { class: "flex items-start justify-between gap-4" },
      headerBox,
      // End is shown only to the signed-in owner (D4); reactive to the resolved ownership.
      div({ class: "flex gap-3 shrink-0" }, toggleButton, () => (isOwner.val ? endButton : "")),
    ),
    div(
      { class: "grid gap-4 grid-rows-2 lg:grid-rows-1 lg:grid-cols-3 min-h-96" },
      cameraWrap,
      chatWrap,
    ),
    p(
      { class: "text-sm text-gray-strong min-h-5", role: "alert", "aria-live": "polite" },
      () => errorText.val,
    ),
  );

  chat.mount();
  media.mount();

  const unmount = (): void => {
    chat.unmount();
    media.unmount();
  };

  return { el, end, unmount, errorText, chatVisible, isOwner };
}
