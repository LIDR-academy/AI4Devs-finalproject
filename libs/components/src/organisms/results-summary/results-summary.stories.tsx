import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { ResultsSummary } from './results-summary';

const meta = {
  title: 'Organisms/ResultsSummary',
  component: ResultsSummary,
  args: {
    variant: 'score',
    correct: 3,
    total: 3,
    onRetake: () => {},
    onBackToLessons: () => {},
  },
} satisfies Meta<typeof ResultsSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

// Content — the score and percentage for the current attempt, plus both actions.
export const Score: Story = {};

// Loading (@s5) — the attempt is being saved; actions are unavailable.
export const Loading: Story = {
  args: {
    loading: true,
  },
};

// Completion (@s8/@s9/@s10) — an instructional-only lesson or a lesson with nothing
// system-checked; no score, both actions still available.
export const Completion: Story = {
  args: {
    variant: 'completion',
  },
};

// Save failure (@s7) — the score still renders; a non-blocking notice offers a retry.
export const SaveFailed: Story = {
  args: {
    saveFailed: true,
    onRetrySave: () => {},
  },
};
