/**
 * The supported AI-provider union (spec.md Open decision 2). v1 ships a single provider
 * (Groq, via the Vercel AI SDK -- swapped from OpenAI, ai-lesson-generation Open decision #1)
 * -- the union keeps the seam open for more without reshaping callers.
 */
export type AiProvider = 'groq';

/** The closed allow-list index.ts checks body.provider against before dispatch (Full review
 * round 1, Minor 11) -- a truthiness check alone would let any non-empty string reach the
 * save RPC, which has no check constraint on user_ai_keys.provider. */
const AI_PROVIDERS: readonly AiProvider[] = ['groq'];

export const isAiProvider = (value: unknown): value is AiProvider =>
  typeof value === 'string' && (AI_PROVIDERS as readonly string[]).includes(value);
