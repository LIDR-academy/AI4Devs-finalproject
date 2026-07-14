import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { PdfDocumentListItem } from './pdf-document-list-item';

const meta = {
  title: 'Molecules/PdfDocumentListItem',
  component: PdfDocumentListItem,
  args: {
    filename: 'notes.pdf',
    createdAt: '2026-07-14T12:00:00.000Z',
    pageCount: 12,
    onGenerate: () => {},
    onOpenLesson: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof PdfDocumentListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  args: { status: 'ready' },
};

export const Failed: Story = {
  args: { status: 'failed' },
};

export const Generated: Story = {
  args: {
    status: 'generated',
    onDelete: undefined,
  },
};
