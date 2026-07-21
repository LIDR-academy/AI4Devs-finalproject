import { expect, test } from "bun:test";
import type { ApiResult } from "../streams/api";
import { createMediaController, type MediaControls, type MediaState } from "./media-controller";
import type { MediaEngine, MediaEngineEvent } from "./media-engine";
import type { MediaRole, MediaToken } from "./types";

function fakeEngine() {
  const handlers = new Map<MediaEngineEvent, Array<() => void>>();
  const calls = {
    preview: 0,
    connect: 0,
    publish: 0,
    mic: [] as boolean[],
    camera: [] as boolean[],
    remoteMuted: [] as boolean[],
    disconnect: 0,
  };
  const engine: MediaEngine = {
    setRemoteVideoElement: () => {},
    startPreview: async () => {
      calls.preview += 1;
    },
    connect: async () => {
      calls.connect += 1;
    },
    publish: async () => {
      calls.publish += 1;
    },
    setMicEnabled: async (enabled) => {
      calls.mic.push(enabled);
    },
    setCameraEnabled: async (enabled) => {
      calls.camera.push(enabled);
    },
    setRemoteMuted: (muted) => {
      calls.remoteMuted.push(muted);
    },
    on: (event, handler) => {
      const list = handlers.get(event) ?? [];
      list.push(handler);
      handlers.set(event, list);
    },
    disconnect: async () => {
      calls.disconnect += 1;
    },
  };
  const emit = (event: MediaEngineEvent): void => {
    for (const handler of handlers.get(event) ?? []) {
      handler();
    }
  };
  return { engine, calls, emit };
}

function harness(role: MediaRole) {
  const states: MediaState[] = [];
  const controlsLog: MediaControls[] = [];
  const engine = fakeEngine();
  const token: MediaToken = { token: "t", url: "u", identity: "i", role };
  const fetchToken = async (): Promise<ApiResult<MediaToken>> => ({ ok: true, value: token });
  const controller = createMediaController(
    "room",
    { onState: (s) => states.push(s), onControls: (c) => controlsLog.push(c) },
    {
      fetchToken,
      engineFactory: () => engine.engine,
      getKey: () => (role === "streamer" ? "k" : undefined),
    },
  );
  const elements = {
    preview: document.createElement("video"),
    remote: document.createElement("video"),
  };
  return { controller, states, controlsLog, engine, elements };
}

test("viewer connects, starts muted, and shows offline until a publisher appears", async () => {
  const h = harness("viewer");
  await h.controller.start(h.elements);
  expect(h.engine.calls.connect).toBe(1);
  expect(h.engine.calls.remoteMuted).toEqual([true]); // starts muted
  expect(h.states).toEqual(["loading", "offline"]);
  h.engine.emit("publisher-present");
  expect(h.states.at(-1)).toBe("video");
  h.engine.emit("publisher-absent");
  expect(h.states.at(-1)).toBe("offline");
});

test("viewer unmute toggles remote audio", async () => {
  const h = harness("viewer");
  await h.controller.start(h.elements);
  h.controller.unmute();
  expect(h.engine.calls.remoteMuted.at(-1)).toBe(false);
  expect(h.controlsLog.at(-1)?.muted).toBe(false);
});

test("creator pre-joins with a preview and does not publish until go live", async () => {
  const h = harness("streamer");
  await h.controller.start(h.elements);
  expect(h.engine.calls.preview).toBe(1);
  expect(h.engine.calls.publish).toBe(0); // no auto-publish
  expect(h.states).toEqual(["loading", "prejoin"]);
  await h.controller.goLive();
  expect(h.engine.calls.connect).toBe(1);
  expect(h.engine.calls.publish).toBe(1);
  expect(h.states.at(-1)).toBe("live");
});

test("creator mute mic and camera off toggle the engine tracks", async () => {
  const h = harness("streamer");
  await h.controller.start(h.elements);
  await h.controller.goLive();
  await h.controller.toggleMic();
  await h.controller.toggleCamera();
  expect(h.engine.calls.mic).toEqual([false]);
  expect(h.engine.calls.camera).toEqual([false]);
  expect(h.controlsLog.at(-1)).toEqual({ micEnabled: false, cameraEnabled: false, muted: true });
});

test("media reconnecting then reconnected returns to the right state", async () => {
  const h = harness("viewer");
  await h.controller.start(h.elements);
  h.engine.emit("publisher-present"); // video
  h.engine.emit("reconnecting");
  expect(h.states.at(-1)).toBe("reconnecting");
  h.engine.emit("reconnected");
  expect(h.states.at(-1)).toBe("video"); // publisher still present
});

test("a token failure yields the error state", async () => {
  const states: MediaState[] = [];
  const controller = createMediaController(
    "room",
    { onState: (s) => states.push(s), onControls: () => {} },
    {
      fetchToken: async () => ({ ok: false, error: { kind: "http", status: 404 } }),
      engineFactory: () => fakeEngine().engine,
    },
  );
  await controller.start({
    preview: document.createElement("video"),
    remote: document.createElement("video"),
  });
  expect(states).toEqual(["loading", "error"]);
});

test("a viewer connect failure yields the error state", async () => {
  const states: MediaState[] = [];
  const bad = fakeEngine();
  bad.engine.connect = async () => {
    throw new Error("no livekit server");
  };
  const controller = createMediaController(
    "room",
    { onState: (s) => states.push(s), onControls: () => {} },
    {
      fetchToken: async () => ({
        ok: true,
        value: { token: "t", url: "u", identity: "i", role: "viewer" },
      }),
      engineFactory: () => bad.engine,
      getKey: () => undefined,
    },
  );
  await controller.start({
    preview: document.createElement("video"),
    remote: document.createElement("video"),
  });
  expect(states.at(-1)).toBe("error");
});

test("stop disconnects the engine", async () => {
  const h = harness("viewer");
  await h.controller.start(h.elements);
  await h.controller.stop();
  expect(h.engine.calls.disconnect).toBe(1);
});
