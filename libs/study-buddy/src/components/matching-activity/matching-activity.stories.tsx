import type { MatchingSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { MatchingActivity } from './matching-activity';

const baseSlide: MatchingSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'Match each country to its capital.',
  position: 0,
  kind: 'activity',
  activityType: 'matching',
  leftItems: [
    { id: 'l1', label: 'France' },
    { id: 'l2', label: 'Germany' },
    { id: 'l3', label: 'Italy' },
  ],
  rightItems: [
    { id: 'r1', label: 'Paris' },
    { id: 'r2', label: 'Berlin' },
    { id: 'r3', label: 'Rome' },
  ],
  correctPairs: [
    { leftId: 'l1', rightId: 'r1' },
    { leftId: 'l2', rightId: 'r2' },
    { leftId: 'l3', rightId: 'r3' },
  ],
};

const meta = {
  title: 'Features/MatchingActivity',
  component: MatchingActivity,
  args: {
    slide: baseSlide,
  },
} satisfies Meta<typeof MatchingActivity>;

export default meta;

type Story = StoryObj<typeof meta>;

// Thin wrapper → organism owns tap-to-pair + submit grading; explanation with result.
export const Default: Story = {
  args: {
    slide: { ...baseSlide, explanation: 'Capitals match their countries.' },
  },
};

// Same wiring, but the slide carries no explanation — the explanation heading/body must not
// render at all once submitted.
export const WithoutExplanation: Story = {
  args: {
    slide: baseSlide,
  },
};
