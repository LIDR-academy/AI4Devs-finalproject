import { assertEquals } from 'jsr:@std/assert@1';

import { logEvent } from './logger.ts';

// @s12 -- the structured logger's signature has no parameter that can carry the raw key, so
// it is structurally impossible for a caller to pass one through -- and the shaped record
// contains only { action, outcome, userId }.
Deno.test('logEvent emits only { action, outcome, userId } to the given sink', () => {
  const calls: unknown[] = [];
  const sink = (...args: unknown[]) => calls.push(args);

  logEvent({ action: 'save', outcome: 'success', userId: 'user-1' }, sink);

  assertEquals(calls.length, 1);
  assertEquals(calls[0], [{ action: 'save', outcome: 'success', userId: 'user-1' }]);
});

// @s12 -- defaults to console.log when no sink is injected (production wiring), still shaped
// the same way.
Deno.test('logEvent defaults to console.log when no sink is given', () => {
  const original = console.log;
  const calls: unknown[] = [];
  console.log = (...args: unknown[]) => calls.push(args);

  try {
    logEvent({ action: 'save', outcome: 'invalid', userId: 'user-2' });
  } finally {
    console.log = original;
  }

  assertEquals(calls, [[{ action: 'save', outcome: 'invalid', userId: 'user-2' }]]);
});

// task-9 (Slice 2) -- the remove path reuses the exact same redacted logger; the action
// field must also accept 'remove', still shaped only as { action, outcome, userId }.
Deno.test('logEvent emits only { action, outcome, userId } for a remove action', () => {
  const calls: unknown[] = [];
  const sink = (...args: unknown[]) => calls.push(args);

  logEvent({ action: 'remove', outcome: 'success', userId: 'user-1' }, sink);

  assertEquals(calls, [[{ action: 'remove', outcome: 'success', userId: 'user-1' }]]);
});
