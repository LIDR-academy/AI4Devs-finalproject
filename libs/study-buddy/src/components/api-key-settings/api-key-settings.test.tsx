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
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo, Linking } from 'react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { ApiKeySettings, apiKeySettingsStyles, EMPTY_SAVED_STATUS_LABEL } from './api-key-settings';

const mockUseApiKey = useApiKey as jest.Mock;
const mockUseProfile = useProfile as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;

const apiKeyValue = (overrides: Partial<ReturnType<typeof useApiKey>> = {}) => ({
  status: { hasKey: false },
  isLoading: false,
  isSubmitting: false,
  error: null,
  saveApiKey: jest.fn(),
  removeApiKey: jest.fn(),
  ...overrides,
});

const profileValue = (overrides: Partial<ReturnType<typeof useProfile>> = {}) => ({
  profile: {
    plan: 'free' as const,
    keySource: 'user' as const,
    showKeySettings: true,
    showAds: true,
    canCreate: false,
  },
  isLoading: false,
  error: null,
  retry: jest.fn(),
  ...overrides,
});

describe('ApiKeySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseProfile.mockReturnValue(profileValue());
  });

  it('does not announce entitlement loading after entitlements resolve', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
    mockUseApiKey.mockReturnValue(apiKeyValue());
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);

    expect(announce).not.toHaveBeenCalled();
    announce.mockRestore();
  });

  it('announces when entitlement loading starts after mount', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
    mockUseApiKey.mockReturnValue(apiKeyValue());
    mockUseLocalization.mockReturnValue(localizationValue());
    const view = await render(<ApiKeySettings />);

    mockUseProfile.mockReturnValue(profileValue({ profile: null, isLoading: true }));
    await view.rerender(<ApiKeySettings />);

    expect(announce).toHaveBeenCalledWith('entitlements.loading');
    announce.mockRestore();
  });

  it('hides key settings when resolved entitlements are absent', async () => {
    mockUseApiKey.mockReturnValue(apiKeyValue());
    mockUseProfile.mockReturnValue(profileValue({ profile: null }));
    mockUseLocalization.mockReturnValue(localizationValue());

    const view = await render(<ApiKeySettings />);

    expect(view.toJSON()).toBeNull();
  });

  it('keeps the no-key saved-status fallback empty', () => {
    expect(EMPTY_SAVED_STATUS_LABEL).toBe('');
  });

  it('preserves the concrete error and hidden styles', () => {
    expect(apiKeySettingsStyles.error).toEqual({ gap: 16 });
    expect(apiKeySettingsStyles.errorMessage).toMatchObject({
      color: '#b7191c',
      fontFamily: 'IBM Plex Sans',
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 0.25,
      lineHeight: 20,
    });
    expect(apiKeySettingsStyles.visuallyHidden).toEqual({
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
    });
  });

  // @s1 — entering and saving a key calls useApiKey().saveApiKey with the entered value.
  it('calls saveApiKey with the entered key on submit', async () => {
    const saveApiKey = jest.fn().mockResolvedValue(undefined);
    mockUseApiKey.mockReturnValue(apiKeyValue({ saveApiKey }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('settings.apiKey.inputLabel'), 'sk-test-key');
    });
    fireEvent.press(screen.getByRole('button', { name: 'settings.apiKey.save' }));

    expect(saveApiKey).toHaveBeenCalledWith('sk-test-key');
  });

  // Full-review Round 1, Minor 8 — ApiKeySettings (the wiring layer) owns the guidance
  // destination and passes it down to ApiKeyForm's `guidanceUrl` prop, rather than ApiKeyForm
  // hardcoding a provider-specific URL itself.
  it('passes the Groq guidance URL down to ApiKeyForm', async () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    mockUseApiKey.mockReturnValue(apiKeyValue());
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);
    fireEvent.press(screen.getByRole('button', { name: 'settings.apiKey.guidance' }));

    expect(openURL).toHaveBeenCalledWith('https://console.groq.com/keys');
    openURL.mockRestore();
  });

  // @s3 — a returning user (hasKey: true) sees the masked saved state, built from the
  // interpolated settings.apiKey.savedStatus i18n key (provider + formatted date). The
  // expected date is derived the same way the component does (toLocaleDateString), rather
  // than hardcoded, so this test isn't tied to the runner's local timezone.
  it('renders the masked saved-status text built from the localized template', async () => {
    const updatedAt = '2026-01-01T00:00:00.000Z';
    mockUseApiKey.mockReturnValue(
      apiKeyValue({ status: { hasKey: true, provider: 'groq', updatedAt } }),
    );
    mockUseLocalization.mockReturnValue(
      localizationValue({
        t: (key: string, options?: Record<string, unknown>) =>
          options ? `${key}:${JSON.stringify(options)}` : key,
      }),
    );

    await render(<ApiKeySettings />);

    const expectedDate = new Date(updatedAt).toLocaleDateString('en');
    expect(
      screen.getByText(`settings.apiKey.savedStatus:{"provider":"Groq","date":"${expectedDate}"}`),
    ).toBeTruthy();
  });

  it('uses empty saved-status metadata fallbacks when provider details are absent', async () => {
    mockUseApiKey.mockReturnValue(apiKeyValue({ status: { hasKey: true } }));
    mockUseLocalization.mockReturnValue(
      localizationValue({
        t: (key: string, options?: Record<string, unknown>) =>
          options ? `${key}:${JSON.stringify(options)}` : key,
      }),
    );

    await render(<ApiKeySettings />);

    expect(screen.getByText('settings.apiKey.savedStatus:{"provider":"","date":""}')).toBeTruthy();
  });

  // @s3 — useApiKey().isLoading drives the ApiKeyForm Loading state.
  it('shows the loading placeholder while useApiKey().isLoading is true', async () => {
    mockUseApiKey.mockReturnValue(apiKeyValue({ isLoading: true }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);

    expect(screen.queryByLabelText('settings.apiKey.inputLabel')).toBeNull();
  });

  // @s4 — plan-sensitive settings stay hidden until entitlements resolve.
  it('announces entitlement loading without rendering key settings', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
    mockUseApiKey.mockReturnValue(apiKeyValue());
    mockUseProfile.mockReturnValue(profileValue({ profile: null, isLoading: true }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);

    expect(screen.queryByLabelText('settings.apiKey.inputLabel')).toBeNull();
    expect(screen.getByText('entitlements.loading').props.accessibilityLiveRegion).toBe('polite');
    expect(announce).toHaveBeenCalledWith('entitlements.loading');
    announce.mockRestore();
  });

  // @s9/@s17 — paid users never see BYOK settings, even with a stale saved key.
  it('renders nothing for paid entitlements when a user key remains saved', async () => {
    mockUseApiKey.mockReturnValue(
      apiKeyValue({
        status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
      }),
    );
    mockUseProfile.mockReturnValue(
      profileValue({
        profile: {
          plan: 'paid',
          keySource: 'platform',
          showKeySettings: false,
          showAds: false,
          canCreate: true,
        },
      }),
    );
    mockUseLocalization.mockReturnValue(localizationValue());

    const view = await render(<ApiKeySettings />);

    expect(view.toJSON()).toBeNull();
  });

  // @s5/@s6 — entitlement failures hide key controls and delegate retry.
  it('renders an entitlement error and retries without showing key settings', async () => {
    const retry = jest.fn();
    mockUseApiKey.mockReturnValue(apiKeyValue());
    mockUseProfile.mockReturnValue(
      profileValue({
        profile: null,
        error: new Error('read failed'),
        retry,
      }),
    );
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);

    expect(screen.getByRole('alert')).toHaveTextContent('entitlements.error.message');
    expect(screen.queryByLabelText('settings.apiKey.inputLabel')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'entitlements.error.retry' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  // @s2 — useApiKey().isSubmitting disables the Save control via the ApiKeyForm wiring.
  it('disables Save while useApiKey().isSubmitting is true', async () => {
    mockUseApiKey.mockReturnValue(apiKeyValue({ isSubmitting: true }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);

    expect(
      screen.getByRole('button', { name: 'settings.apiKey.save', disabled: true }),
    ).toBeTruthy();
  });

  // @s7/@s9 — a network_error maps to the network i18n key (also used for a failed remove).
  it('maps a network_error to the network message', async () => {
    mockUseApiKey.mockReturnValue(apiKeyValue({ error: 'network_error' }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);

    expect(screen.getByText('settings.apiKey.error.network')).toBeTruthy();
  });

  // @s8 — confirming removal (Remove -> confirm dialog) calls useApiKey().removeApiKey.
  it('calls removeApiKey when the removal is confirmed', async () => {
    const removeApiKey = jest.fn().mockResolvedValue(undefined);
    mockUseApiKey.mockReturnValue(
      apiKeyValue({
        status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
        removeApiKey,
      }),
    );
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<ApiKeySettings />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'settings.apiKey.remove' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'settings.apiKey.removeConfirmAction' }));
    });

    expect(removeApiKey).toHaveBeenCalledTimes(1);
  });
});
