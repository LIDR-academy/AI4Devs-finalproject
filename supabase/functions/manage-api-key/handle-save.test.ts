import { assertEquals } from 'jsr:@std/assert@1';

import { handleSaveApiKey } from './handle-save.ts';

const params = { userId: 'user-1', provider: 'openai' as const, apiKey: 'sk-test-key' };

// @s1 (server half, task-2) -- probe classifies 'valid' -> the key is stored and the caller
// gets back a masked status only (never the raw key).
Deno.test('handleSaveApiKey stores the key and returns a masked status when the probe is valid', async () => {
  const storeCalls: unknown[] = [];
  const result = await handleSaveApiKey(params, {
    validateKey: () => Promise.resolve('valid'),
    storeApiKey: (args) => {
      storeCalls.push(args);
      return Promise.resolve({ provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    },
    log: () => {},
  });

  assertEquals(storeCalls, [params]);
  assertEquals(result, { hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
});

// task-2 Goal ("validate-THEN-store") -- an invalid probe result must never trigger a store
// call; the deeper per-status-code / remove-action Deno-test suite is task-9's own scope
// (Slice 2), this only pins the save gate itself.
// Full review round 1, Minor 5 -- also asserts the log call itself (previously only the valid
// path's log call was asserted; deleting deps.log(...) on this branch went undetected).
Deno.test('handleSaveApiKey does not store the key and logs the outcome when the probe is invalid', async () => {
  const storeCalls: unknown[] = [];
  const logCalls: unknown[] = [];
  const result = await handleSaveApiKey(params, {
    validateKey: () => Promise.resolve('invalid'),
    storeApiKey: (args) => {
      storeCalls.push(args);
      return Promise.resolve({ provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    },
    log: (event) => logCalls.push(event),
  });

  assertEquals(storeCalls, []);
  assertEquals(result, { code: 'invalid_key' });
  assertEquals(logCalls, [{ action: 'save', outcome: 'invalid', userId: 'user-1' }]);
});

Deno.test('handleSaveApiKey does not store the key and logs the outcome when the probe is transient', async () => {
  const storeCalls: unknown[] = [];
  const logCalls: unknown[] = [];
  const result = await handleSaveApiKey(params, {
    validateKey: () => Promise.resolve('transient'),
    storeApiKey: (args) => {
      storeCalls.push(args);
      return Promise.resolve({ provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    },
    log: (event) => logCalls.push(event),
  });

  assertEquals(storeCalls, []);
  assertEquals(result, { code: 'network_error' });
  assertEquals(logCalls, [{ action: 'save', outcome: 'transient', userId: 'user-1' }]);
});

// @s12 -- across a full (successful) save run, the raw key value never appears in any log call.
Deno.test('handleSaveApiKey never logs the raw key value across a save run', async () => {
  const logCalls: unknown[] = [];
  await handleSaveApiKey(params, {
    validateKey: () => Promise.resolve('valid'),
    storeApiKey: () => Promise.resolve({ provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' }),
    log: (event) => logCalls.push(event),
  });

  const serialized = JSON.stringify(logCalls);
  assertEquals(serialized.includes(params.apiKey), false);
  assertEquals(logCalls, [{ action: 'save', outcome: 'success', userId: 'user-1' }]);
});
