import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { PdfUploadPanel } from './pdf-upload-panel';

const labels = {
  loading: 'Extracting…',
  chooseFile: 'Choose a PDF',
  filenameLabel: 'File',
  pageCountLabel: 'Pages',
  imageCountLabel: 'Images',
  continueLabel: 'Continue',
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
