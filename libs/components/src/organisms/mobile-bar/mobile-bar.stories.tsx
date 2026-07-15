import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from 'react-native';
import { MobileBar } from './mobile-bar';

const meta = {
  title: 'Organisms/MobileBar',
  component: MobileBar,
  args: {
    avatar: <Text>HL</Text>,
    title: <Text>Home</Text>,
    home: { label: 'Home', active: true, onPress: () => undefined },
    newLesson: { label: 'New lesson', onPress: () => undefined },
  },
} satisfies Meta<typeof MobileBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Content: Story = {};

export const WithSafeArea: Story = {
  args: { safeAreaInsetBottom: 24 },
};

export const UnderlineIndicator: Story = {
  args: { indicatorVariant: 'underline' },
};

export const DotIndicator: Story = {
  args: { indicatorVariant: 'dot' },
};
