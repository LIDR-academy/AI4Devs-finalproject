/**
 * Normalized outcome codes for `ApiKeyService.saveApiKey`/`removeApiKey`/`getApiKeyStatus`
 * failures (spec.md's error & security contract). The service maps every raw Edge
 * Function/Supabase/network failure onto one of these so the UI never branches on raw
 * provider/Supabase/Vault error shapes. Message copy is deliberately not part of this
 * contract — the UI layer maps `code` -> an i18n key (mirrors `AuthErrorCode`).
 */
export type ApiKeyErrorCode = 'network_error' | 'validation_error';

/** The minimal shape a normalized API-key failure carries upward from the service layer. */
export type ApiKeyError = {
  code: ApiKeyErrorCode;
};
