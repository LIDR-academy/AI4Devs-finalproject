import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { Icon } from './icon';

const meta = {
  title: 'Atoms/Icon',
  component: Icon,
  args: {
    name: 'auto_stories',
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    name: 'check_circle',
    fill: true,
    color: '#b54e21',
  },
};

export const CommonGlyphs: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
      {[
        'upload_file',
        'cloud_upload',
        'link',
        'menu_book',
        'auto_stories',
        'psychology',
        'quiz',
        'bolt',
        'auto_awesome',
        'lightbulb',
        'check_circle',
        'cancel',
        'trending_up',
        'local_fire_department',
        'bookmark',
        'more_vert',
      ].map((name) => (
        <Icon key={name} name={name} />
      ))}
    </View>
  ),
};
