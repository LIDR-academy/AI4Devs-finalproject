/** Production static server for the built portal. Serves files from `dist/` and falls
 *  back to `index.html` for client-side routes (SPA fallback is owned here, in the
 *  portal image — not in the reverse proxy; design D-P5/D-P7). */

/** What a request resolves to. Kept separate from Response construction so the routing
 *  logic (including the traversal guard and SPA fallback) is unit-testable. */
export type Resolution =
  | { readonly kind: "health" }
  | { readonly kind: "file"; readonly path: string }
  | { readonly kind: "fallback" };

/** Resolve a pathname to a file inside `distDir`, or null if it escapes `distDir`. */
function safePath(pathname: string, distDir: URL): string | null {
  let clean: string;
  try {
    clean = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (clean.includes("\0")) {
    return null;
  }
  const target = new URL(`.${clean}`, distDir);
  if (!target.pathname.startsWith(distDir.pathname)) {
    return null;
  }
  return target.pathname;
}

/** Decide how to serve a request: health check, an existing file, or the SPA fallback.
 *  Anything that is not an existing in-bounds file falls back to `index.html`. */
export async function resolveRequest(pathname: string, distDir: URL): Promise<Resolution> {
  if (pathname === "/healthz") {
    return { kind: "health" };
  }
  if (pathname !== "/") {
    const filePath = safePath(pathname, distDir);
    if (filePath !== null && (await Bun.file(filePath).exists())) {
      return { kind: "file", path: filePath };
    }
  }
  return { kind: "fallback" };
}

/** Build the request handler for a given built-assets directory. */
export function createHandler(distDir: URL): (request: Request) => Promise<Response> {
  const indexFile = new URL("index.html", distDir);
  return async function handle(request: Request): Promise<Response> {
    const resolution = await resolveRequest(new URL(request.url).pathname, distDir);
    if (resolution.kind === "health") {
      return new Response("ok", { status: 200 });
    }
    if (resolution.kind === "file") {
      return new Response(Bun.file(resolution.path));
    }
    return new Response(Bun.file(indexFile), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  };
}

// Start the server only when run directly (not when imported by tests).
if (import.meta.main) {
  const port = Number(process.env.PORT ?? "3000");
  const distDir = new URL("./dist/", import.meta.url);
  Bun.serve({ port, fetch: createHandler(distDir) });
  console.log(`qc-portal serving ./dist on :${port}`);
}
