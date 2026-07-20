import { afterEach, expect, mock, test } from "bun:test";
import type { ApiResult } from "./api";
import { COPY } from "./copy";
import { createHome } from "./home";
import type { Stream } from "./types";

function okList(streams: Stream[]): () => Promise<ApiResult<Stream[]>> {
  return () => Promise.resolve({ ok: true, value: streams });
}

const noop = (): void => {};

afterEach(() => {
  document.body.replaceChildren();
});

test("renders each stream's username and title in received order", async () => {
  const streams: Stream[] = [
    { id: "1", username: "alpha", title: "First", description: "" },
    { id: "2", username: "beta", title: "Second", description: "" },
  ];
  const home = createHome({ list: okList(streams), onStart: noop, onOpen: noop });
  await home.ready;
  const items = home.el.querySelectorAll("li");
  expect(items.length).toBe(2);
  expect(items[0]?.textContent).toContain("alpha");
  expect(items[0]?.textContent).toContain("First");
  expect(items[1]?.textContent).toContain("beta");
  expect(items[1]?.textContent).toContain("Second");
});

test("each stream is a keyboard-accessible link that opens its room", async () => {
  const onOpen = mock(() => {});
  const home = createHome({
    list: okList([{ id: "42", username: "u", title: "T", description: "" }]),
    onStart: noop,
    onOpen,
  });
  await home.ready;
  const link = home.el.querySelector("a");
  expect(link).not.toBeNull();
  expect(link?.getAttribute("href")).toBe("/stream/42"); // real link → focusable, right-clickable
  link?.click();
  expect(onOpen).toHaveBeenCalledWith("42");
});

test("does not render the description", async () => {
  const home = createHome({
    list: okList([{ id: "1", username: "u", title: "T", description: "SECRET-DESC" }]),
    onStart: noop,
    onOpen: noop,
  });
  await home.ready;
  expect(home.el.textContent).not.toContain("SECRET-DESC");
});

test("shows a calm empty state when no streams are live", async () => {
  const home = createHome({ list: okList([]), onStart: noop, onOpen: noop });
  await home.ready;
  expect(home.el.textContent).toContain(COPY.emptyState);
});

test("shows load error copy when the list fails", async () => {
  const home = createHome({
    list: () => Promise.resolve({ ok: false, error: { kind: "network" } }),
    onStart: noop,
    onOpen: noop,
  });
  await home.ready;
  expect(home.el.textContent).toContain(COPY.loadError);
});

test("Start streaming action is present and triggers onStart", async () => {
  const onStart = mock(() => {});
  const home = createHome({ list: okList([]), onStart, onOpen: noop });
  await home.ready;
  const startButton = [...home.el.querySelectorAll("button")].find(
    (button) => button.textContent === COPY.startAction,
  );
  expect(startButton).toBeDefined();
  startButton?.click();
  expect(onStart).toHaveBeenCalledTimes(1);
});
