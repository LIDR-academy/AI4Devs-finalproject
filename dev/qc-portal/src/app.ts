import { createRoomPage } from "./room/room-page";
import type { Route } from "./router/router";
import { currentPath, onNavigate, resolve } from "./router/router";
import { createHome } from "./streams/home";
import { NotFound } from "./streams/not-found";

/** The app shell: resolve the current route and render its view into the root,
 *  re-rendering on navigation. A view may return a `teardown` (e.g. the room page
 *  closes its WebSocket) that runs before the next view mounts. */

type View = { readonly el: HTMLElement; readonly teardown?: () => void };

function viewFor(route: Route): View {
  switch (route.name) {
    case "home":
      return { el: createHome().el };
    case "stream": {
      const room = createRoomPage(route.id);
      return { el: room.el, teardown: room.unmount };
    }
    case "not-found":
      return { el: NotFound() };
  }
}

/** Mount the app into a root element and keep it in sync with the current route. */
export function mountApp(root: HTMLElement): void {
  let teardown: (() => void) | null = null;
  const render = (): void => {
    teardown?.();
    const view = viewFor(resolve(currentPath()));
    root.replaceChildren(view.el);
    teardown = view.teardown ?? null;
  };
  onNavigate(render);
  render();
}
