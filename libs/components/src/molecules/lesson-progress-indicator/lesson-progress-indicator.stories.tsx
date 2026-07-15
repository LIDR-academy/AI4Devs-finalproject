import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import type { SlideProgressSlide } from '../slide-progress/slide-progress';
import { LessonProgressIndicator } from './lesson-progress-indicator';

const deck: SlideProgressSlide[] = [
  { type: 'lesson' },
  { type: 'activity' },
  { type: 'lesson' },
  { type: 'activity' },
];

const meta = {
  title: 'Molecules/LessonProgressIndicator',
  component: LessonProgressIndicator,
  decorators: [
    (Story) => (
      <View style={{ width: 320, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof LessonProgressIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstSlide: Story = {
  args: { slides: deck, current: 0, label: 'Slide 1 of 5' },
};

export const MidDeck: Story = {
  args: { slides: deck, current: 2, label: 'Slide 3 of 5' },
};

export const ResultsSlide: Story = {
  args: { slides: deck, current: 4, label: 'Slide 5 of 5' },
};

export const SingleStep: Story = {
  args: {
    slides: [{ type: 'lesson' }],
    current: 0,
    label: 'Slide 1 of 1',
  },
};
