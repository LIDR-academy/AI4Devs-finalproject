import van from "vanjs-core";
import { COPY } from "../streams/copy";
import type { ChatMessage } from "./frames";

/** The scrollable message list (design D-P6). Auto-scroll pins to the newest message
 *  only when the user is already at the bottom; scrolling to the top asks for older
 *  history. The pin decision is a pure function so it can be tested without layout. */

const { div, ul, li, span } = van.tags;

const TOP_THRESHOLD_PX = 8;
const BOTTOM_THRESHOLD_PX = 32;

/** True when the viewport is at (or within a threshold of) the bottom of the content. */
export function isPinnedToBottom(
  scrollHeight: number,
  scrollTop: number,
  clientHeight: number,
  threshold = BOTTOM_THRESHOLD_PX,
): boolean {
  return scrollHeight - scrollTop - clientHeight <= threshold;
}

/** Render one message: sender (with a STREAMER label when role is streamer) + text.
 *  The STREAMER label is mono/uppercase/tracking-wide with no color and 0 radius (style §5). */
export function renderMessage(message: ChatMessage): HTMLElement {
  const meta = div({ class: "flex items-baseline gap-2" });
  if (message.role === "streamer") {
    van.add(
      meta,
      span({ class: "font-mono text-xs uppercase tracking-wide text-ink" }, COPY.streamerLabel),
    );
  }
  van.add(meta, span({ class: "font-semibold text-sm" }, message.sender));
  return li(
    { class: "py-1.5 flex flex-col gap-0.5" },
    meta,
    span({ class: "text-sm" }, message.text),
  );
}

export type MessageList = {
  readonly el: HTMLElement;
  reset(messages: ChatMessage[]): void;
  append(message: ChatMessage): void;
  prepend(messages: ChatMessage[]): void;
};

/** Create the scrolling message list. `onReachTop` fires when the user scrolls to the top. */
export function createMessageList(deps: { onReachTop: () => void }): MessageList {
  const list = ul({ class: "flex flex-col px-3" });
  const el = div(
    {
      class: "flex-1 min-h-0 overflow-y-auto",
      onscroll: () => {
        if (el.scrollTop <= TOP_THRESHOLD_PX) {
          deps.onReachTop();
        }
      },
    },
    list,
  );

  const scrollToBottom = (): void => {
    el.scrollTop = el.scrollHeight;
  };

  return {
    el,
    reset(messages) {
      list.replaceChildren(...messages.map(renderMessage));
      scrollToBottom();
    },
    append(message) {
      const pinned = isPinnedToBottom(el.scrollHeight, el.scrollTop, el.clientHeight);
      list.appendChild(renderMessage(message));
      if (pinned) {
        scrollToBottom();
      }
    },
    prepend(messages) {
      if (messages.length === 0) {
        return;
      }
      const before = el.scrollHeight;
      const fragment = document.createDocumentFragment();
      for (const message of messages) {
        fragment.appendChild(renderMessage(message));
      }
      list.insertBefore(fragment, list.firstChild);
      // Preserve the reading position when older content is added above.
      el.scrollTop += el.scrollHeight - before;
    },
  };
}
