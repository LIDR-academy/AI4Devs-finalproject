import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from 'react-native';
import { DesktopBar } from './desktop-bar';

const meta = {
  title: 'Organisms/DesktopBar',
  component: DesktopBar,
  args: {
    avatar: <Text>HL</Text>,
    home: { label: 'Home', active: true, onPress: () => undefined },
    newLesson: { label: 'New lesson', onPress: () => undefined },
  },
} satisfies Meta<typeof DesktopBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Content: Story = {};

export const UnderlineIndicator: Story = {
  args: { indicatorVariant: 'underline' },
};

export const DotIndicator: Story = {
  args: { indicatorVariant: 'dot' },
};

export const AlertsBadge: Story = {
  args: { alertsBadgeCount: 2 },
};
