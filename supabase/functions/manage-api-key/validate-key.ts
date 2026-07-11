/**
 * The lightweight, no-cost provider auth probe (spec.md Open decision 2). Deliberately does
 * NOT implement generation (PRD R2) -- it only checks that the submitted key authenticates.
 */

export type AiProvider = 'openai';

/** The closed allow-list index.ts checks body.provider against before dispatch (Full review
 * round 1, Minor 11) -- a truthiness check alone would let any non-empty string reach the
 * save RPC, which has no check constraint on user_ai_keys.provider. */
const AI_PROVIDERS: readonly AiProvider[] = ['openai'];

export const isAiProvider = (value: unknown): value is AiProvider =>
  typeof value === 'string' && (AI_PROVIDERS as readonly string[]).includes(value);

/** The three outcomes the probe can ever produce -- the handler above this never sees a raw
 * status code or a thrown exception, only this closed classification. */
export type ProbeOutcome = 'valid' | 'invalid' | 'transient';

type FetchLike = (url: string | URL, init?: RequestInit) => Promise<Response>;

const PROBE_URL: Record<AiProvider, string> = {
  openai: 'https://api.openai.com/v1/models',
};

/** Full review round 1, Minor 15 -- caps how long a single probe call may hold the Edge
 * Function invocation open. A hung (not just erroring) provider connection must not block
 * indefinitely; an abort past this window classifies the same as any other transient failure. */
const PROBE_TIMEOUT_MS = 5000;

/**
 * Classifies a provider probe's HTTP status. 2xx -> valid. 401/403 (invalid/revoked
 * credentials) -> invalid. Everything else (429/5xx/etc.) -> transient -- risks.md R4:
 * never claim "invalid" for a failure that isn't actually about the key's validity.
 */
export const classifyProbeStatus = (status: number): ProbeOutcome => {
  if (status >= 200 && status < 300) return 'valid';
  if (status === 401 || status === 403) return 'invalid';
  return 'transient';
};

/**
 * Runs the provider probe for the given key. A thrown/rejected fetch (offline, timeout, DNS
 * failure -- never actually reaching the provider) classifies as 'transient', the same safe
 * default as an unexpected non-2xx/401/403 status.
 */
export const validateKey = async (
  provider: AiProvider,
  apiKey: string,
  fetchImpl: FetchLike = fetch,
  timeoutMs: number = PROBE_TIMEOUT_MS,
): Promise<ProbeOutcome> => {
  try {
    const response = await fetchImpl(PROBE_URL[provider], {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
    return classifyProbeStatus(response.status);
  } catch {
    return 'transient';
  }
};
