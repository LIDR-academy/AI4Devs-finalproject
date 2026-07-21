import van from "vanjs-core";
import { COPY } from "../streams/copy";
import {
  createMediaController,
  type MediaControllerDeps,
  type MediaControls,
  type MediaHandlers,
  type MediaState,
} from "./media-controller";

/** The media panel renders the camera area from the controller's state (design D-P8) and
 *  wires the controls back to it. State is applied imperatively (not reactive bindings) so
 *  it updates synchronously and is easy to assert. The controller/engine are injected. */

const { div, p, video, button } = van.tags;

export type MediaPanel = {
  readonly el: HTMLElement;
  mount(): void;
  unmount(): void;
};

function quietText(text: string): HTMLElement {
  return p(
    { class: "px-4 text-center font-mono text-xs uppercase tracking-wide text-gray-strong" },
    text,
  );
}

function stateMessage(state: MediaState): string {
  if (state === "error") {
    return COPY.mediaError;
  }
  if (state === "offline") {
    return COPY.mediaOffline;
  }
  if (state === "reconnecting") {
    return COPY.mediaReconnecting;
  }
  return COPY.mediaLoading;
}

export function createMediaPanel(streamId: string, deps: MediaControllerDeps = {}): MediaPanel {
  // The video surface is 0 radius, no chrome (style §7). Preview is the creator's own
  // camera (muted); remote is the viewer's subscribed video.
  const preview = video({
    class: "w-full h-full object-cover",
    autoplay: true,
    muted: true,
    playsinline: true,
  });
  const remote = video({ class: "w-full h-full object-cover", autoplay: true, playsinline: true });

  // Solid ink/paper tap-to-unmute (D8) — never translucent text over video; AA guaranteed.
  const unmuteButton = button(
    {
      class: "btn btn-primary transition-calm absolute bottom-3 left-3",
      type: "button",
      onclick: () => controller.unmute(),
    },
    COPY.tapToUnmute,
  );
  const goLiveButton = button(
    {
      class: "btn btn-primary transition-calm",
      type: "button",
      onclick: () => {
        void controller.goLive();
      },
    },
    COPY.goLiveAction,
  );
  const micButton = button(
    {
      class: "btn btn-secondary transition-calm",
      type: "button",
      onclick: () => {
        void controller.toggleMic();
      },
    },
    COPY.muteMicAction,
  );
  const cameraButton = button(
    {
      class: "btn btn-secondary transition-calm",
      type: "button",
      onclick: () => {
        void controller.toggleCamera();
      },
    },
    COPY.cameraOffAction,
  );

  const stage = div(
    { class: "relative flex-1 min-h-0 flex items-center justify-center" },
    quietText(COPY.mediaLoading),
  );
  const controlsBar = div({ class: "flex gap-2 justify-center empty:hidden p-3" });

  const el = div(
    {
      class:
        "relative flex flex-col bg-gray-fill border border-gray-line min-h-64 h-full overflow-hidden",
      "aria-label": "Media",
    },
    stage,
    controlsBar,
  );

  let controls: MediaControls = { micEnabled: true, cameraEnabled: true, muted: true };
  let lastState: MediaState = "loading";

  const applyControlLabels = (): void => {
    micButton.textContent = controls.micEnabled ? COPY.muteMicAction : COPY.unmuteMicAction;
    cameraButton.textContent = controls.cameraEnabled ? COPY.cameraOffAction : COPY.cameraOnAction;
  };

  const render = (): void => {
    if (lastState === "prejoin" || lastState === "live") {
      stage.replaceChildren(preview);
    } else if (lastState === "video") {
      stage.replaceChildren(remote, ...(controls.muted ? [unmuteButton] : []));
    } else {
      stage.replaceChildren(quietText(stateMessage(lastState)));
    }
    if (lastState === "prejoin") {
      controlsBar.replaceChildren(goLiveButton);
    } else if (lastState === "live") {
      applyControlLabels();
      controlsBar.replaceChildren(micButton, cameraButton);
    } else {
      controlsBar.replaceChildren();
    }
  };

  const handlers: MediaHandlers = {
    onState: (state) => {
      lastState = state;
      render();
    },
    onControls: (next) => {
      controls = next;
      render();
    },
  };

  const controller = createMediaController(streamId, handlers, deps);

  return {
    el,
    mount: () => {
      void controller.start({ preview, remote });
    },
    unmount: () => {
      void controller.stop();
    },
  };
}
