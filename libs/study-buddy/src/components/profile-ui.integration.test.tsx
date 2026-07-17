jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useApiKey: jest.fn(),
  useProfile: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useApiKey, useProfile } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { render, screen } from '@testing-library/react-native';
import { Text, View } from 'react-native';

import { localizationValue } from '../test-utils/auth-test-factories';
import { ApiKeyGate } from './api-key-gate/api-key-gate';
import { ApiKeySettings } from './api-key-settings/api-key-settings';

const mockUseApiKey = useApiKey as jest.Mock;
const mockUseProfile = useProfile as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;

describe('profile UI integration', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue(localizationValue());
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
  it('applies paid profile across upload gating and settings', async () => {
    mockUseProfile.mockReturnValue({
      profile: {
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
