import van from "vanjs-core";
import { navigate } from "../router/router";
import type { ApiResult } from "./api";
import { endStream } from "./api";
import { COPY } from "./copy";

/** Stream page (`/stream/{id}`): placeholder content + End stream. Ending redirects
 *  Home on `204` and also on `404` (already ended). Side effects injected (design D-P1). */

const { section, div, p, button } = van.tags;

type StreamPageDeps = {
  readonly end: (id: string) => Promise<ApiResult<null>>;
  readonly navigate: (path: string) => void;
};

function defaultStreamPageDeps(): StreamPageDeps {
  return { end: endStream, navigate };
}

/** Create the stream page plus an `end` handler exposed for deterministic testing. */
export function createStreamPage(
  id: string,
  deps: StreamPageDeps = defaultStreamPageDeps(),
): {
  readonly el: HTMLElement;
  readonly end: () => Promise<void>;
  readonly errorText: { readonly val: string };
} {
  const errorText = van.state("");
  const ending = van.state(false);

  const end = async (): Promise<void> => {
    if (ending.val) {
      return;
    }
    ending.val = true;
    const result = await deps.end(id);
    ending.val = false;
    // A missing stream (404) means it is already ended — treat it as success and go Home.
    if (result.ok || (result.error.kind === "http" && result.error.status === 404)) {
      deps.navigate("/");
      return;
    }
    errorText.val = COPY.endFailed;
  };

  const el = section(
    { class: "mx-auto max-w-2xl px-4 py-8 flex flex-col gap-4" },
    p({ class: "font-mono text-xs text-gray-strong" }, `stream: ${id}`),
    p({ class: "text-base" }, COPY.streamLive),
    div(
      {},
      button(
        {
          class: "btn btn-primary transition-calm",
          type: "button",
          disabled: () => ending.val,
          onclick: () => {
            void end();
          },
        },
        COPY.endAction,
      ),
    ),
    p(
      { class: "text-sm text-gray-strong min-h-5", role: "alert", "aria-live": "polite" },
      () => errorText.val,
    ),
  );

  return { el, end, errorText };
}
