import type { ApiResult } from "../streams/api";
import { fetchMediaToken } from "./media-api";
// Type-only import: this keeps `livekit-client` (imported by media-engine) out of the
// controller's runtime graph, so tests inject a fake engine and never load WebRTC.
import type { MediaEngine, MediaEngineFactory } from "./media-engine";
import type { MediaRole, MediaToken } from "./types";

/** The media controller orchestrates the token fetch, the engine, and the presence state
 *  machine (design D-P3/D-P4/D-P5). All side effects — the engine and the token fetch — are
 *  injected, so the whole thing is deterministically unit-testable with a fake engine. */

export type MediaState =
  | "loading"
  | "error"
  | "prejoin"
  | "live"
  | "offline"
  | "video"
  | "reconnecting";

export type MediaControls = {
  readonly micEnabled: boolean;
  readonly cameraEnabled: boolean;
  readonly muted: boolean;
};

export type MediaHandlers = {
  onState(state: MediaState): void;
  onControls(controls: MediaControls): void;
};

export type MediaElements = {
  readonly preview: HTMLVideoElement;
  readonly remote: HTMLVideoElement;
};

export type MediaControllerDeps = {
  readonly fetchToken?: (id: string) => Promise<ApiResult<MediaToken>>;
  readonly engineFactory?: MediaEngineFactory;
};

export type MediaController = {
  start(elements: MediaElements): Promise<void>;
  goLive(): Promise<void>;
  toggleMic(): Promise<void>;
  toggleCamera(): Promise<void>;
  unmute(): void;
  stop(): Promise<void>;
  readonly role: () => MediaRole;
};

export function createMediaController(
  streamId: string,
  handlers: MediaHandlers,
  deps: MediaControllerDeps = {},
): MediaController {
  const fetchToken = deps.fetchToken ?? fetchMediaToken;

  let engine: MediaEngine | null = null;
  let role: MediaRole = "viewer";
  let url = "";
  let token = "";
  let hasPublisher = false;
  let micEnabled = true;
  let cameraEnabled = true;
  let muted = true;
  let stopped = false;

  const controls = (): MediaControls => ({ micEnabled, cameraEnabled, muted });

  async function makeEngine(): Promise<MediaEngine> {
    if (deps.engineFactory !== undefined) {
      return deps.engineFactory();
    }
    // Loaded lazily so livekit-client is never in the test import graph.
    const module = await import("./media-engine");
    return module.createLiveKitEngine();
  }

  function wire(active: MediaEngine): void {
    active.on("publisher-present", () => {
      hasPublisher = true;
      if (role === "viewer" && !stopped) {
        handlers.onState("video");
      }
    });
    active.on("publisher-absent", () => {
      hasPublisher = false;
      if (role === "viewer" && !stopped) {
        handlers.onState("offline");
      }
    });
    active.on("reconnecting", () => {
      if (!stopped) {
        handlers.onState("reconnecting");
      }
    });
    active.on("reconnected", () => {
      if (stopped) {
        return;
      }
      handlers.onState(role === "streamer" ? "live" : hasPublisher ? "video" : "offline");
    });
    active.on("disconnected", () => {
      // The engine auto-reconnects; reflect it as a calm reconnecting state.
      if (!stopped) {
        handlers.onState("reconnecting");
      }
    });
  }

  return {
    role: () => role,
    async start(elements) {
      handlers.onState("loading");
      const result = await fetchToken(streamId);
      if (stopped) {
        return;
      }
      if (!result.ok) {
        handlers.onState("error");
        return;
      }
      role = result.value.role;
      url = result.value.url;
      token = result.value.token;
      const active = await makeEngine();
      if (stopped) {
        await active.disconnect();
        return;
      }
      engine = active;
      active.setRemoteVideoElement(elements.remote);
      wire(active);
      if (role === "streamer") {
        try {
          await active.startPreview(elements.preview);
        } catch {
          handlers.onState("error");
          return;
        }
        handlers.onState("prejoin");
      } else {
        try {
          await active.connect(url, token);
        } catch {
          handlers.onState("error");
          return;
        }
        active.setRemoteMuted(true);
        handlers.onState(hasPublisher ? "video" : "offline");
      }
      handlers.onControls(controls());
    },
    async goLive() {
      if (engine === null || role !== "streamer") {
        return;
      }
      try {
        await engine.connect(url, token);
        await engine.publish();
      } catch {
        handlers.onState("error");
        return;
      }
      handlers.onState("live");
    },
    async toggleMic() {
      if (engine === null) {
        return;
      }
      micEnabled = !micEnabled;
      await engine.setMicEnabled(micEnabled);
      handlers.onControls(controls());
    },
    async toggleCamera() {
      if (engine === null) {
        return;
      }
      cameraEnabled = !cameraEnabled;
      await engine.setCameraEnabled(cameraEnabled);
      handlers.onControls(controls());
    },
    unmute() {
      if (engine === null) {
        return;
      }
      muted = false;
      engine.setRemoteMuted(false);
      handlers.onControls(controls());
    },
    async stop() {
      stopped = true;
      if (engine !== null) {
        const active = engine;
        engine = null;
        await active.disconnect();
      }
    },
  };
}
