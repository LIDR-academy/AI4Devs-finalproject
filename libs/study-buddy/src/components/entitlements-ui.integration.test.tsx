jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useApiKey: jest.fn(),
  useEntitlements: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

import { useApiKey, useEntitlements } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { localizationValue } from '../test-utils/auth-test-factories';
import { ApiKeyGate } from './api-key-gate/api-key-gate';
import { ApiKeySettings } from './api-key-settings/api-key-settings';

const mockUseApiKey = useApiKey as jest.Mock;
const mockUseEntitlements = useEntitlements as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('entitlements UI integration', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue(localizationValue());
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseApiKey.mockReturnValue({
      status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
      isLoading: false,
      isSubmitting: false,
      error: null,
      saveApiKey: jest.fn(),
      removeApiKey: jest.fn(),
    });
  });

  // @s9/@s17 — one paid entitlement result enables creation and hides stale BYOK settings.
  it('applies paid entitlements across upload gating and settings', async () => {
    mockUseEntitlements.mockReturnValue({
      entitlements: {
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
        canCreate: true,
      },
      isLoading: false,
      error: null,
      retry: jest.fn(),
    });

    await render(
      <View>
        <ApiKeyGate>
          <Text>create lesson</Text>
        </ApiKeyGate>
        <ApiKeySettings />
      </View>,
    );

    expect(screen.getByText('create lesson')).toBeTruthy();
    expect(screen.queryByLabelText('settings.apiKey.inputLabel')).toBeNull();
    expect(screen.queryByText('settings.apiKey.savedStatus')).toBeNull();
  });
});
