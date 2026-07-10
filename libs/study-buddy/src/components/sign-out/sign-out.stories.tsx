import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { SignOut } from './sign-out';

const meta = {
  title: 'Features/SignOut',
  component: SignOut,
} satisfies Meta<typeof SignOut>;

export default meta;

type Story = StoryObj<typeof meta>;

// The trigger button; opening/confirming/cancelling the dialog is exercised live — the fake
// useAuth().signOut resolves after a short delay (see .storybook/mocks/hooks.ts).
export const Default: Story = {};
