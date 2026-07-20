/** Minimal client-side router over the History API (design D-P5). Route resolution is a
 *  pure function; navigation is the one side-effecting entry point for redirects. */

export type Route =
  | { readonly name: "home" }
  | { readonly name: "stream"; readonly id: string }
  | { readonly name: "not-found" };

/** Map a pathname to a route. Pure — no globals, so it is trivially testable. */
export function resolve(path: string): Route {
  if (path === "/") {
    return { name: "home" };
  }
  const match = path.match(/^\/stream\/([^/]+)$/);
  const id = match?.[1];
  if (id !== undefined) {
    return { name: "stream", id: decodeURIComponent(id) };
  }
  return { name: "not-found" };
}

/** The browser's current pathname. */
export function currentPath(): string {
  return window.location.pathname;
}

/** Navigate to a path and notify listeners. The single redirect entry point. */
export function navigate(path: string): void {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/** Subscribe to navigation (both `navigate()` and browser back/forward). */
export function onNavigate(handler: () => void): void {
  window.addEventListener("popstate", handler);
}
