import type { FillInTheBlankSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { FillInTheBlankActivity } from './fill-in-the-blank-activity';

const baseSlide: FillInTheBlankSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'The capital of France is ____.',
  position: 0,
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  acceptedAnswers: ['Paris', 'City of Light'],
};

const meta = {
  title: 'Features/FillInTheBlankActivity',
  component: FillInTheBlankActivity,
  args: {
    slide: baseSlide,
  },
} satisfies Meta<typeof FillInTheBlankActivity>;

export default meta;

type Story = StoryObj<typeof meta>;

// Thin wrapper → organism grades + locks on submit; explanation with result.
export const Default: Story = {
  args: {
    slide: { ...baseSlide, explanation: 'Paris is the capital of France.' },
  },
};

// Same wiring, but the slide carries no explanation — the explanation heading/body must not
// render at all once answered.
export const WithoutExplanation: Story = {
  args: {
    slide: baseSlide,
  },
};
