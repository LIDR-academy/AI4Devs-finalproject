/**
 * Starts an application under test for an acceptance run, and leaves behind the
 * evidence that lets the suite verify it is talking to *this* run's process.
 *
 * Why this exists rather than a bare `node dist/apps/api/main.js`:
 *
 * 1. **A leftover server makes a green run meaningless.** Nx tears a continuous
 *    task down with `tree-kill`, but its `process.on('exit')` handler cannot
 *    await that asynchronous `taskkill`, so on Windows the server can outlive
 *    the run. The next run's freshly built process then dies with `EADDRINUSE`
 *    while Cypress happily exercises the stale one and reports success — a
 *    green that proves nothing, which is worse than a red. This script refuses
 *    to start when the port is already answering.
 *
 * 2. **Nx does not propagate that refusal.** A continuous task that exits
 *    before matching its `readyWhen` never fires its exit callbacks
 *    (`nx/src/executors/run-commands/running-tasks.js`), so the scheduler still
 *    considers it started and runs the suite anyway. Refusing to start is
 *    therefore not enough on its own: the run marker written below is what the
 *    suite checks (`assert-under-test.mjs`) before it agrees to run at all.
 *
 * 3. **It takes the child down with it.** When the parent goes away the pipe on
 *    stdin closes; that is the signal used here to stop the application and
 *    remove the marker, so the normal case leaves nothing behind.
 *
 * Usage: node tools/e2e/serve-under-test.mjs <entry-point> <marker-path>
 * `PORT` (and whatever else the application validates at boot) comes from the
 * environment the Nx target supplies — never from a `.env` file, which is
 * gitignored and therefore absent in a clean checkout.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [, , entryPoint, markerPath] = process.argv;
const port = Number(process.env.PORT);

if (!entryPoint || !markerPath || !Number.isInteger(port)) {
  console.error(
    'serve-under-test: an entry point, a marker path and a numeric PORT are required.',
  );
  process.exit(2);
}

/**
 * The marker of any previous run goes first, and before the port is even
 * probed: whatever happens next, a suite must never find a marker that this
 * run did not write.
 */
fs.rmSync(markerPath, { force: true });

/** True when anything is already listening on the port under test. */
async function portIsTaken() {
  try {
    await fetch(`http://localhost:${port}/`, { redirect: 'manual' });
    return true;
  } catch {
    return false;
  }
}

if (await portIsTaken()) {
  const reason =
    `something is already listening on port ${port}, so the suite would test ` +
    'that process instead of the build under test';

  console.error(
    `serve-under-test: ${reason}.\nRefusing to start. Stop it and run again.`,
  );

  // The refusal travels in the marker the suite already waits for, so
  // `assert-under-test` can fail in the next second instead of waiting out its
  // whole timeout for something that is never going to appear. Nothing removes
  // this file afterwards: the cleanup handlers below are registered only after
  // a successful spawn, and every run deletes the marker before probing.
  fs.mkdirSync(path.dirname(markerPath), { recursive: true });
  fs.writeFileSync(
    markerPath,
    JSON.stringify({ refused: true, reason, port }, null, 2) + '\n',
  );

  process.exit(1);
}

const child = spawn(process.execPath, [entryPoint], {
  stdio: ['ignore', 'inherit', 'inherit'],
  env: process.env,
});

fs.mkdirSync(path.dirname(markerPath), { recursive: true });
fs.writeFileSync(
  markerPath,
  JSON.stringify(
    { pid: child.pid, port, entryPoint, startedAt: new Date().toISOString() },
    null,
    2,
  ) + '\n',
);

let stopping = false;

function stop(signal = 'SIGTERM') {
  if (stopping) {
    return;
  }
  stopping = true;
  fs.rmSync(markerPath, { force: true });
  child.kill(signal);
}

// The parent's pipe closing is what tells us the run is over.
process.stdin.on('close', () => stop());
process.stdin.on('end', () => stop());
process.stdin.resume();

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => stop(signal));
}
process.on('exit', () => {
  fs.rmSync(markerPath, { force: true });
  child.kill('SIGKILL');
});

// The application exiting on its own is a failure of the run: it is supposed to
// stay up until the suite is done with it.
child.on('exit', (code, signal) => {
  fs.rmSync(markerPath, { force: true });
  process.exit(stopping ? 0 : (code ?? (signal ? 1 : 0)));
});
