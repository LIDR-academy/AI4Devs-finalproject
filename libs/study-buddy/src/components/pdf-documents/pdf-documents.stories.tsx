import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configurePdfDocumentsMock } from '../../../.storybook/mocks/hooks';
import { PdfDocuments } from './pdf-documents';

const SAMPLE_DOCUMENTS = [
  {
    id: 'doc-1',
    filename: 'notes.pdf',
    pageCount: 12,
    createdAt: '2026-07-13T12:00:00.000Z',
    status: 'ready' as const,
    lessonId: null,
  },
  {
    id: 'doc-2',
    filename: 'retry-me.pdf',
    pageCount: 4,
    createdAt: '2026-07-12T12:00:00.000Z',
    status: 'failed' as const,
    lessonId: null,
  },
  {
    id: 'doc-3',
    filename: 'done.pdf',
    pageCount: 3,
    createdAt: '2026-07-11T12:00:00.000Z',
    status: 'generated' as const,
    lessonId: 'lesson-1',
  },
];

const withPdfDocumentsMock =
  (config: Parameters<typeof configurePdfDocumentsMock>[0]): Decorator =>
  (StoryFn) => {
    configurePdfDocumentsMock(config);
    return <StoryFn />;
  };

const meta = {
  title: 'Features/PdfDocuments',
  component: PdfDocuments,
  args: {
    onGenerate: () => {},
    onOpenLesson: () => {},
  },
} satisfies Meta<typeof PdfDocuments>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Content — heading + ready/failed/generated rows. */
export const Content: Story = {
  decorators: [withPdfDocumentsMock({ documents: SAMPLE_DOCUMENTS })],
};

/** Loading — spinner while usePdfDocuments fetches. */
export const Loading: Story = {
  decorators: [withPdfDocumentsMock({ isLoading: true })],
};

/** Empty — no extracted PDFs yet. */
export const Empty: Story = {
  decorators: [withPdfDocumentsMock({ documents: [] })],
};

/** Load failure — retry affordance (list empty). */
export const LoadError: Story = {
  decorators: [withPdfDocumentsMock({ documents: [], error: new globalThis.Error('load failed') })],
};
