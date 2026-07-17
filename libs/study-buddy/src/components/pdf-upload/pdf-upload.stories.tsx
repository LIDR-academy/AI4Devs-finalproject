import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import type { ReactNode } from 'react';

import { configurePdfExtractionMock } from '../../../.storybook/mocks/pdf-upload-extraction';
import { PdfUpload } from './pdf-upload';

const withPdfExtractionMock =
  (config: Parameters<typeof configurePdfExtractionMock>[0]) => (StoryFn: () => ReactNode) => {
    configurePdfExtractionMock(config);
    return <StoryFn />;
  };

const meta = {
  title: 'Features/PdfUpload',
  component: PdfUpload,
  args: {},
} satisfies Meta<typeof PdfUpload>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Idle — choose-file affordance + size/page hints. */
export const Idle: Story = {
  decorators: [withPdfExtractionMock({ stage: 'idle' })],
};

/** Processing — choose-file disabled while extraction runs. */
export const Processing: Story = {
  decorators: [withPdfExtractionMock({ stage: 'processing' })],
};

/** Success — filename / page / image summary. */
export const Success: Story = {
  decorators: [
    withPdfExtractionMock({
      stage: 'success',
      result: {
        documentId: 'doc-story-1',
        filename: 'biology-chapter-4.pdf',
        pageCount: 12,
        imageCount: 5,
        pages: [{ page: 1, text: 'Sample' }],
        images: [],
      },
    }),
  ],
};

/** Error, retryable — network failure with Try again. */
export const ErrorRetryable: Story = {
  decorators: [withPdfExtractionMock({ stage: 'error', error: 'network_error' })],
};

/** Error, non-retryable — too many pages (choose-file is recovery). */
export const ErrorTooManyPages: Story = {
  decorators: [withPdfExtractionMock({ stage: 'error', error: 'too_many_pages' })],
};
