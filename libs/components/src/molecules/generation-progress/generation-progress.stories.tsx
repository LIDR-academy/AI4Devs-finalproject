import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { GenerationProgress } from './generation-progress';

const steps = [
  { label: 'Reading content' },
  { label: 'Generating slides' },
  { label: 'Attaching images' },
];

// Demo copy only — real usage is built from t('generation.step.status.*') by
// LessonGenerationPanel (review.md round-1 finding #1); stories/demo args are exempt from the
// hardcoded-copy guard, same as `steps` above.
const statusLabels = { done: 'done', current: 'current', upcoming: 'upcoming' };

const meta = {
  title: 'Molecules/GenerationProgress',
  component: GenerationProgress,
  args: {
    steps,
    statusLabels,
  },
} satisfies Meta<typeof GenerationProgress>;

export default meta;

type Story = StoryObj<typeof meta>;

// Reading content — the first step is current, the other two are upcoming (@s14).
export const Reading: Story = {
  args: { currentIndex: 0 },
};

// Generating slides — the middle step is current, the first is done, the last is upcoming.
export const Generating: Story = {
  args: { currentIndex: 1 },
};

// Attaching images — the last step is current; both earlier steps are done.
export const Attaching: Story = {
  args: { currentIndex: 2 },
};

// All done — every step renders its done indicator (past the last index).
export const Done: Story = {
  args: { currentIndex: steps.length },
};
