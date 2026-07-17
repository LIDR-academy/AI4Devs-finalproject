import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { IconButton } from './icon-button';

const meta = {
  title: 'Atoms/IconButton',
  component: IconButton,
  args: {
    icon: 'bookmark',
    accessibilityLabel: 'Bookmark',
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {};

export const Filled: Story = {
  args: { variant: 'filled' },
};

export const Tonal: Story = {
  args: { variant: 'tonal' },
};

export const Outlined: Story = {
  args: { variant: 'outlined' },
};

export const Selected: Story = {
  args: { selected: true },
};

export const Variants: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <IconButton icon="more_vert" accessibilityLabel="More" />
      <IconButton icon="bookmark" variant="filled" accessibilityLabel="Bookmark" />
      <IconButton icon="link" variant="tonal" accessibilityLabel="Link" />
      <IconButton icon="quiz" variant="outlined" accessibilityLabel="Quiz" />
    </View>
  ),
};
