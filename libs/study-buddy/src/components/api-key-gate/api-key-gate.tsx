import { Button } from '@helsoft/components';
import { useProfile } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { ApiKeyGateProps } from './api-key-gate.types';

/**
 * ApiKeyGate — guards create/upload affordances while always mounting `children` so existing
 * lessons stay reachable (@s13). Status UI (loading / error / cannot-create) sits above children.
 * Consumers gate create/upload via `useProfile().profile?.canCreate`.
 */
export const ApiKeyGate = ({ children }: ApiKeyGateProps) => {
  const { profile, isLoading: isProfileLoading, error, retry } = useProfile();
  const { t } = useLocalization();

  useEffect(() => {
    if (isProfileLoading) {
      AccessibilityInfo.announceForAccessibility(t('entitlements.loading'));
    }
  }, [isProfileLoading, t]);

  return (
    <>
      {isProfileLoading ? (
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

      {!isProfileLoading && !error && !profile?.canCreate ? (
        <View style={styles.gatedContent}>
          <Text accessibilityRole="alert" style={styles.cannotCreate}>
            {t('upload.cannotCreate')}
          </Text>
        </View>
      ) : null}

      {children}
    </>
  );
};

export const apiKeyGateStyles = StyleSheet.create((theme) => ({
  gatedContent: {
    gap: theme.spacing.s4,
  },
  error: {
    gap: theme.spacing.s4,
  },
  message: {
    ...theme.typography.bodyMedium,
    color: theme.colors.error,
  },
  cannotCreate: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
}));

const styles = apiKeyGateStyles;
