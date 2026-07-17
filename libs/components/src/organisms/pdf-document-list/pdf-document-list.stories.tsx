import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { PdfDocumentList } from './pdf-document-list';
import type { PdfDocumentListItemData } from './pdf-document-list.types';

const documents: PdfDocumentListItemData[] = [
  {
    id: 'doc-3',
    filename: 'notes.pdf',
    status: 'ready',
    createdAt: '2026-07-14T12:00:00.000Z',
    pageCount: 8,
  },
  {
    id: 'doc-2',
    filename: 'failed-gen.pdf',
    status: 'failed',
    createdAt: '2026-07-13T12:00:00.000Z',
    pageCount: 5,
  },
  {
    id: 'doc-1',
    filename: 'biology.pdf',
    status: 'generated',
    createdAt: '2026-07-10T12:00:00.000Z',
    pageCount: 12,
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

/** Creation disabled — ready/failed actions hidden; generated lesson remains openable. */
export const CreationDisabled: Story = {
  args: {
    onGenerate: undefined,
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
