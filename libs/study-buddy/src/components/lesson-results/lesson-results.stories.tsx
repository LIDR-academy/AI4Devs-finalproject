import type { Lesson } from '@helsoft/types';
import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configureLessonAttemptMock } from '../../../.storybook/mocks/hooks';
import { LessonResults } from './lesson-results';

// Seeds the fake useLessonAttempt() (see .storybook/mocks/hooks.ts) just before the story
// mounts — mirrors sign-in-form.stories.tsx's withAuthMock / components LessonResults stories.
const withLessonAttemptMock =
  (config: Parameters<typeof configureLessonAttemptMock>[0]): Decorator =>
  (StoryFn) => {
    configureLessonAttemptMock(config);
    return <StoryFn />;
  };

const scorableLesson: Lesson = {
  id: 'lesson-1',
  userId: 'user-1',
  title: 'Capitals',
  createdAt: '2026-07-11T00:00:00.000Z',
  slides: [
    {
      id: 'slide-1',
      lessonId: 'lesson-1',
      title: 'Q1',
      content: 'What is the capital of France?',
      position: 0,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [{ id: 'opt-a', label: 'Paris' }],
      correctOptionId: 'opt-a',
    },
    {
      id: 'slide-2',
      lessonId: 'lesson-1',
      title: 'Q2',
      content: 'What is the capital of Germany?',
      position: 1,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [{ id: 'opt-a', label: 'Berlin' }],
      correctOptionId: 'opt-a',
    },
    {
      id: 'slide-3',
      lessonId: 'lesson-1',
      title: 'Q3',
      content: 'What is the capital of Spain?',
      position: 2,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [{ id: 'opt-a', label: 'Madrid' }],
      correctOptionId: 'opt-a',
    },
  ],
};

const allCorrectAnswers = [
  { slideId: 'slide-1', activityType: 'multiple-choice' as const, isCorrect: true },
  { slideId: 'slide-2', activityType: 'multiple-choice' as const, isCorrect: true },
  { slideId: 'slide-3', activityType: 'multiple-choice' as const, isCorrect: true },
];

const instructionalOnlyLesson: Lesson = {
  id: 'lesson-2',
  userId: 'user-1',
  title: 'Intro to Capitals',
  createdAt: '2026-07-11T00:00:00.000Z',
  slides: [
    {
      id: 'slide-1',
      lessonId: 'lesson-2',
      title: 'Intro',
      content: 'Welcome!',
      position: 0,
      kind: 'instructional',
    },
  ],
};

const meta = {
  title: 'Features/LessonResults',
  component: LessonResults,
  args: {
    lesson: scorableLesson,
    answers: allCorrectAnswers,
    onRetake: () => {},
    onBackToLessons: () => {},
  },
} satisfies Meta<typeof LessonResults>;

export default meta;

type Story = StoryObj<typeof meta>;

// Thin wrapper → components organism scores + persists via mocked useLessonAttempt.
export const Score: Story = {
  decorators: [withLessonAttemptMock({ status: 'idle' })],
};

export const Loading: Story = {
  decorators: [withLessonAttemptMock({ status: 'saving' })],
};

export const Completion: Story = {
  args: {
    lesson: instructionalOnlyLesson,
    answers: [],
  },
  decorators: [withLessonAttemptMock({ status: 'idle' })],
};

export const SaveFailed: Story = {
  decorators: [withLessonAttemptMock({ status: 'error' })],
};
