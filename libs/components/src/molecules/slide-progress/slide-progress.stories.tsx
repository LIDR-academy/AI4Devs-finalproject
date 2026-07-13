import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';

import { SlideProgress, type SlideProgressSlide } from './slide-progress';

const lesson: SlideProgressSlide[] = [
  { type: 'lesson' },
  { type: 'lesson' },
  { type: 'activity' },
  { type: 'lesson' },
  { type: 'lesson' },
  { type: 'activity' },
  { type: 'lesson' },
  { type: 'activity' },
];

const meta = {
  title: 'Molecules/SlideProgress',
  component: SlideProgress,
  args: {
    slides: lesson,
    current: 3,
    style: { maxWidth: 480 },
  },
} satisfies Meta<typeof SlideProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Start: Story = {
  args: { current: 0 },
};

export const NearEnd: Story = {
  args: { current: 7 },
};

const SeekDemo = () => {
  const [current, setCurrent] = useState(2);
  return (
    <View style={{ maxWidth: 480, paddingVertical: 8 }}>
      <SlideProgress slides={lesson} current={current} onSeek={setCurrent} />
    </View>
  );
};

export const Seekable: Story = {
  render: () => <SeekDemo />,
};
