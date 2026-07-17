import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { View } from 'react-native';

import { LessonPlayerNavigator } from './lesson-player-navigator';

const deck = [
  { type: 'lesson' as const },
  { type: 'activity' as const },
  { type: 'lesson' as const },
  { type: 'activity' as const },
];

const meta = {
  title: 'Organisms/LessonPlayerNavigator',
  component: LessonPlayerNavigator,
  decorators: [
    (Story) => (
      <View style={{ width: 400, padding: 16 }}>
        <Story />
      </View>
    ),
  ],
  args: {
    slides: deck,
    onBack: () => undefined,
    onNext: () => undefined,
  },
} satisfies Meta<typeof LessonPlayerNavigator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FirstSlide: Story = {
  args: {
    current: 0,
    label: 'Slide 1 of 5',
    canGoBack: false,
    canGoNext: true,
  },
};

export const MidDeck: Story = {
  args: {
    current: 2,
    label: 'Slide 3 of 5',
    canGoBack: true,
    canGoNext: true,
  },
};

export const ResultsStep: Story = {
  args: {
    current: 4,
    label: 'Slide 5 of 5',
    canGoBack: true,
    canGoNext: false,
  },
};
