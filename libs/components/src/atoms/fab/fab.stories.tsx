import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { Fab } from './fab';

const meta = {
  title: 'Atoms/Fab',
  component: Fab,
  args: {
    icon: 'add',
    accessibilityLabel: 'New lesson',
  },
} satisfies Meta<typeof Fab>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Regular: Story = {};

export const Small: Story = {
  args: { size: 'small' },
};

export const Large: Story = {
  args: { size: 'large' },
};

export const Extended: Story = {
  args: { label: 'New lesson' },
};

export const Tertiary: Story = {
  args: { color: 'tertiary', icon: 'auto_awesome' },
};

export const Colors: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 16 }}>
      <Fab icon="add" color="primary" accessibilityLabel="Primary" />
      <Fab icon="add" color="secondary" accessibilityLabel="Secondary" />
      <Fab icon="add" color="tertiary" accessibilityLabel="Tertiary" />
      <Fab icon="add" color="surface" accessibilityLabel="Surface" />
    </View>
  ),
};
