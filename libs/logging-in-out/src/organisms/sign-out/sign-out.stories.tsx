import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { SignOut } from './sign-out';

const SIGN_OUT_DELAY_MS = 300;

const meta = {
  title: 'Organisms/SignOut',
  component: SignOut,
  args: {
    onSignOut: () => new Promise<void>((resolve) => setTimeout(resolve, SIGN_OUT_DELAY_MS)),
  },
} satisfies Meta<typeof SignOut>;

export default meta;

type Story = StoryObj<typeof meta>;

// Trigger + live confirm/cancel; onSignOut resolves after a short delay.
export const Default: Story = {};

export const WithStyle: Story = {
  args: {
    style: { marginRight: 10, marginTop: 10, backgroundColor: 'red' },
  },
};
