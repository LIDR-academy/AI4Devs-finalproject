/**
 * Blocks until an HTTP endpoint answers, then exits.
 *
 * Nx considers a continuous task ready as soon as its process has *started*,
 * not when the thing it serves is accepting connections (`tasks-schedule.js`:
 * a continuous dependency counts as satisfied once it is in `runningTasks`).
 * For `nx:run-commands` that gap is closed natively by `readyWhen`, which
 * matches a line of the child's output — that is how `api-e2e` waits for
 * `apps/api` to log that it is listening.
 *
 * `web:serve` runs `@angular/build:dev-server`, an executor this repository
 * must not modify (T-C10-06 leaves `apps/web` untouched), so it has no
 * `readyWhen` to give. Without this wait, Cypress starts while the dev server
 * is still building and gives up after its own four short retries:
 *
 *     Cypress failed to verify that your server is running.
 *
 * Any response at all means ready: a 404 proves a listener as well as a 200
 * does, and this script is about the socket, never about the payload.
 *
 * Usage: node tools/e2e/wait-for-http.mjs <url> [timeoutMs]
 */
const [, , url, rawTimeout] = process.argv;

if (!url) {
  console.error('wait-for-http: a URL argument is required.');
  process.exit(2);
}

const timeoutMs = Number(rawTimeout ?? 120_000);
const pollIntervalMs = 500;
const deadline = Date.now() + timeoutMs;

/** Resolves true as soon as the server produces any HTTP response. */
async function isAnswering() {
  try {
    await fetch(url, { redirect: 'manual' });
    return true;
  } catch {
    // ECONNREFUSED while the server is still coming up — the expected case.
    return false;
  }
}

while (!(await isAnswering())) {
  if (Date.now() >= deadline) {
    console.error(
      `wait-for-http: ${url} did not answer within ${timeoutMs}ms — the server under test never came up.`,
    );
    process.exit(1);
  }
  await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
}

console.log(`wait-for-http: ${url} is answering.`);
