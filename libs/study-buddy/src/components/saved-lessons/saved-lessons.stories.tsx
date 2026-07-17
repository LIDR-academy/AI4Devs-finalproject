import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configureLessonsMock } from '../../../.storybook/mocks/hooks';
import { SavedLessons } from './saved-lessons';

const SAMPLE_LESSONS = [
  {
    id: 'lesson-2',
    title: 'Photosynthesis basics',
    createdAt: '2026-07-13T12:00:00.000Z',
  },
  {
    id: 'lesson-1',
    title: 'Cell division',
    createdAt: '2026-07-10T12:00:00.000Z',
  },
];

const withLessonsMock =
  (config: Parameters<typeof configureLessonsMock>[0]): Decorator =>
  (StoryFn) => {
    configureLessonsMock(config);
    return <StoryFn />;
  };

const meta = {
  title: 'Features/SavedLessons',
  component: SavedLessons,
} satisfies Meta<typeof SavedLessons>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Content — heading, count, and open/delete list rows. */
export const Content: Story = {
  decorators: [withLessonsMock({ lessons: SAMPLE_LESSONS })],
};

/** Loading — spinner while useLessons fetches. */
export const Loading: Story = {
  decorators: [withLessonsMock({ isLoading: true })],
};

/** Empty — no saved lessons yet. */
export const Empty: Story = {
  decorators: [withLessonsMock({ lessons: [] })],
};

/** Load failure — retry affordance (list empty). */
export const LoadError: Story = {
  decorators: [withLessonsMock({ lessons: [], error: new globalThis.Error('load failed') })],
};

/** Content + delete failure banner (list still shown). */
export const DeleteFailed: Story = {
  decorators: [
    withLessonsMock({
      lessons: SAMPLE_LESSONS,
      error: new globalThis.Error('delete failed'),
    }),
  ],
};
