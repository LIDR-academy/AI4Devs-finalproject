import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { LessonProgressIndicator } from './lesson-progress-indicator';

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
  args: { current: 1, total: 5, label: 'Slide 1 of 5' },
};

export const MidDeck: Story = {
  args: { current: 3, total: 5, label: 'Slide 3 of 5' },
};

export const ResultsSlide: Story = {
  args: { current: 5, total: 5, label: 'Slide 5 of 5' },
};

export const SingleStep: Story = {
  args: { current: 1, total: 1, label: 'Slide 1 of 1' },
};
