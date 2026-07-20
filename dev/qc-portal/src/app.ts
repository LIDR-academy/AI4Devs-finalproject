import type { Route } from "./router/router";
import { currentPath, onNavigate, resolve } from "./router/router";
import { createHome } from "./streams/home";
import { NotFound } from "./streams/not-found";
import { createStreamPage } from "./streams/stream-page";

/** The app shell: resolve the current route and render its view into the root,
 *  re-rendering on navigation. */

function viewFor(route: Route): HTMLElement {
  switch (route.name) {
    case "home":
      return createHome().el;
    case "stream":
      return createStreamPage(route.id).el;
    case "not-found":
      return NotFound();
  }
}

/** Mount the app into a root element and keep it in sync with the current route. */
export function mountApp(root: HTMLElement): void {
  const render = (): void => {
    root.replaceChildren(viewFor(resolve(currentPath())));
  };
  onNavigate(render);
  render();
}
