import van from "vanjs-core";
import { navigate } from "../router/router";
import type { ApiResult } from "./api";
import { listStreams } from "./api";
import { COPY } from "./copy";
import { openStartModalDefault } from "./start-modal";
import type { Stream } from "./types";

/** Home (`/`): fetch `GET /streams` once on load, list live streams by title, calm
 *  empty state, and a Start streaming action. The view is pure (data in → DOM out);
 *  the fetch and the start action are injected (design D-P1/D-P2). */

const { section, header, div, h1, ul, li, p, button } = van.tags;

type HomeDeps = {
  readonly list: () => Promise<ApiResult<Stream[]>>;
  readonly onStart: () => void;
};

function defaultHomeDeps(): HomeDeps {
  return {
    list: listStreams,
    onStart: () => openStartModalDefault(navigate),
  };
}

function messageView(text: string): HTMLElement {
  return p({ class: "text-base text-gray-strong" }, text);
}

function streamListView(streams: readonly Stream[]): HTMLElement {
  if (streams.length === 0) {
    return messageView(COPY.emptyState);
  }
  return ul(
    { class: "flex flex-col" },
    streams.map((stream) =>
      // Only the title is shown in v0; description is received but not displayed.
      li({ class: "py-3 border-b border-gray-line text-base" }, stream.title),
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
    content.replaceChildren(result.ok ? streamListView(result.value) : messageView(COPY.loadError));
  });

  const el = section(
    { class: "mx-auto max-w-2xl px-4 py-8" },
    header(
      { class: "flex items-center justify-between gap-4" },
      h1({ class: "text-2xl font-semibold" }, COPY.homeHeading),
      button(
        { class: "btn btn-primary transition-calm", type: "button", onclick: deps.onStart },
        COPY.startAction,
      ),
    ),
    content,
  );

  return { el, ready };
}
