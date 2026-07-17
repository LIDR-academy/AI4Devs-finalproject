import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { OpenEnded } from './open-ended';

const meta = {
  title: 'Organisms/OpenEnded',
  component: OpenEnded,
  args: {
    prompt: 'What is photosynthesis?',
    modelAnswer: 'Conversion of light energy into chemical energy.',
    explanation: 'Key process in plants.',
    maxLength: 2000,
    onSubmit: () => {},
  },
} satisfies Meta<typeof OpenEnded>;

export default meta;

type Story = StoryObj<typeof meta>;

/** @s1 — unanswered editable multiline; model hidden. */
export const Unanswered: Story = {};

/** @s2 — locked with learner text + model answer revealed. */
export const SubmittedWithModelAnswer: Story = {
  args: {
    initialSubmittedAnswer: 'Plants turn light into sugar.',
  },
};

/** @s7 — Empty/Error degrade to unavailable. */
export const Unavailable: Story = {
  args: {
    unavailable: true,
  },
};

/** Interactive demo for Playwright — type → Submit → reveal + lock. */
export const Interactive: Story = {};
