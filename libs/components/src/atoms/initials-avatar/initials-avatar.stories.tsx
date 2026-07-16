import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { InitialsAvatar } from './initials-avatar';

const meta = {
  title: 'Atoms/InitialsAvatar',
  component: InitialsAvatar,
  args: {
    initials: 'AL',
  },
} satisfies Meta<typeof InitialsAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleInitial: Story = {
  args: { initials: 'G' },
};

export const LongInitials: Story = {
  args: { initials: 'GH' },
};

export const Interactive: Story = {
  args: {
    accessibilityLabel: 'Open account menu',
    onPress: () => undefined,
  },
};
