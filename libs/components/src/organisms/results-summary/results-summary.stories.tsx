import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { ResultsSummary } from './results-summary';

const labels = {
  score: '3 / 3',
  percent: '100%',
  retake: 'Retake activities',
  backToLessons: 'Back to my lessons',
};

const meta = {
  title: 'Organisms/ResultsSummary',
  component: ResultsSummary,
  args: {
    variant: 'score',
    labels,
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
