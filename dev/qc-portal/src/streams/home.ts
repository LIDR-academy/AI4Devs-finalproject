import van from "vanjs-core";
import { createAuthControls } from "../auth/auth-controls";
import { isSignedIn } from "../auth/session-store";
import { goToSignIn } from "../auth/sign-in-navigation";
import { navigate } from "../router/router";
import type { ApiResult } from "./api";
import { listStreams } from "./api";
import { COPY } from "./copy";
import { openStartModalDefault } from "./start-modal";
import type { Stream } from "./types";

/** Home (`/`): fetch `GET /streams` once on load, list live streams, calm empty state, and
 *  auth-aware controls. Start streaming is visible to everyone; a signed-out click routes to
 *  sign-in (D6). The view is pure; the fetch, start action, and auth controls are injected. */

const { section, header, div, h1, ul, li, p, span, a, button } = van.tags;

type HomeDeps = {
  readonly list: () => Promise<ApiResult<Stream[]>>;
  readonly onStart: () => void;
  readonly onOpen: (id: string) => void;
  readonly buildAuthControls: () => HTMLElement;
};

function defaultHomeDeps(): HomeDeps {
  return {
    list: listStreams,
    // Visible-but-gated: signed-out click routes to sign-in, signed-in opens the modal.
    onStart: () => (isSignedIn() ? openStartModalDefault(navigate) : goToSignIn()),
    onOpen: (id) => navigate(`/stream/${id}`),
    buildAuthControls: () => createAuthControls(),
  };
}

function messageView(text: string): HTMLElement {
  return p({ class: "text-base text-gray-strong" }, text);
}

function streamListView(streams: readonly Stream[], onOpen: (id: string) => void): HTMLElement {
  if (streams.length === 0) {
    return messageView(COPY.emptyState);
  }
  return ul(
    { class: "flex flex-col" },
    streams.map((stream) =>
      // Each stream is a real, keyboard-accessible link to its room (design D9). The
      // username is a mono label above the title; description is received but not shown.
      li(
        { class: "border-b border-gray-line" },
        a(
          {
            class: "flex flex-col gap-0.5 py-3 px-1 hover:bg-gray-fill transition-calm",
            href: `/stream/${stream.id}`,
            onclick: (event: MouseEvent) => {
              event.preventDefault();
              onOpen(stream.id);
            },
          },
          span(
            { class: "font-mono text-xs uppercase tracking-wide text-gray-strong" },
            stream.username,
          ),
          span({ class: "text-base underline" }, stream.title),
        ),
      ),
    ),
  );
}

/** Create the Home view plus a `ready` promise that resolves once the initial load
 *  settles — the app ignores `ready`; tests await it for determinism. */
export function createHome(deps: HomeDeps = defaultHomeDeps()): {
  readonly el: HTMLElement;
  readonly ready: Promise<void>;
} {
  const content = div({ class: "mt-6" }, messageView(COPY.loading));

  const ready = deps.list().then((result) => {
    content.replaceChildren(
      result.ok ? streamListView(result.value, deps.onOpen) : messageView(COPY.loadError),
    );
  });

  const el = section(
    { class: "mx-auto max-w-2xl px-4 py-8" },
    header(
      { class: "flex items-center justify-between gap-4" },
      h1({ class: "text-2xl font-semibold" }, COPY.homeHeading),
      div(
        { class: "flex items-center gap-3 shrink-0" },
        button(
          { class: "btn btn-primary transition-calm", type: "button", onclick: deps.onStart },
          COPY.startAction,
        ),
        deps.buildAuthControls(),
      ),
    ),
    content,
  );

  return { el, ready };
}
