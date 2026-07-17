import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text } from 'react-native';

import { ScreenContainer } from './screen-container';

const meta = {
  title: 'Templates/ScreenContainer',
  component: ScreenContainer,
} satisfies Meta<typeof ScreenContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Text>Screen content</Text>,
  },
};

export const CustomStyle: Story = {
  args: {
    children: <Text>With custom background</Text>,
    style: { backgroundColor: '#eff6ff' },
  },
};
