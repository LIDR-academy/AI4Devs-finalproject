import type { FlashcardSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { FlashcardActivity } from './flashcard-activity';

const baseSlide: FlashcardSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Photosynthesis',
  content: 'What pigment absorbs light for photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'flashcard',
  back: 'Chlorophyll',
};

const meta = {
  title: 'Features/FlashcardActivity',
  component: FlashcardActivity,
  args: {
    slide: baseSlide,
  },
} satisfies Meta<typeof FlashcardActivity>;

export default meta;

type Story = StoryObj<typeof meta>;

// Thin wrapper → organism owns reveal + self-mark; explanation shown alongside the answer.
export const Default: Story = {
  args: {
    slide: {
      ...baseSlide,
      explanation: 'Chlorophyll reflects green light, giving plants their color.',
    },
  },
};

// Same wiring, but the slide carries no explanation — the explanation heading/body must not
// render at all once revealed.
export const WithoutExplanation: Story = {
  args: {
    slide: baseSlide,
  },
};
