import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { PdfDocumentList } from './pdf-document-list';
import type { PdfDocumentListItemData } from './pdf-document-list.types';

const documents: PdfDocumentListItemData[] = [
  {
    id: 'doc-3',
    filename: 'notes.pdf',
    status: 'ready',
    statusLabel: 'Ready to generate',
    createdDateLabel: 'Jul 14, 2026',
    pageCountLabel: '8 pages',
    generateLabel: 'Generate',
    retryLabel: 'Retry',
    openLessonLabel: 'Open lesson',
    generateAccessibilityLabel: 'Generate notes.pdf',
    retryAccessibilityLabel: 'Retry notes.pdf',
    openLessonAccessibilityLabel: 'Open lesson for notes.pdf',
    deleteAccessibilityLabel: 'Delete notes.pdf',
  },
  {
    id: 'doc-2',
    filename: 'failed-gen.pdf',
    status: 'failed',
    statusLabel: 'Generation failed',
    createdDateLabel: 'Jul 13, 2026',
    pageCountLabel: '5 pages',
    generateLabel: 'Generate',
    retryLabel: 'Retry',
    openLessonLabel: 'Open lesson',
    generateAccessibilityLabel: 'Generate failed-gen.pdf',
    retryAccessibilityLabel: 'Retry failed-gen.pdf',
    openLessonAccessibilityLabel: 'Open lesson for failed-gen.pdf',
    deleteAccessibilityLabel: 'Delete failed-gen.pdf',
  },
  {
    id: 'doc-1',
    filename: 'biology.pdf',
    status: 'generated',
    statusLabel: 'Lesson ready',
    createdDateLabel: 'Jul 10, 2026',
    pageCountLabel: '12 pages',
    generateLabel: 'Generate',
    retryLabel: 'Retry',
    openLessonLabel: 'Open lesson',
    generateAccessibilityLabel: 'Generate biology.pdf',
    retryAccessibilityLabel: 'Retry biology.pdf',
    openLessonAccessibilityLabel: 'Open lesson for biology.pdf',
  },
];

const meta = {
  title: 'Organisms/PdfDocumentList',
  component: PdfDocumentList,
  args: {
    state: 'content',
    documents,
    onGenerate: () => {},
    onOpenLesson: () => {},
    onRetry: () => {},
  },
} satisfies Meta<typeof PdfDocumentList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Content: Story = {};

export const ContentWithDelete: Story = {
  args: {
    onDelete: () => {},
  },
};

export const Loading: Story = {
  args: {
    state: 'loading',
    documents: [],
  },
};

export const Empty: Story = {
  args: {
    state: 'empty',
    documents: [],
  },
};

export const Error: Story = {
  args: {
    state: 'error',
    documents: [],
  },
};
