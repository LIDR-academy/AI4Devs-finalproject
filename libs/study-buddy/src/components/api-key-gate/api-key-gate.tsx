import { ApiKeyRequiredNotice, Button } from '@helsoft/components';
import { useEntitlements } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { ApiKeyGateProps } from './api-key-gate.types';

/**
 * ApiKeyGate — feature component guarding the lesson-generation entry point (AC10, @s10):
 * renders `ApiKeyRequiredNotice` when the caller has no key saved, its `children` once a key
 * is present, and neither branch while the key status is still loading (no premature "key
 * required" flash). Does not implement any generation logic itself — R2 builds inside it.
 */
export const ApiKeyGate = ({ children }: ApiKeyGateProps) => {
  const { entitlements, isLoading: areEntitlementsLoading, error, retry } = useEntitlements();
  const { t } = useLocalization();
  const router = useRouter();
  const renderChildren = typeof children === 'function' ? children : null;

  useEffect(() => {
    if (areEntitlementsLoading) {
      AccessibilityInfo.announceForAccessibility(t('entitlements.loading'));
    }
  }, [areEntitlementsLoading, t]);

  if (areEntitlementsLoading) {
    return (
      <>
        <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
          {t('entitlements.loading')}
        </Text>
        {renderChildren?.(false)}
      </>
    );
  }

  if (error) {
    return (
      <View style={styles.gatedContent}>
        <View style={styles.error}>
          <Text accessibilityRole="alert" style={styles.message}>
            {t('entitlements.error.message')}
          </Text>
          <Button onPress={retry}>{t('entitlements.error.retry')}</Button>
        </View>
        {renderChildren?.(false)}
      </View>
    );
  }

  if (!entitlements?.canCreate) {
    return (
      <View style={styles.gatedContent}>
        <ApiKeyRequiredNotice onNavigateToAccount={() => router.push('/settings')} />
        {renderChildren?.(false)}
      </View>
    );
  }

  if (typeof children === 'function') return children(true);
  return children;
};

const styles = StyleSheet.create((theme) => ({
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
