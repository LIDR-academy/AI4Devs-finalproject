import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configureApiKeyMock } from '../../../.storybook/mocks/hooks';
import { ApiKeySettings } from './api-key-settings';

const withApiKeyMock =
  (config: Parameters<typeof configureApiKeyMock>[0]): Decorator =>
  (StoryFn) => {
    configureApiKeyMock(config);
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
  decorators: [withApiKeyMock({ status: { hasKey: false } })],
};

/** Content — masked saved status + Replace/Remove. */
export const Saved: Story = {
  decorators: [
    withApiKeyMock({
      status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
    }),
  ],
};

/** Loading — initial status fetch in flight. */
export const Loading: Story = {
  decorators: [withApiKeyMock({ isLoading: true })],
};

/** Error — network failure banner; form stays editable. */
export const NetworkError: Story = {
  decorators: [withApiKeyMock({ status: { hasKey: false }, error: 'network_error' })],
};
