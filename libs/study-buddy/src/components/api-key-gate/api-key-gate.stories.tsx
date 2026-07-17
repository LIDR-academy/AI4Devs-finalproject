import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from 'react-native';

import { configureProfileMock } from '../../../.storybook/mocks/hooks';
import { ApiKeyGate } from './api-key-gate';

const withProfileMock =
  (config: Parameters<typeof configureProfileMock>[0]): Decorator =>
  (StoryFn) => {
    configureProfileMock(config);
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
  decorators: [withProfileMock({ profile: null, isLoading: true })],
};

/** Cannot create — contact-support message above children. */
export const CannotCreate: Story = {
  decorators: [
    withProfileMock({
      profile: {
        plan: 'free',
        keySource: 'user',
        showKeySettings: true,
        showAds: true,
        canCreate: false,
      },
    }),
  ],
};

/** Key present — children render. */
export const WithKey: Story = {
  decorators: [
    withProfileMock({
      profile: {
        plan: 'free',
        keySource: 'user',
        showKeySettings: true,
        showAds: true,
        canCreate: true,
      },
    }),
  ],
};

/** Paid — platform access bypasses user-key setup. */
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
  ],
};

/** Error — plan read failed and can be retried. */
export const Error: Story = {
  decorators: [
    withProfileMock({ profile: null, error: new globalThis.Error('read failed') }),
  ],
};
