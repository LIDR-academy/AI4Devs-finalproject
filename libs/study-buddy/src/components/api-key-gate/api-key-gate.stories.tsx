import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from 'react-native';

import { configureApiKeyMock } from '../../../.storybook/mocks/hooks';
import { ApiKeyGate } from './api-key-gate';

const withApiKeyMock =
  (config: Parameters<typeof configureApiKeyMock>[0]): Decorator =>
  (StoryFn) => {
    configureApiKeyMock(config);
    return <StoryFn />;
  };

const meta = {
  title: 'Features/ApiKeyGate',
  component: ApiKeyGate,
  args: {
    children: <Text>Generation entry content</Text>,
  },
} satisfies Meta<typeof ApiKeyGate>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Loading — status still in flight; gate renders nothing (no premature notice flash). */
export const Loading: Story = {
  decorators: [withApiKeyMock({ isLoading: true })],
};

/** No key — ApiKeyRequiredNotice instead of children. */
export const RequiresKey: Story = {
  decorators: [withApiKeyMock({ status: { hasKey: false } })],
};

/** Key present — children render. */
export const WithKey: Story = {
  decorators: [
    withApiKeyMock({
      status: { hasKey: true, provider: 'groq', updatedAt: '2026-01-01T00:00:00.000Z' },
    }),
  ],
};
