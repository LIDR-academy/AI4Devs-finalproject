import { ReactNode } from 'react';
import { ApiKeyRequiredNotice } from '@helsoft/components';
import { useApiKey } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useRouter } from 'expo-router';

export type ApiKeyGateProps = {
  /** The generation entry point's content (the future R2 generation UI) — only rendered once
   * a key is present (AC10). */
  children: ReactNode;
};

/**
 * ApiKeyGate — feature component guarding the lesson-generation entry point (AC10, @s10):
 * renders `ApiKeyRequiredNotice` when the caller has no key saved, its `children` once a key
 * is present, and neither branch while the key status is still loading (no premature "key
 * required" flash). Does not implement any generation logic itself — R2 builds inside it.
 */
export const ApiKeyGate = ({ children }: ApiKeyGateProps) => {
  const { status, isLoading } = useApiKey();
  const { t } = useLocalization();
  const router = useRouter();

  if (isLoading) return null;

  if (!status.hasKey) {
    return (
      <ApiKeyRequiredNotice
        onNavigateToAccount={() => router.push('/settings')}
        labels={{
          message: t('upload.apiKeyRequired.message'),
          action: t('upload.apiKeyRequired.action'),
        }}
      />
    );
  }

  return children;
};
