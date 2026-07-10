import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { PdfUploadPanel } from './pdf-upload-panel';

const labels = {
  loading: 'Extracting…',
  chooseFile: 'Choose a PDF',
  filenameLabel: 'File',
  pageCountLabel: 'Pages',
  imageCountLabel: 'Images',
  continueLabel: 'Continue',
  constraintsHint: 'Max 10 MB, 20 pages',
  retry: 'Try again',
};

const meta = {
  title: 'Organisms/PdfUploadPanel',
  component: PdfUploadPanel,
  args: {
    onChooseFile: () => {},
    labels,
  },
} satisfies Meta<typeof PdfUploadPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

// Empty/pristine (@s7) — "choose a PDF" affordance, size/page constraints hint, no error.
export const Empty: Story = {
  args: {
    state: 'idle',
  },
};

// Loading (@s5) — indeterminate progress affordance; the choose-file control is disabled.
export const Loading: Story = {
  args: {
    state: 'loading',
  },
};

// Content (@s6) — success summary (filename, page count, image count) + continue affordance.
export const Content: Story = {
  args: {
    state: 'content',
    filename: 'biology-chapter-4.pdf',
    pageCount: 12,
    imageCount: 5,
    onContinue: () => {},
  },
};

// Error, retryable (@s8-@s13, review round-1 fix) — a transient code (network_error/
// extraction_failed) where retrying can actually change the outcome: the message, a retry
// affordance, and the choose-file control staying enabled ("returns to a usable state").
export const ErrorRetryable: Story = {
  args: {
    state: 'error',
    errorMessage: 'Something went wrong while reading your PDF',
    onRetry: () => {},
  },
};

// Error, non-retryable (@s8-@s13, review round-1 fix) — one of the 6 non-transient codes (here
// too_many_pages): no retry affordance, since retrying would deterministically reproduce the same
// failure — the persistent choose-file control is the real recovery action.
export const ErrorNonRetryable: Story = {
  args: {
    state: 'error',
    errorMessage: 'This PDF has too many pages (max 20)',
    canRetry: false,
  },
};
