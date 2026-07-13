jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useApiKey: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

import { useApiKey } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { ApiKeyGate } from './api-key-gate';

const mockUseApiKey = useApiKey as jest.Mock;
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

describe('ApiKeyGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  // @s10 (loading facet) — while key status is still loading, the gate renders neither the
  // notice nor its children (no premature "key required" flash).
  it('renders neither the notice nor children while status is loading', async () => {
    mockUseApiKey.mockReturnValue(apiKeyValue({ isLoading: true }));

    await render(
      <ApiKeyGate>
        <Text>generation content</Text>
      </ApiKeyGate>,
    );

    expect(screen.queryByText('generation content')).toBeNull();
    expect(screen.queryByText('upload.apiKeyRequired.message')).toBeNull();
    // spec.md's deliberate anti-flash decision (@s10): the Loading branch renders nothing at
    // all, not even an accessibility-only node — a bare `null`.
    expect(screen.toJSON()).toBeNull();
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

    expect(screen.getByText('generation content')).toBeTruthy();
    expect(screen.queryByText('upload.apiKeyRequired.message')).toBeNull();
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
