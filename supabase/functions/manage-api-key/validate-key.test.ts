import { assertEquals } from 'jsr:@std/assert@1';

import { classifyProbeStatus, isAiProvider, validateKey } from './validate-key.ts';

// @s1 (server half, task-2) -- a 2xx provider-probe response classifies as 'valid'.
Deno.test('classifyProbeStatus classifies 200 as valid', () => {
  assertEquals(classifyProbeStatus(200), 'valid');
});

Deno.test('classifyProbeStatus classifies 201 as valid (whole 2xx range, not just 200)', () => {
  assertEquals(classifyProbeStatus(201), 'valid');
});

// task-2 Done criteria -- "isolated, Deno-unit-tested classifier (2xx/401/403/other)".
Deno.test('classifyProbeStatus classifies 401 as invalid', () => {
  assertEquals(classifyProbeStatus(401), 'invalid');
});

Deno.test('classifyProbeStatus classifies 403 as invalid', () => {
  assertEquals(classifyProbeStatus(403), 'invalid');
});

// risks.md R4 -- never claim "invalid" for a transient failure (rate limit / server error).
Deno.test('classifyProbeStatus classifies 429 as transient', () => {
  assertEquals(classifyProbeStatus(429), 'transient');
});

Deno.test('classifyProbeStatus classifies 500 as transient', () => {
  assertEquals(classifyProbeStatus(500), 'transient');
});

Deno.test('validateKey calls the OpenAI models endpoint with a bearer token and classifies a 2xx response as valid', async () => {
  let capturedUrl: string | undefined;
  let capturedHeaders: HeadersInit | undefined;
  const fakeFetch = (url: string | URL, init?: RequestInit) => {
    capturedUrl = url.toString();
    capturedHeaders = init?.headers;
    return Promise.resolve(new Response(null, { status: 200 }));
  };

  const outcome = await validateKey('openai', 'sk-test-key', fakeFetch);

  assertEquals(outcome, 'valid');
  assertEquals(capturedUrl, 'https://api.openai.com/v1/models');
  assertEquals(capturedHeaders, { Authorization: 'Bearer sk-test-key' });
});

Deno.test('validateKey classifies a 401 response as invalid', async () => {
  const fakeFetch = () => Promise.resolve(new Response(null, { status: 401 }));

  assertEquals(await validateKey('openai', 'sk-bad-key', fakeFetch), 'invalid');
});

// risks.md R4 -- a thrown/rejected fetch (offline, timeout, DNS failure) must never be
// classified as invalid_key -- it is always 'transient' (safer default).
Deno.test('validateKey classifies a thrown fetch exception as transient', async () => {
  const fakeFetch = () => Promise.reject(new TypeError('network down'));

  assertEquals(await validateKey('openai', 'sk-test-key', fakeFetch), 'transient');
});

// Full review round 1, Minor 15 -- a hung (never resolving/rejecting) provider connection must
// not hold the Edge Function invocation open indefinitely. validateKey must give fetchImpl an
// AbortSignal so a caller-side timeout can actually cut the request off.
Deno.test('validateKey passes an AbortSignal to the probe fetch so a hung request cannot hang forever', async () => {
  let capturedSignal: AbortSignal | undefined;
  const fakeFetch = (_url: string | URL, init?: RequestInit) => {
    capturedSignal = init?.signal ?? undefined;
    return Promise.resolve(new Response(null, { status: 200 }));
  };

  await validateKey('openai', 'sk-test-key', fakeFetch);

  assertEquals(capturedSignal instanceof AbortSignal, true);
});

// Full review round 1, Minor 15 -- once the signal is wired, an abort (timeout) must classify
// the same as any other transient outcome (risks.md R4's safer default), never invalid_key.
// Uses a tiny injected timeout so this stays fast and never actually hangs.
Deno.test('validateKey classifies an aborted (timed-out) probe fetch as transient', async () => {
  const fakeFetch = (_url: string | URL, init?: RequestInit): Promise<Response> =>
    new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('signal timed out', 'TimeoutError')));
    });

  const outcome = await validateKey('openai', 'sk-test-key', fakeFetch, 10);

  assertEquals(outcome, 'transient');
});

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
