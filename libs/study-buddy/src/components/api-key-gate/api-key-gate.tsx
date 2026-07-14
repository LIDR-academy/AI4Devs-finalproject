import { ApiKeyRequiredNotice } from '@helsoft/components';
import { useApiKey } from '@helsoft/hooks';
import { useRouter } from 'expo-router';

import type { ApiKeyGateProps } from './api-key-gate.types';

/**
 * ApiKeyGate — feature component guarding the lesson-generation entry point (AC10, @s10):
 * renders `ApiKeyRequiredNotice` when the caller has no key saved, its `children` once a key
 * is present, and neither branch while the key status is still loading (no premature "key
 * required" flash). Does not implement any generation logic itself — R2 builds inside it.
 */
export const ApiKeyGate = ({ children }: ApiKeyGateProps) => {
  const { status, isLoading } = useApiKey();
  const router = useRouter();

  if (isLoading) return null;

  if (!status.hasKey) {
    return <ApiKeyRequiredNotice onNavigateToAccount={() => router.push('/settings')} />;
  }

  return children;
};
