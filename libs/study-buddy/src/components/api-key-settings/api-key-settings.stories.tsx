import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configureApiKeyMock, configureProfileMock } from '../../../.storybook/mocks/hooks';
import { ApiKeySettings } from './api-key-settings';

const FREE_ENTITLEMENTS = {
  plan: 'free' as const,
  keySource: 'user' as const,
  showKeySettings: true,
  showAds: true,
  canCreate: false,
};

const withApiKeyMock =
  (config: Parameters<typeof configureApiKeyMock>[0]): Decorator =>
  (StoryFn) => {
    configureApiKeyMock(config);
    return <StoryFn />;
  };

const withEntitlementsMock =
  (config: Parameters<typeof configureProfileMock>[0]): Decorator =>
  (StoryFn) => {
    configureProfileMock(config);
    return <StoryFn />;
  };

const meta = {
  title: 'Features/ApiKeySettings',
  component: ApiKeySettings,
} satisfies Meta<typeof ApiKeySettings>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Empty — no key saved; Save disabled until a non-blank key is entered. */
export const Empty: Story = {
  decorators: [
    withEntitlementsMock({ entitlements: FREE_ENTITLEMENTS }),
    withApiKeyMock({ status: { hasKey: false } }),
  ],
};

/** Content — masked saved status + Replace/Remove. */
export const Saved: Story = {
  decorators: [
    withEntitlementsMock({
      entitlements: { ...FREE_ENTITLEMENTS, canCreate: true },
    }),
    withApiKeyMock({
      status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
    }),
  ],
};

/** Loading — initial status fetch in flight. */
export const Loading: Story = {
  decorators: [
    withEntitlementsMock({ entitlements: null, isLoading: true }),
    withApiKeyMock({ status: { hasKey: false } }),
  ],
};

/** Error — network failure banner; form stays editable. */
export const NetworkError: Story = {
  decorators: [
    withEntitlementsMock({ entitlements: FREE_ENTITLEMENTS }),
    withApiKeyMock({ status: { hasKey: false }, error: 'network_error' }),
  ],
};

/** Paid — BYOK settings stay hidden even if a key remains saved. */
export const Paid: Story = {
  decorators: [
    withEntitlementsMock({
      entitlements: {
        plan: 'paid',
        keySource: 'platform',
        showKeySettings: false,
        showAds: false,
        canCreate: true,
      },
    }),
    withApiKeyMock({
      status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
    }),
  ],
};

/** Entitlements error — key controls hidden with retry. */
export const EntitlementsError: Story = {
  decorators: [
    withEntitlementsMock({
      entitlements: null,
      error: new globalThis.Error('read failed'),
    }),
    withApiKeyMock({ status: { hasKey: false } }),
  ],
};
