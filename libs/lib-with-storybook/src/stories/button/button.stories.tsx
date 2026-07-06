import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { Button } from './button';

const meta = {
  title: 'Example/Button',
  component: Button,
  args: {
    label: 'Button',
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};
