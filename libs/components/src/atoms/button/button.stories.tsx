import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { Button } from './button';

const meta = {
  title: 'Atoms/Button',
  component: Button,
  args: {
    children: 'Generate lesson',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filled: Story = {};

export const Tonal: Story = {
  args: { variant: 'tonal' },
};

export const Elevated: Story = {
  args: { variant: 'elevated' },
};

export const Outlined: Story = {
  args: { variant: 'outlined' },
};

export const TextVariant: Story = {
  args: { variant: 'text' },
};

export const WithIcon: Story = {
  args: { icon: 'auto_awesome' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const Sizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </View>
  ),
};
