import { ApiKeyForm, Button } from '@helsoft/components';
import { useApiKey, useProfile } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import type { AiProvider, ApiKeyErrorCode } from '@helsoft/types';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

/** Provider brand names are not translated (proper nouns) — the seam stays open for more
 * providers alongside the `AiProvider` union (spec.md Open decision 2; ai-lesson-generation
 * Open decision #1 swaps the v1 provider from OpenAI to Groq). */
const PROVIDER_DISPLAY_NAMES: Record<AiProvider, string> = { groq: 'Groq' };

/** Where the Empty state's guidance link sends the user (spec.md Open decision 2 — Groq is
 * the fixed v1 provider, ai-lesson-generation Open decision #1). Owned by the wiring layer
 * (Full-review Round 1, Minor 8) and threaded into ApiKeyForm's `guidanceUrl` prop, rather than
 * hardcoded inside the presentational organism. */
const GUIDANCE_URL = 'https://console.groq.com/keys';
export const EMPTY_SAVED_STATUS_LABEL = '';

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
  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
    retry,
  } = useProfile();
  const { t, locale } = useLocalization();

  useEffect(() => {
    if (isProfileLoading) {
      AccessibilityInfo.announceForAccessibility(t('entitlements.loading'));
    }
  }, [isProfileLoading, t]);

  if (isProfileLoading) {
    return (
      <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
        {t('entitlements.loading')}
      </Text>
    );
  }

  if (profileError) {
    return (
      <View style={styles.error}>
        <Text accessibilityRole="alert" style={styles.errorMessage}>
          {t('entitlements.error.message')}
        </Text>
        <Button onPress={retry}>{t('entitlements.error.retry')}</Button>
      </View>
    );
  }

  if (!profile?.showKeySettings) return null;

  const keySavedStatusLabel = status.hasKey
    ? t('settings.apiKey.savedStatus', {
        provider: status.provider ? PROVIDER_DISPLAY_NAMES[status.provider] : '',
        date: status.updatedAt ? new Date(status.updatedAt).toLocaleDateString(locale) : '',
      })
    : EMPTY_SAVED_STATUS_LABEL;

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
      keySavedStatusLabel={keySavedStatusLabel}
    />
  );
};

export const apiKeySettingsStyles = StyleSheet.create((theme) => ({
  error: {
    gap: theme.spacing.s4,
  },
  errorMessage: {
    ...theme.typography.bodyMedium,
    color: theme.colors.error,
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
}));

const styles = apiKeySettingsStyles;
