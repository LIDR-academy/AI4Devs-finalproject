import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Pressable, Text } from 'react-native';

import { InitialsAvatar } from '../../atoms/initials-avatar/initials-avatar';
import { AccountMenu } from './account-menu';

const meta = {
  title: 'Organisms/AccountMenu',
  component: AccountMenu,
  args: {
    email: 'ada@example.com',
    identityLabel: 'Ada Lovelace',
    initials: 'AL',
    onSettings: () => undefined,
    onSignOut: () => undefined,
    renderTrigger: ({ expanded, onPress }) => (
      <Pressable
        accessibilityLabel="Open account menu"
        accessibilityState={{ expanded }}
        onPress={onPress}
      >
        <InitialsAvatar initials="AL" />
      </Pressable>
    ),
    settingsLabel: 'Settings',
    signOutLabel: 'Sign out',
  },
} satisfies Meta<typeof AccountMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongIdentity: Story = {
  args: {
    email: 'ada.lovelace.with.a.long.email@example.com',
    identityLabel: 'Ada Byron King, Countess of Lovelace',
  },
};

export const SingleInitial: Story = {
  args: { initials: 'G', identityLabel: 'Grace' },
};

export const MobileTrigger: Story = {
  args: {
    renderTrigger: ({ expanded, onPress }) => (
      <Pressable
        accessibilityLabel="Open mobile account menu"
        accessibilityState={{ expanded }}
        onPress={onPress}
      >
        <Text>AL</Text>
      </Pressable>
    ),
  },
};
