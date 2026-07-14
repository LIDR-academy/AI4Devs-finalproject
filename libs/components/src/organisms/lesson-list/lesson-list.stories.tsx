import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { LessonList } from './lesson-list';

const labels = {
  loading: 'Loading saved lessons…',
  empty: 'No saved lessons yet. Create one to get started.',
  error: "We couldn't load your lessons.",
  retry: 'Try again',
};

const lessons = [
  {
    id: 'lesson-2',
    title: 'Photosynthesis basics',
    createdDateLabel: 'Jul 13, 2026',
    openAccessibilityLabel: 'Open Photosynthesis basics',
  },
  {
    id: 'lesson-1',
    title: 'Cell division',
    createdDateLabel: 'Jul 10, 2026',
    openAccessibilityLabel: 'Open Cell division',
  },
];

const meta = {
  title: 'Organisms/LessonList',
  component: LessonList,
  args: {
    state: 'content',
    lessons,
    labels,
    onOpenLesson: () => {},
    onRetry: () => {},
  },
} satisfies Meta<typeof LessonList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Content: Story = {};

export const ContentWithDelete: Story = {
  args: {
    onDelete: () => {},
    deleteLabel: 'Delete lesson',
    labels: {
      ...labels,
      deleteConfirmHeadline: 'Delete this lesson?',
      deleteConfirmBody: 'This permanently removes the lesson and its progress.',
      deleteConfirmAction: 'Delete',
      deleteConfirmCancelAction: 'Cancel',
    },
  },
};

export const Loading: Story = {
  args: {
    state: 'loading',
    lessons: [],
  },
};

export const Empty: Story = {
  args: {
    state: 'empty',
    lessons: [],
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    lessons: [],
  },
};
