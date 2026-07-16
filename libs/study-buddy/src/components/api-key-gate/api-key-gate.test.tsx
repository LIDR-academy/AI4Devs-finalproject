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
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { AccessibilityInfo, Text } from 'react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { ApiKeyGate, apiKeyGateStyles, useApiKeyGateCanCreate } from './api-key-gate';

const mockUseApiKey = useApiKey as jest.Mock;
const mockUseEntitlements = useEntitlements as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

const CanCreateProbe = () => {
  const canCreate = useApiKeyGateCanCreate();
  return <Text>{canCreate ? 'creation enabled' : 'creation disabled'}</Text>;
};

const apiKeyValue = (overrides: Partial<ReturnType<typeof useApiKey>> = {}) => ({
  status: { hasKey: false },
  isLoading: false,
  isSubmitting: false,
  error: null,
  saveApiKey: jest.fn(),
  removeApiKey: jest.fn(),
  ...overrides,
});

const entitlementsValue = (overrides: Partial<ReturnType<typeof useEntitlements>> = {}) => ({
  entitlements: {
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

describe('ApiKeyGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseLocalization.mockReturnValue(localizationValue());
    mockUseApiKey.mockReturnValue(apiKeyValue());
    mockUseEntitlements.mockReturnValue(entitlementsValue());
  });

  it('does not announce entitlement loading after entitlements resolve', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());

    await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(announce).not.toHaveBeenCalled();
    announce.mockRestore();
  });

  it('announces when entitlement loading starts after mount', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
    const view = await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    mockUseEntitlements.mockReturnValue(entitlementsValue({ entitlements: null, isLoading: true }));
    await view.rerender(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(announce).toHaveBeenCalledWith('entitlements.loading');
    announce.mockRestore();
  });

  it('handles unresolved non-loading entitlements as unavailable', async () => {
    mockUseEntitlements.mockReturnValue(entitlementsValue({ entitlements: null }));

    await render(
      <ApiKeyGate>
        <CanCreateProbe />
        <Text>open existing lesson</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByText('upload.apiKeyRequired.message')).toBeTruthy();
    expect(screen.getByText('creation disabled')).toBeTruthy();
    expect(screen.getByText('open existing lesson')).toBeTruthy();
  });

  it('exposes canCreate=true via context when creation is available', async () => {
    mockUseEntitlements.mockReturnValue(
      entitlementsValue({
        entitlements: {
          plan: 'paid',
          keySource: 'platform',
          showKeySettings: false,
          showAds: false,
          canCreate: true,
        },
      }),
    );

    await render(
      <ApiKeyGate>
        <CanCreateProbe />
      </ApiKeyGate>,
    );

    expect(screen.getByText('creation enabled')).toBeTruthy();
    expect(screen.queryByText('creation disabled')).toBeNull();
  });

  it('preserves the concrete gate, error, message, and hidden styles', () => {
    expect(apiKeyGateStyles.gatedContent).toMatchObject({ flex: 1, gap: 16 });
    expect(apiKeyGateStyles.error).toMatchObject({ gap: 16 });
    expect(apiKeyGateStyles.message).toMatchObject({
      color: '#b7191c',
      fontFamily: 'IBM Plex Sans',
      fontSize: 14,
      fontWeight: '400',
      letterSpacing: 0.25,
      lineHeight: 20,
    });
    expect(apiKeyGateStyles.visuallyHidden).toEqual({
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
    });
  });

  // @s10 (loading facet) — while loading, no notice; children stay mounted with canCreate=false.
  it('announces entitlement loading without the required-key notice', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
    mockUseEntitlements.mockReturnValue(entitlementsValue({ entitlements: null, isLoading: true }));

    await render(
      <ApiKeyGate>
        <CanCreateProbe />
        <Text>open existing lesson</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByText('creation disabled')).toBeTruthy();
    expect(screen.getByText('open existing lesson')).toBeTruthy();
    expect(screen.queryByText('upload.apiKeyRequired.message')).toBeNull();
    expect(screen.getByText('entitlements.loading').props.accessibilityLiveRegion).toBe('polite');
    expect(announce).toHaveBeenCalledWith('entitlements.loading');
    announce.mockRestore();
  });

  // @s10 (guard facet) — notice when gated; children remain for open/play (@s13).
  it('renders the required-key notice when there is no key', async () => {
    mockUseApiKey.mockReturnValue(apiKeyValue({ status: { hasKey: false } }));

    await render(
      <ApiKeyGate>
        <CanCreateProbe />
        <Text>open existing lesson</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByText('upload.apiKeyRequired.message')).toBeTruthy();
    expect(screen.getByText('creation disabled')).toBeTruthy();
    expect(screen.getByText('open existing lesson')).toBeTruthy();
  });

  // @s10 — once a key is saved, the gate renders its children instead of the notice.
  it('renders children when a key is saved', async () => {
    mockUseEntitlements.mockReturnValue(
      entitlementsValue({
        entitlements: {
          plan: 'free',
          keySource: 'user',
          showKeySettings: true,
          showAds: true,
          canCreate: true,
        },
      }),
    );

    await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByText('generation content')).toBeTruthy();
    expect(screen.queryByText('upload.apiKeyRequired.message')).toBeNull();
  });

  // @s9/@s17 — paid creation uses the platform key and bypasses the user-key gate.
  it('renders children for a paid learner without a saved user key', async () => {
    mockUseEntitlements.mockReturnValue(
      entitlementsValue({
        entitlements: {
          plan: 'paid',
          keySource: 'platform',
          showKeySettings: false,
          showAds: false,
          canCreate: true,
        },
      }),
    );

    await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByText('generation content')).toBeTruthy();
    expect(screen.queryByText('upload.apiKeyRequired.message')).toBeNull();
  });

  // @s12 — reloaded entitlements are authoritative after a downgrade.
  it('disables create via context when current entitlements disallow creation', async () => {
    mockUseApiKey.mockReturnValue(
      apiKeyValue({
        status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
      }),
    );

    await render(
      <ApiKeyGate>
        <CanCreateProbe />
        <Text>open existing lesson</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByText('creation disabled')).toBeTruthy();
    expect(screen.getByText('open existing lesson')).toBeTruthy();
    expect(screen.getByText('upload.apiKeyRequired.message')).toBeTruthy();
  });

  // @s5/@s6 — entitlement failures expose retry while children stay mounted (@s13).
  it('renders an entitlement error and retries while keeping children mounted', async () => {
    const retry = jest.fn();
    mockUseEntitlements.mockReturnValue(
      entitlementsValue({
        entitlements: null,
        error: new Error('profile missing'),
        retry,
      }),
    );

    await render(
      <ApiKeyGate>
        <Text>open existing lesson</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('entitlements.error.message');
    expect(screen.getByText('open existing lesson')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'entitlements.error.retry' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  // @s13 — context consumers preserve lesson access while creation stays gated.
  it('exposes canCreate=false via context while creation is unavailable', async () => {
    await render(
      <ApiKeyGate>
        <CanCreateProbe />
        <Text>open existing lesson</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByText('creation disabled')).toBeTruthy();
    expect(screen.queryByText('creation enabled')).toBeNull();
    expect(screen.getByText('open existing lesson')).toBeTruthy();
    expect(screen.getByText('upload.apiKeyRequired.message')).toBeTruthy();
  });

  it('exposes canCreate=false via context while entitlements load', async () => {
    mockUseEntitlements.mockReturnValue(entitlementsValue({ entitlements: null, isLoading: true }));

    await render(
      <ApiKeyGate>
        <CanCreateProbe />
      </ApiKeyGate>,
    );

    expect(screen.getByText('creation disabled')).toBeTruthy();
    expect(screen.queryByText('creation enabled')).toBeNull();
  });

  it('exposes canCreate=false via context when entitlements fail', async () => {
    mockUseEntitlements.mockReturnValue(
      entitlementsValue({ entitlements: null, error: new Error('read failed') }),
    );

    await render(
      <ApiKeyGate>
        <CanCreateProbe />
      </ApiKeyGate>,
    );

    expect(screen.getByText('creation disabled')).toBeTruthy();
    expect(screen.queryByText('creation enabled')).toBeNull();
  });

  // AC10 — the notice's action navigates to the account screen (/settings).
  it('navigates to /settings when the notice action is pressed', async () => {
    const push = jest.fn();
    mockUseRouter.mockReturnValue({ push });
    mockUseApiKey.mockReturnValue(apiKeyValue({ status: { hasKey: false } }));

    await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );
    fireEvent.press(screen.getByRole('button', { name: 'upload.apiKeyRequired.action' }));

    expect(push).toHaveBeenCalledWith('/settings');
  });
});
