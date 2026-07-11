import type { Lesson } from '@helsoft/types';
import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configureLessonAttemptMock } from '../../../.storybook/mocks/hooks';
import { LessonResults } from './lesson-results';

// Seeds the fake useLessonAttempt() (see .storybook/mocks/hooks.ts) just before the story
// mounts, so its useState lazy initializer picks up this story's state on first (and only)
// render — mirrors sign-in-form.stories.tsx's withAuthMock.
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

// Score (@s1) — the real scoreLesson computes 3/3 correct; the fake useLessonAttempt resolves
// as idle so ResultsSummary renders the score immediately.
export const Score: Story = {
  decorators: [withLessonAttemptMock({ status: 'idle' })],
};

// Loading (@s5) — useLessonAttempt().status is 'saving', driving ResultsSummary's loading
// affordance while the attempt is being persisted.
export const Loading: Story = {
  decorators: [withLessonAttemptMock({ status: 'saving' })],
};
