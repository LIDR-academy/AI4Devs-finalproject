import type { MultipleChoiceSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { MultipleChoiceActivity } from './multiple-choice-activity';

const baseSlide: MultipleChoiceSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'What is the capital of France?',
  position: 0,
  kind: 'activity',
  activityType: 'multiple-choice',
  options: [
    { id: 'opt-a', label: 'Paris' },
    { id: 'opt-b', label: 'Berlin' },
    { id: 'opt-c', label: 'Madrid' },
  ],
  correctOptionId: 'opt-a',
};

const meta = {
  title: 'Features/MultipleChoiceActivity',
  component: MultipleChoiceActivity,
  args: {
    slide: baseSlide,
  },
} satisfies Meta<typeof MultipleChoiceActivity>;

export default meta;

type Story = StoryObj<typeof meta>;

// Thin wrapper → organism grades + locks on select (@s2/@s3/@s4); explanation with result (@s5).
export const Default: Story = {
  args: {
    slide: { ...baseSlide, explanation: 'Paris has been the capital of France since 987 AD.' },
  },
};

// Same wiring, but the slide carries no explanation — the explanation heading/body must not
// render at all once answered.
export const WithoutExplanation: Story = {
  args: {
    slide: baseSlide,
  },
};
