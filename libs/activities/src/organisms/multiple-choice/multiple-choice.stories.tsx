import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';
import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { MultipleChoice } from './multiple-choice';

const slide: MultipleChoiceSlide = {
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
  explanation: 'Paris has been the capital of France since the 12th century.',
};

const correctAnswer: MultipleChoiceAnswer = {
  slideId: slide.id,
  activityType: 'multiple-choice',
  selectedOptionId: 'opt-a',
  correctOptionId: 'opt-a',
  isCorrect: true,
};

const incorrectAnswer: MultipleChoiceAnswer = {
  slideId: slide.id,
  activityType: 'multiple-choice',
  selectedOptionId: 'opt-b',
  correctOptionId: 'opt-a',
  isCorrect: false,
};

const meta = {
  title: 'Organisms/MultipleChoice',
  component: MultipleChoice,
  args: { slide },
} satisfies Meta<typeof MultipleChoice>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Unanswered: Story = {};

export const AnsweredCorrect: Story = {
  args: { initialAnswer: correctAnswer },
};

export const AnsweredIncorrect: Story = {
  args: { initialAnswer: incorrectAnswer },
};

export const Empty: Story = {
  args: { slide: { ...slide, options: [], correctOptionId: 'opt-a' } },
};

export const Interactive: Story = {};
