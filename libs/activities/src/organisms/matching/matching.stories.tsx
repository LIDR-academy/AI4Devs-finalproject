import type { MatchingAnswer, MatchingSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { Matching } from './matching';

const slide: MatchingSlide = {
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
  explanation: 'Capitals match their countries.',
};

const allCorrectAnswer: MatchingAnswer = {
  slideId: slide.id,
  activityType: 'matching',
  pairs: [
    { leftId: 'l1', rightId: 'r1', isCorrect: true },
    { leftId: 'l2', rightId: 'r2', isCorrect: true },
    { leftId: 'l3', rightId: 'r3', isCorrect: true },
  ],
  correctPairCount: 3,
  totalPairCount: 3,
  isCorrect: true,
};

const mixedAnswer: MatchingAnswer = {
  slideId: slide.id,
  activityType: 'matching',
  pairs: [
    { leftId: 'l1', rightId: 'r1', isCorrect: true },
    { leftId: 'l2', rightId: 'r3', isCorrect: false },
    { leftId: 'l3', rightId: 'r2', isCorrect: false },
  ],
  correctPairCount: 1,
  totalPairCount: 3,
  isCorrect: false,
};

const meta = {
  title: 'Organisms/Matching',
  component: Matching,
  args: { slide },
} satisfies Meta<typeof Matching>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unpaired: Story = {};

export const PartiallyPaired: Story = {
  args: {
    initialPairs: [{ leftId: 'l1', rightId: 'r1' }],
  },
};

export const SubmittedAllCorrect: Story = {
  args: { initialAnswer: allCorrectAnswer },
};

export const SubmittedMixed: Story = {
  args: { initialAnswer: mixedAnswer },
};

export const Empty: Story = {
  args: {
    slide: { ...slide, leftItems: [], correctPairs: [] },
  },
};

export const Error: Story = {
  args: {
    slide: {
      ...slide,
      rightItems: slide.rightItems.slice(0, 2),
      correctPairs: slide.correctPairs.slice(0, 2),
    },
  },
};

export const Interactive: Story = {};
