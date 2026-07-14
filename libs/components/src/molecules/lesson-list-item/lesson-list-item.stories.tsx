import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { LessonListItem } from './lesson-list-item';

const meta = {
  title: 'Molecules/LessonListItem',
  component: LessonListItem,
  args: {
    title: 'Photosynthesis basics',
    createdDateLabel: 'Jul 13, 2026',
    openAccessibilityLabel: 'Open Photosynthesis basics',
    onOpen: () => {},
  },
} satisfies Meta<typeof LessonListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
