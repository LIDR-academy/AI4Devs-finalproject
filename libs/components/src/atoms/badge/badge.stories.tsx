import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { IconButton } from '../icon-button/icon-button';
import { Badge } from './badge';

const meta = {
  title: 'Atoms/Badge',
  component: Badge,
  args: {
    count: 3,
  },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Count: Story = {};

export const Overflow: Story = {
  args: { count: 120 },
};

export const Dot: Story = {
  args: { dot: true, count: undefined },
};

export const Tertiary: Story = {
  args: { color: 'tertiary', count: 5 },
};

export const Anchored: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 24 }}>
      <Badge count={0}>
        <IconButton icon="notifications" accessibilityLabel="Notifications" />
      </Badge>
      <Badge dot>
        <IconButton icon="notifications" accessibilityLabel="Notifications" />
      </Badge>
      <Badge count={3}>
        <IconButton icon="notifications" accessibilityLabel="Notifications" />
      </Badge>
      <Badge count={100}>
        <IconButton icon="notifications" accessibilityLabel="Notifications" />
      </Badge>
    </View>
  ),
};
