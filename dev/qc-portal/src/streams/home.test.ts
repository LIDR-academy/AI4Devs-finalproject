import { afterEach, expect, mock, test } from "bun:test";
import type { ApiResult } from "./api";
import { COPY } from "./copy";
import { createHome } from "./home";
import type { Stream } from "./types";

function okList(streams: Stream[]): () => Promise<ApiResult<Stream[]>> {
  return () => Promise.resolve({ ok: true, value: streams });
}

afterEach(() => {
  document.body.replaceChildren();
});

test("renders each stream title in received order", async () => {
  const streams: Stream[] = [
    { id: "1", title: "First", description: "" },
    { id: "2", title: "Second", description: "" },
  ];
  const home = createHome({ list: okList(streams), onStart: () => {} });
  await home.ready;
  const items = home.el.querySelectorAll("li");
  expect(items.length).toBe(2);
  expect(items[0]?.textContent).toBe("First");
  expect(items[1]?.textContent).toBe("Second");
});

test("does not render the description", async () => {
  const home = createHome({
    list: okList([{ id: "1", title: "T", description: "SECRET-DESC" }]),
    onStart: () => {},
  });
  await home.ready;
  expect(home.el.textContent).not.toContain("SECRET-DESC");
});

test("shows a calm empty state when no streams are live", async () => {
  const home = createHome({ list: okList([]), onStart: () => {} });
  await home.ready;
  expect(home.el.textContent).toContain(COPY.emptyState);
});

test("shows load error copy when the list fails", async () => {
  const home = createHome({
    list: () => Promise.resolve({ ok: false, error: { kind: "network" } }),
    onStart: () => {},
  });
  await home.ready;
  expect(home.el.textContent).toContain(COPY.loadError);
});

test("Start streaming action is present and triggers onStart", async () => {
  const onStart = mock(() => {});
  const home = createHome({ list: okList([]), onStart });
  await home.ready;
  const startButton = [...home.el.querySelectorAll("button")].find(
    (button) => button.textContent === COPY.startAction,
  );
  expect(startButton).toBeDefined();
  startButton?.click();
  expect(onStart).toHaveBeenCalledTimes(1);
});
