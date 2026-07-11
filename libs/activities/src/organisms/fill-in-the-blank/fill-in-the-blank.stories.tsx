import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { FillInTheBlank } from './fill-in-the-blank';

const slide: FillInTheBlankSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'The capital of France is ____.',
  position: 0,
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  acceptedAnswers: ['Paris', 'City of Light'],
  explanation: 'Paris is the capital of France.',
};

const correctAnswer: FillInTheBlankAnswer = {
  slideId: slide.id,
  activityType: 'fill-in-the-blank',
  submittedAnswer: 'paris',
  acceptedAnswerShown: 'Paris',
  isCorrect: true,
};

const incorrectAnswer: FillInTheBlankAnswer = {
  slideId: slide.id,
  activityType: 'fill-in-the-blank',
  submittedAnswer: 'london',
  acceptedAnswerShown: 'Paris',
  isCorrect: false,
};

const meta = {
  title: 'Organisms/FillInTheBlank',
  component: FillInTheBlank,
  args: {
    slide,
  },
} satisfies Meta<typeof FillInTheBlank>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unanswered: Story = {};

export const Correct: Story = {
  args: { initialAnswer: correctAnswer },
};

export const Incorrect: Story = {
  args: { initialAnswer: incorrectAnswer },
};

export const Unavailable: Story = {
  args: { slide: { ...slide, acceptedAnswers: [] } },
};

export const MissingBlank: Story = {
  args: { slide: { ...slide, content: 'The capital of France is Paris.' } },
};

export const Interactive: Story = {};
