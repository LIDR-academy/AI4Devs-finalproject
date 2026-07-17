import type { OpenEndedSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { OpenEndedActivity } from './open-ended-activity';

const baseSlide: OpenEndedSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Explain',
  content: 'What is photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'open-ended',
  modelAnswer: 'Conversion of light energy into chemical energy.',
};

const meta = {
  title: 'Features/OpenEndedActivity',
  component: OpenEndedActivity,
  args: {
    slide: baseSlide,
  },
} satisfies Meta<typeof OpenEndedActivity>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Thin wrapper → organism owns draft/lock; explanation shown with model answer. */
export const Default: Story = {
  args: {
    slide: {
      ...baseSlide,
      explanation: 'Key process in plants that converts light into chemical energy.',
    },
  },
};

/** Same wiring, no explanation — heading/body must not render after submit. */
export const WithoutExplanation: Story = {
  args: {
    slide: baseSlide,
  },
};

/** Invalid slide (blank modelAnswer) → unavailable degrade. */
export const Unavailable: Story = {
  args: {
    slide: { ...baseSlide, modelAnswer: '' },
  },
};
