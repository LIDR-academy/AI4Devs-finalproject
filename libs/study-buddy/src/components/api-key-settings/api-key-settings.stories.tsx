import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configureApiKeyMock, configureProfileMock } from '../../../.storybook/mocks/hooks';
import { ApiKeySettings } from './api-key-settings';

const FREE_PROFILE = {
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

const withProfileMock =
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
    withProfileMock({ profile: FREE_PROFILE }),
    withApiKeyMock({ status: { hasKey: false } }),
  ],
};

/** Content — masked saved status + Replace/Remove. */
export const Saved: Story = {
  decorators: [
    withProfileMock({
      profile: { ...FREE_PROFILE, canCreate: true },
    }),
    withApiKeyMock({
      status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
    }),
  ],
};

/** Loading — initial status fetch in flight. */
export const Loading: Story = {
  decorators: [
    withProfileMock({ profile: null, isLoading: true }),
    withApiKeyMock({ status: { hasKey: false } }),
  ],
};

/** Error — network failure banner; form stays editable. */
export const NetworkError: Story = {
  decorators: [
    withProfileMock({ profile: FREE_PROFILE }),
    withApiKeyMock({ status: { hasKey: false }, error: 'network_error' }),
  ],
};

/** Paid — BYOK settings stay hidden even if a key remains saved. */
export const Paid: Story = {
  decorators: [
    withProfileMock({
      profile: {
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

/** Profile error — key controls hidden with retry. */
export const ProfileError: Story = {
  decorators: [
    withProfileMock({
      profile: null,
      error: new globalThis.Error('read failed'),
    }),
    withApiKeyMock({ status: { hasKey: false } }),
  ],
};
