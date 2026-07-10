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

// Error (@s8-@s13) — the message for the current error code, a retry affordance, and the
// choose-file control staying enabled ("returns to a usable state").
export const Error: Story = {
  args: {
    state: 'error',
    errorMessage: 'This PDF has too many pages (max 20)',
    onRetry: () => {},
  },
};
