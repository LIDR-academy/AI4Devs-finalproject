/**
 * Blocks until the application under test is proven up, and refuses to let the
 * acceptance suite run against anything this run did not start.
 *
 * Two distinct hazards are closed here, both of them observed rather than
 * theorised:
 *
 * 1. **A stale server would be tested instead of the build.** Nx tears a
 *    continuous task down with `tree-kill`, but its `process.on('exit')`
 *    handler cannot await that asynchronous `taskkill`, so on Windows the
 *    server can outlive its run. The next run's process then dies with
 *    `EADDRINUSE` while the suite passes against the survivor — a green that
 *    proves nothing. `serve-under-test.mjs` refuses to start in that case, and
 *    the marker it would have written stays absent, which is what this script
 *    turns into a failure. Nx does not do it for us: a continuous task that
 *    exits before matching its `readyWhen` never fires its exit callbacks
 *    (`nx/src/executors/run-commands/running-tasks.js`), so the scheduler
 *    still starts the suite.
 *
 * 2. **The suite could start before the server does.** Nx considers a
 *    continuous dependency satisfied once it is merely *registered* as running
 *    (`tasks-schedule.js` checks `runningTasks.has(id)`) — `readyWhen` gates
 *    how that task reports itself, not when its dependents begin. Checking
 *    once is therefore a race, and it loses often enough to be seen: roughly
 *    one run in three failed with "no run marker" before this poll existed.
 *
 * So the wait is the point: the marker appears, its process is alive, and the
 * port answers — or the suite does not run at all.
 *
 * Usage: node tools/e2e/assert-under-test.mjs <marker-path> [timeoutMs]
 */
import fs from 'node:fs';

const [, , markerPath, rawTimeout] = process.argv;

if (!markerPath) {
  console.error('assert-under-test: a marker path argument is required.');
  process.exit(2);
}

const timeoutMs = Number(rawTimeout ?? 60_000);
const pollIntervalMs = 250;
const deadline = Date.now() + timeoutMs;

/** The marker, or undefined while it has not been written yet. */
function readMarker() {
  try {
    return JSON.parse(fs.readFileSync(markerPath, 'utf8'));
  } catch {
    // Absent, or caught mid-write — either way, not yet usable.
    return undefined;
  }
}

/** True when the recorded process is alive and its port is answering. */
async function isUnderTest(marker) {
  try {
    // Signal 0 performs the permission and existence check without delivering
    // anything: it throws when no such process is alive.
    process.kill(marker.pid, 0);
  } catch {
    return false;
  }

  try {
    await fetch(`http://localhost:${marker.port}/`, { redirect: 'manual' });
    return true;
  } catch {
    return false;
  }
}

for (;;) {
  const marker = readMarker();

  if (marker?.refused) {
    console.error(
      `assert-under-test: the application under test was never started — ${marker.reason}.\n` +
        'Refusing to report a result that would not be about the build under test.',
    );
    process.exit(1);
  }

  if (marker && (await isUnderTest(marker))) {
    console.log(
      `assert-under-test: ${marker.entryPoint} is under test on port ${marker.port} (pid ${marker.pid}).`,
    );
    break;
  }

  if (Date.now() >= deadline) {
    console.error(
      `assert-under-test: no application under test after ${timeoutMs}ms (marker: ${markerPath}).\n` +
        'Refusing to report a result that would not be about the build under ' +
        'test. The reason is in the output of the serve step above — most ' +
        'often a leftover server already holding the port.',
    );
    process.exit(1);
  }

  await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
}
