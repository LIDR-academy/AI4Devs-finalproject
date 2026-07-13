import { assertEquals } from 'jsr:@std/assert@1';

import { handleSaveApiKey } from './handle-save.ts';

const params = { userId: 'user-1', provider: 'openai' as const, apiKey: 'sk-test-key' };

// @s1 (server half, task-2) -- the key is stored and the caller gets back a masked status
// only (never the raw key).
Deno.test('handleSaveApiKey stores the key and returns a masked status', async () => {
  const storeCalls: unknown[] = [];
  const result = await handleSaveApiKey(params, {
    storeApiKey: (args) => {
      storeCalls.push(args);
      return Promise.resolve({ provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
    },
    log: () => {},
  });

  assertEquals(storeCalls, [params]);
  assertEquals(result, { hasKey: true, provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' });
});

// @s12 -- across a full (successful) save run, the raw key value never appears in any log call.
Deno.test('handleSaveApiKey never logs the raw key value across a save run', async () => {
  const logCalls: unknown[] = [];
  await handleSaveApiKey(params, {
    storeApiKey: () => Promise.resolve({ provider: 'openai', updatedAt: '2026-01-01T00:00:00.000Z' }),
    log: (event) => logCalls.push(event),
  });

  const serialized = JSON.stringify(logCalls);
  assertEquals(serialized.includes(params.apiKey), false);
  assertEquals(logCalls, [{ action: 'save', outcome: 'success', userId: 'user-1' }]);
});
