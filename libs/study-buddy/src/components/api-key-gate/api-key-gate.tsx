import { ApiKeyRequiredNotice, Button } from '@helsoft/components';
import { useEntitlements } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { ApiKeyGateProps } from './api-key-gate.types';
import { ApiKeyGateCanCreateContext } from './use-api-key-gate-can-create';

/**
 * ApiKeyGate — guards create/upload affordances while always mounting `children` so existing
 * lessons stay reachable (@s13). Status UI (loading / error / key-required) sits above children.
 * Consumers read `useApiKeyGateCanCreate()` instead of a children-as-function render prop.
 */
export const ApiKeyGate = ({ children }: ApiKeyGateProps) => {
  const { entitlements, isLoading: areEntitlementsLoading, error, retry } = useEntitlements();
  const { t } = useLocalization();
  const router = useRouter();
  const canCreate = Boolean(entitlements?.canCreate) && !areEntitlementsLoading && !error;

  useEffect(() => {
    if (areEntitlementsLoading) {
      AccessibilityInfo.announceForAccessibility(t('entitlements.loading'));
    }
  }, [areEntitlementsLoading, t]);

  return (
    <ApiKeyGateCanCreateContext.Provider value={canCreate}>
      {areEntitlementsLoading ? (
        <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
          {t('entitlements.loading')}
        </Text>
      ) : null}

      {error ? (
        <View style={styles.gatedContent}>
          <View style={styles.error}>
            <Text accessibilityRole="alert" style={styles.message}>
              {t('entitlements.error.message')}
            </Text>
            <Button onPress={retry}>{t('entitlements.error.retry')}</Button>
          </View>
        </View>
      ) : null}

      {!areEntitlementsLoading && !error && !canCreate ? (
        <View style={styles.gatedContent}>
          <ApiKeyRequiredNotice onNavigateToAccount={() => router.push('/settings')} />
        </View>
      ) : null}

      {children}
    </ApiKeyGateCanCreateContext.Provider>
  );
};

export { useApiKeyGateCanCreate } from './use-api-key-gate-can-create';

export const apiKeyGateStyles = StyleSheet.create((theme) => ({
  gatedContent: {
    flex: 1,
    gap: theme.spacing.s4,
  },
  error: {
    gap: theme.spacing.s4,
  },
  message: {
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

const styles = apiKeyGateStyles;
