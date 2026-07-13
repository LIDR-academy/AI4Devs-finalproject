import { assertEquals } from 'jsr:@std/assert@1';

import { isAiProvider } from './provider.ts';

// Full review round 1, Minor 11 -- index.ts must validate body.provider is actually a member
// of the closed AiProvider union (not just truthy) before dispatching. No check constraint
// exists on user_ai_keys.provider, so an arbitrary string could otherwise be persisted.
Deno.test('isAiProvider accepts the known provider', () => {
  assertEquals(isAiProvider('openai'), true);
});

Deno.test('isAiProvider rejects an unrecognized provider string', () => {
  assertEquals(isAiProvider('anthropic'), false);
});

Deno.test('isAiProvider rejects non-string values (including undefined/missing)', () => {
  assertEquals(isAiProvider(undefined), false);
  assertEquals(isAiProvider(42), false);
});
