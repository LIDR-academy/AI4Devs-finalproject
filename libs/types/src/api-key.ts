/**
 * The supported AI-provider union (spec.md Open decision 2). v1 ships a single provider
 * (Groq, via the Vercel AI SDK -- swapped from OpenAI, ai-lesson-generation Open decision #1)
 * -- the union keeps the seam open for more without reshaping callers.
 */
export type AiProvider = 'groq';

/**
 * The **only** thing the client ever learns about a saved key (spec.md "No key material in
 * the client contract"). No key characters, no last-4 hint -- a boolean/provider/timestamp
 * indicator is the whole masked-state contract (AC8/AC11, @s3/@s11).
 */
export type ApiKeyStatus = {
  hasKey: boolean;
  provider?: AiProvider;
  updatedAt?: string;
};

/** Parameters for `ApiKeyService.saveApiKey` / `ApiKeyDao.saveApiKey`. */
export type SaveApiKeyParams = {
  provider: AiProvider;
  apiKey: string;
};

/**
 * Compile-time shape lock (@s11): `ApiKeyStatus` may only ever have exactly these three keys.
 * A `keyof` equality check (rather than a plain assignability check, which structural typing
 * would let extra properties silently pass unnoticed) resolves to `never` the moment a future
 * edit widens the type to carry any key-shaped field (e.g. `key`/`lastFour`) -- assigning that
 * result to a `true`-typed const then fails `pnpm check-types` instead of compiling silently.
 */
type AssertExactKeys<T, Keys extends string> = keyof T extends Keys
  ? Keys extends keyof T
    ? true
    : never
  : never;
const _apiKeyStatusShapeLock: AssertExactKeys<ApiKeyStatus, 'hasKey' | 'provider' | 'updatedAt'> =
  true;
void _apiKeyStatusShapeLock;
