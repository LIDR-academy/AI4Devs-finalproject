import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { NavItem } from './nav-item';

const meta = {
  title: 'Molecules/NavItem',
  component: NavItem,
  args: {
    label: 'Home',
    onPress: () => undefined,
  },
} satisfies Meta<typeof NavItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Inactive: Story = {};

export const Pill: Story = {
  args: { active: true },
};

export const Underline: Story = {
  args: { active: true, indicatorVariant: 'underline' },
};

export const Dot: Story = {
  args: { active: true, indicatorVariant: 'dot' },
};
