import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { PdfDocumentListItem } from './pdf-document-list-item';

const meta = {
  title: 'Molecules/PdfDocumentListItem',
  component: PdfDocumentListItem,
  args: {
    filename: 'notes.pdf',
    createdAt: '2026-07-14T12:00:00.000Z',
    pageCount: 12,
    onOpenLesson: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof PdfDocumentListItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {
  args: { status: 'ready', onGenerate: () => {} },
};

export const Failed: Story = {
  args: { status: 'failed', onGenerate: () => {} },
};

export const Generated: Story = {
  args: {
    status: 'generated',
    onDelete: undefined,
  },
};

/** Creation disabled — document metadata remains while Generate is hidden. */
export const CreationDisabled: Story = {
  args: {
    status: 'ready',
  },
};
