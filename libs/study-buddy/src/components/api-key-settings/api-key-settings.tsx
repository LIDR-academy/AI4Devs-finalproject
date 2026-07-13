import { ApiKeyForm } from '@helsoft/components';
import { useApiKey } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import type { AiProvider, ApiKeyErrorCode } from '@helsoft/types';

/** Provider brand names are not translated (proper nouns) — the seam stays open for more
 * providers alongside the `AiProvider` union (spec.md Open decision 2; ai-lesson-generation
 * Open decision #1 swaps the v1 provider from OpenAI to Groq). */
const PROVIDER_DISPLAY_NAMES: Record<AiProvider, string> = { groq: 'Groq' };

/** Where the Empty state's guidance link sends the user (spec.md Open decision 2 — Groq is
 * the fixed v1 provider, ai-lesson-generation Open decision #1). Owned by the wiring layer
 * (Full-review Round 1, Minor 8) and threaded into ApiKeyForm's `guidanceUrl` prop, rather than
 * hardcoded inside the presentational organism. */
const GUIDANCE_URL = 'https://console.groq.com/keys';

/**
 * Maps useApiKey()'s normalized ApiKeyErrorCode to its i18n banner key (@s7/@s9).
 * validation_error is deliberately absent: ApiKeyForm's Empty-state Save stays disabled until
 * a non-blank key is entered (@s5), so that code can never surface through this form (spec.md
 * Open decision 3 — mirrors SignInForm's AUTH_ERROR_KEYS omitting the same auth code).
 */
const API_KEY_ERROR_KEYS: Partial<Record<ApiKeyErrorCode, string>> = {
  network_error: 'settings.apiKey.error.network',
};

/**
 * ApiKeySettings — feature component wiring useApiKey()/useLocalization() to the
 * presentational ApiKeyForm. Builds the masked saved-status copy via `t()` interpolation so
 * ApiKeyForm stays free of i18n/date-formatting concerns. Keeps the Settings screen a thin
 * shell (mirrors LanguageSettings/SignInForm).
 */
export const ApiKeySettings = () => {
  const { status, isLoading, isSubmitting, error, saveApiKey, removeApiKey } = useApiKey();
  const { t, locale } = useLocalization();

  const keySavedStatus = status.hasKey
    ? t('settings.apiKey.savedStatus', {
        provider: status.provider ? PROVIDER_DISPLAY_NAMES[status.provider] : '',
        date: status.updatedAt ? new Date(status.updatedAt).toLocaleDateString(locale) : '',
      })
    : '';

  const errorKey = error ? API_KEY_ERROR_KEYS[error] : undefined;
  const errorMessage = errorKey ? t(errorKey) : undefined;

  return (
    <ApiKeyForm
      status={status}
      isLoadingStatus={isLoading}
      isSubmitting={isSubmitting}
      onSave={(rawKey) => {
        void saveApiKey(rawKey).catch(() => {});
      }}
      onRemove={() => {
        // useApiKey().removeApiKey already records the failure via `error` state before it
        // rejects — the rejection itself must still be observed here so it never becomes an
        // unhandled promise rejection (mirrors SignInForm's handleSubmit).
        void removeApiKey().catch(() => {});
      }}
      guidanceUrl={GUIDANCE_URL}
      errorMessage={errorMessage}
      labels={{
        inputLabel: t('settings.apiKey.inputLabel'),
        save: t('settings.apiKey.save'),
        saving: t('settings.apiKey.saving'),
        loadingStatus: t('settings.apiKey.loadingStatus'),
        replace: t('settings.apiKey.replace'),
        remove: t('settings.apiKey.remove'),
        keySavedStatus,
        guidance: t('settings.apiKey.guidance'),
        removeConfirmHeadline: t('settings.apiKey.removeConfirmHeadline'),
        removeConfirmBody: t('settings.apiKey.removeConfirmBody'),
        removeConfirmAction: t('settings.apiKey.removeConfirmAction'),
        removeConfirmCancelAction: t('settings.apiKey.removeConfirmCancelAction'),
      }}
    />
  );
};
