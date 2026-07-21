import {
  createLocalTracks,
  type LocalTrack,
  type RemoteTrack,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";

/** The media engine seam (design D-P3). This is the ONLY module that imports
 *  `livekit-client`. The controller depends on this interface, not on LiveKit, so it can
 *  be unit-tested with a fake engine — no WebRTC. The real implementation is thin (map
 *  LiveKit events to normalized events, attach tracks to the DOM) and is exercised by the
 *  compose E2E with Chrome fake devices, not by unit tests. */

/** Normalized events the controller understands, independent of LiveKit's event set. */
export type MediaEngineEvent =
  | "publisher-present"
  | "publisher-absent"
  | "reconnecting"
  | "reconnected"
  | "disconnected";

export type MediaEngine = {
  /** Where a subscribed remote video track is attached (viewer). Set before connect. */
  setRemoteVideoElement(element: HTMLVideoElement): void;
  /** Creator pre-join: acquire camera/mic and show a local preview. Does NOT publish. */
  startPreview(previewElement: HTMLVideoElement): Promise<void>;
  /** Connect to the LiveKit room at `url` with `token`. */
  connect(url: string, token: string): Promise<void>;
  /** Creator go-live: publish the previously-acquired camera + mic tracks. */
  publish(): Promise<void>;
  setMicEnabled(enabled: boolean): Promise<void>;
  setCameraEnabled(enabled: boolean): Promise<void>;
  /** Viewer audio: start muted (autoplay policy), unmute on the user gesture. */
  setRemoteMuted(muted: boolean): void;
  on(event: MediaEngineEvent, handler: () => void): void;
  disconnect(): Promise<void>;
};

export type MediaEngineFactory = () => MediaEngine | Promise<MediaEngine>;

/** The real engine, backed by a `livekit-client` Room. Thin glue only — no manual SDP/ICE. */
export function createLiveKitEngine(): MediaEngine {
  const room = new Room();
  const listeners = new Map<MediaEngineEvent, Array<() => void>>();
  let localTracks: LocalTrack[] = [];
  let remoteVideoElement: HTMLVideoElement | null = null;
  let remoteAudioElement: HTMLMediaElement | null = null;
  let remoteMuted = true;

  const emit = (event: MediaEngineEvent): void => {
    for (const handler of listeners.get(event) ?? []) {
      handler();
    }
  };

  room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
    if (track.kind === Track.Kind.Video && remoteVideoElement !== null) {
      track.attach(remoteVideoElement);
      emit("publisher-present");
    } else if (track.kind === Track.Kind.Audio) {
      remoteAudioElement = track.attach();
      remoteAudioElement.muted = remoteMuted;
    }
  });
  room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack) => {
    track.detach();
    if (track.kind === Track.Kind.Video) {
      emit("publisher-absent");
    }
  });
  room.on(RoomEvent.Reconnecting, () => emit("reconnecting"));
  room.on(RoomEvent.Reconnected, () => emit("reconnected"));
  room.on(RoomEvent.Disconnected, () => emit("disconnected"));

  return {
    setRemoteVideoElement(element) {
      remoteVideoElement = element;
    },
    async startPreview(previewElement) {
      localTracks = await createLocalTracks({ audio: true, video: true });
      for (const track of localTracks) {
        if (track.kind === Track.Kind.Video) {
          track.attach(previewElement);
        }
      }
    },
    async connect(url, token) {
      await room.connect(url, token);
    },
    async publish() {
      for (const track of localTracks) {
        await room.localParticipant.publishTrack(track);
      }
    },
    async setMicEnabled(enabled) {
      await room.localParticipant.setMicrophoneEnabled(enabled);
    },
    async setCameraEnabled(enabled) {
      await room.localParticipant.setCameraEnabled(enabled);
    },
    setRemoteMuted(muted) {
      remoteMuted = muted;
      if (remoteAudioElement !== null) {
        remoteAudioElement.muted = muted;
      }
    },
    on(event, handler) {
      const handlers = listeners.get(event) ?? [];
      handlers.push(handler);
      listeners.set(event, handlers);
    },
    async disconnect() {
      for (const track of localTracks) {
        track.stop();
      }
      await room.disconnect();
    },
  };
}
