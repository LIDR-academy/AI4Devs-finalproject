import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { PdfDocumentListItem } from './pdf-document-list-item';

const meta = {
  title: 'Molecules/PdfDocumentListItem',
  component: PdfDocumentListItem,
  args: {
    filename: 'notes.pdf',
    statusLabel: 'Ready to generate',
    createdDateLabel: 'Jul 14, 2026',
    pageCountLabel: '12 pages',
    generateLabel: 'Generate',
    retryLabel: 'Retry',
    openLessonLabel: 'Open lesson',
    generateAccessibilityLabel: 'Generate notes.pdf',
    retryAccessibilityLabel: 'Retry notes.pdf',
    openLessonAccessibilityLabel: 'Open lesson for notes.pdf',
    onGenerate: () => {},
    onOpenLesson: () => {},
    onDelete: () => {},
    deleteAccessibilityLabel: 'Delete notes.pdf',
  },
} satisfies Meta<typeof PdfDocumentListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  args: { status: 'ready' },
};

export const Failed: Story = {
  args: {
    status: 'failed',
    statusLabel: 'Generation failed',
  },
};

export const Generated: Story = {
  args: {
    status: 'generated',
    statusLabel: 'Lesson ready',
    onDelete: undefined,
    deleteAccessibilityLabel: undefined,
  },
};
