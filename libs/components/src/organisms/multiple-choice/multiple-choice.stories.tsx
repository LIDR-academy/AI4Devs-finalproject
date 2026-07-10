import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { MultipleChoice } from './multiple-choice';

const labels = {
  correct: 'Correct!',
  incorrect: 'Not quite — review the explanation below.',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
};

const options = [
  { id: 'opt-a', label: 'Paris' },
  { id: 'opt-b', label: 'Berlin' },
  { id: 'opt-c', label: 'Madrid' },
];

const meta = {
  title: 'Organisms/MultipleChoice',
  component: MultipleChoice,
  args: {
    question: 'What is the capital of France?',
    options,
    correctOptionId: 'opt-a',
    labels,
    onSelectOption: () => {},
  },
} satisfies Meta<typeof MultipleChoice>;

export default meta;

type Story = StoryObj<typeof meta>;

// Content (a) — unanswered: every option is enabled, none selected, no result shown.
export const Unanswered: Story = {};

// Content (b) — answered-correct: the selected tile is marked correct and the correct
// banner (plus explanation) is shown.
export const AnsweredCorrect: Story = {
  args: {
    selectedOptionId: 'opt-a',
    explanation: 'Paris has been the capital of France since the 12th century.',
  },
};

// Content (c) — answered-incorrect: the selected tile is marked incorrect, the correct tile
// is revealed alongside it, and the incorrect banner (plus explanation) is shown.
export const AnsweredIncorrect: Story = {
  args: {
    selectedOptionId: 'opt-b',
    explanation: 'Paris has been the capital of France since the 12th century.',
  },
};
