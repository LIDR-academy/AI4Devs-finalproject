import { afterEach, expect, mock, test } from "bun:test";
import { COPY } from "../streams/copy";
import type { ChatMessage } from "./frames";
import { createMessageList, isPinnedToBottom, renderMessage } from "./message-list";

function msg(role: "streamer" | "viewer", text = "hi", id = "1"): ChatMessage {
  return { id, sender: "u", role, text, ts: "t" };
}

afterEach(() => {
  document.body.replaceChildren();
});

test("isPinnedToBottom is true at the bottom and false when scrolled up", () => {
  expect(isPinnedToBottom(100, 68, 32)).toBe(true); // 0 within threshold
  expect(isPinnedToBottom(100, 0, 32)).toBe(false); // 68 above threshold
});

test("renderMessage shows the STREAMER label for a streamer", () => {
  const el = renderMessage(msg("streamer"));
  expect(el.textContent).toContain(COPY.streamerLabel);
  expect(el.textContent).toContain("u");
});

test("renderMessage omits the STREAMER label for a viewer", () => {
  expect(renderMessage(msg("viewer")).textContent).not.toContain(COPY.streamerLabel);
});

test("reset renders all messages", () => {
  const list = createMessageList({ onReachTop: () => {} });
  list.reset([msg("viewer", "a", "1"), msg("streamer", "b", "2")]);
  expect(list.el.querySelectorAll("li").length).toBe(2);
});

test("append adds a message", () => {
  const list = createMessageList({ onReachTop: () => {} });
  list.reset([]);
  list.append(msg("viewer", "c", "3"));
  expect(list.el.querySelectorAll("li").length).toBe(1);
  expect(list.el.textContent).toContain("c");
});

test("scrolling to the top asks for older history", () => {
  const onReachTop = mock(() => {});
  const list = createMessageList({ onReachTop });
  document.body.appendChild(list.el);
  list.el.scrollTop = 0;
  list.el.dispatchEvent(new Event("scroll"));
  expect(onReachTop).toHaveBeenCalledTimes(1);
});

test("scrolling away from the top does not ask for older history", () => {
  const onReachTop = mock(() => {});
  const list = createMessageList({ onReachTop });
  document.body.appendChild(list.el);
  list.el.scrollTop = 100;
  list.el.dispatchEvent(new Event("scroll"));
  expect(onReachTop).not.toHaveBeenCalled();
});
