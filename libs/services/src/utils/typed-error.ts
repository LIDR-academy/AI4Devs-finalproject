/**
 * Builds a typed failure a caller can safely narrow on via `error.code` — the common
 * `Error & { code }` construction every service needs for its own typed error contract
 * (see `AuthService.signIn`'s `AuthErrorCode` and `ApiKeyService.saveApiKey`'s
 * `'validation_error'` for concrete usages).
 */
export const toTypedError = <Code extends string>(code: Code, message: string): Error & { code: Code } =>
  Object.assign(new Error(message), { code });
