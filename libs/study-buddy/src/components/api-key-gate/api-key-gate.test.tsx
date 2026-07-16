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
import { ApiKeyGate } from './api-key-gate';

const mockUseApiKey = useApiKey as jest.Mock;
const mockUseEntitlements = useEntitlements as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

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

  // @s10 (loading facet) — while key status is still loading, the gate renders neither the
  // notice nor its children (no premature "key required" flash).
  it('announces entitlement loading without rendering plan-sensitive controls', async () => {
    const announce = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(jest.fn());
    mockUseEntitlements.mockReturnValue(entitlementsValue({ entitlements: null, isLoading: true }));

    await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(screen.queryByText('generation content')).toBeNull();
    expect(screen.queryByText('upload.apiKeyRequired.message')).toBeNull();
    expect(screen.getByText('entitlements.loading').props.accessibilityLiveRegion).toBe('polite');
    expect(announce).toHaveBeenCalledWith('entitlements.loading');
    announce.mockRestore();
  });

  // @s10 (guard facet) — once status resolves to no-key, the notice renders instead of the
  // generation entry's children.
  it('renders the required-key notice when there is no key', async () => {
    mockUseApiKey.mockReturnValue(apiKeyValue({ status: { hasKey: false } }));

    await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByText('upload.apiKeyRequired.message')).toBeTruthy();
    expect(screen.queryByText('generation content')).toBeNull();
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
  it('hides children when current entitlements disallow creation', async () => {
    mockUseApiKey.mockReturnValue(
      apiKeyValue({
        status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
      }),
    );

    await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(screen.queryByText('generation content')).toBeNull();
    expect(screen.getByText('upload.apiKeyRequired.message')).toBeTruthy();
  });

  // @s5/@s6 — entitlement failures hide creation and expose the hook retry.
  it('renders an entitlement error and retries without showing children', async () => {
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
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('entitlements.error.message');
    expect(screen.queryByText('generation content')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'entitlements.error.retry' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  // @s13 — render-prop consumers can preserve lesson access while creation stays gated.
  it('passes false to render-prop children while creation is unavailable', async () => {
    await render(
      <ApiKeyGate>
        {(canCreate) => (
          <>
            {canCreate ? <Text>create lesson</Text> : null}
            <Text>open existing lesson</Text>
          </>
        )}
      </ApiKeyGate>,
    );

    expect(screen.queryByText('create lesson')).toBeNull();
    expect(screen.getByText('open existing lesson')).toBeTruthy();
    expect(screen.getByText('upload.apiKeyRequired.message')).toBeTruthy();
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
