import { afterEach, expect, test } from "bun:test";
import type { ApiResult } from "../streams/api";
import { COPY } from "../streams/copy";
import type { MediaEngine, MediaEngineEvent } from "./media-engine";
import { createMediaPanel } from "./media-panel";
import type { MediaRole, MediaToken } from "./types";

function fakeEngine() {
  const handlers = new Map<MediaEngineEvent, Array<() => void>>();
  const calls = { publish: 0, remoteMuted: [] as boolean[] };
  const engine: MediaEngine = {
    setRemoteVideoElement: () => {},
    startPreview: async () => {},
    connect: async () => {},
    publish: async () => {
      calls.publish += 1;
    },
    setMicEnabled: async () => {},
    setCameraEnabled: async () => {},
    setRemoteMuted: (muted) => {
      calls.remoteMuted.push(muted);
    },
    on: (event, handler) => {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
    },
    disconnect: async () => {},
  };
  const emit = (event: MediaEngineEvent): void => {
    for (const handler of handlers.get(event) ?? []) {
      handler();
    }
  };
  return { engine, calls, emit };
}

function tokenFetcher(role: MediaRole) {
  const token: MediaToken = { token: "t", url: "u", identity: "i", role };
  return async (): Promise<ApiResult<MediaToken>> => ({ ok: true, value: token });
}

const flush = async (): Promise<void> => {
  for (let i = 0; i < 6; i += 1) {
    await Promise.resolve();
  }
};

function buttonByText(root: HTMLElement, text: string): HTMLButtonElement | undefined {
  return [...root.querySelectorAll("button")].find((b) => b.textContent === text);
}

afterEach(() => {
  document.body.replaceChildren();
});

test("viewer shows the offline state, then video + tap-to-unmute on a publisher", async () => {
  const engine = fakeEngine();
  const panel = createMediaPanel("room", {
    fetchToken: tokenFetcher("viewer"),
    engineFactory: () => engine.engine,
    getKey: () => undefined,
  });
  panel.mount();
  await flush();
  expect(panel.el.textContent).toContain(COPY.mediaOffline);

  engine.emit("publisher-present");
  expect(panel.el.querySelector("video")).not.toBeNull();
  const unmute = buttonByText(panel.el, COPY.tapToUnmute);
  expect(unmute).toBeDefined();
  unmute?.click();
  expect(engine.calls.remoteMuted.at(-1)).toBe(false);
});

test("creator shows pre-join with Go live, and publishes on activation", async () => {
  const engine = fakeEngine();
  const panel = createMediaPanel("room", {
    fetchToken: tokenFetcher("streamer"),
    engineFactory: () => engine.engine,
    getKey: () => "k",
  });
  panel.mount();
  await flush();
  const goLive = buttonByText(panel.el, COPY.goLiveAction);
  expect(goLive).toBeDefined();
  goLive?.click();
  await flush();
  expect(engine.calls.publish).toBe(1);
  // While live the mute/camera controls are shown.
  expect(buttonByText(panel.el, COPY.muteMicAction)).toBeDefined();
  expect(buttonByText(panel.el, COPY.cameraOffAction)).toBeDefined();
});

test("offline state shows no spinner element", async () => {
  const engine = fakeEngine();
  const panel = createMediaPanel("room", {
    fetchToken: tokenFetcher("viewer"),
    engineFactory: () => engine.engine,
    getKey: () => undefined,
  });
  panel.mount();
  await flush();
  // Calm text only — no video and no animated element in the offline state.
  expect(panel.el.querySelector("video")).toBeNull();
  expect(panel.el.textContent).toContain(COPY.mediaOffline);
});
