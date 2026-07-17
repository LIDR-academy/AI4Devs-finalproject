import { assertEquals } from 'jsr:@std/assert@1';

import { handleRemoveApiKey } from './handle-remove.ts';

const params = { userId: 'user-1' };

// @s8 (server half, task-9) -- a successful remove deletes the Vault secret + metadata row
// (delegated to the injected removeApiKey) and replies with the no-key status.
Deno.test('handleRemoveApiKey removes the stored key and returns hasKey: false on success', async () => {
  const removeCalls: unknown[] = [];
  const result = await handleRemoveApiKey(params, {
    removeApiKey: (args) => {
      removeCalls.push(args);
      return Promise.resolve();
    },
    log: () => {},
  });

  assertEquals(removeCalls, [params]);
  assertEquals(result, { hasKey: false });
});

// @s9 (server half) -- a failed remove (thrown/rejected) normalizes to network_error and
// leaves the stored key intact -- there is no store/delete side effect on this path beyond
// the single injected removeApiKey call, which itself rejected.
Deno.test('handleRemoveApiKey returns network_error when the removal fails', async () => {
  const result = await handleRemoveApiKey(params, {
    removeApiKey: () => Promise.reject(new Error('delete failed')),
    log: () => {},
  });

  assertEquals(result, { code: 'network_error' });
});

// @s12 -- across a full (successful) remove run, the raw key is never involved and the log
// call is shaped only as { action, outcome, userId }.
Deno.test('handleRemoveApiKey logs only { action, outcome, userId } across a remove run', async () => {
  const logCalls: unknown[] = [];
  await handleRemoveApiKey(params, {
    removeApiKey: () => Promise.resolve(),
    log: (event) => logCalls.push(event),
  });

  assertEquals(logCalls, [{ action: 'remove', outcome: 'success', userId: 'user-1' }]);
});
