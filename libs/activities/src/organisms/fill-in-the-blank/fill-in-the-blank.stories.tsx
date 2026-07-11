import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';

import {
  FillInTheBlank,
  FillInTheBlankResult,
} from './fill-in-the-blank';

const labels = {
  submit: 'Submit',
  correct: 'Correct!',
  incorrect: 'Incorrect',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
  blankInput: 'Fill in the blank',
};

const ACCEPTED = ['Paris', 'City of Light'];
const CONTENT = 'The capital of France is ____.';
const MAX_LENGTH = Math.ceil(ACCEPTED[0].length * 1.25);

const normalize = (raw: string) =>
  raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');

const grade = (submitted: string): FillInTheBlankResult => {
  const normalized = normalize(submitted);
  const matched = ACCEPTED.find((accepted) => normalize(accepted) === normalized);
  return {
    isCorrect: matched !== undefined,
    acceptedAnswerShown: matched ?? ACCEPTED[0],
  };
};

const meta = {
  title: 'Organisms/FillInTheBlank',
  component: FillInTheBlank,
  args: {
    content: CONTENT,
    value: '',
    maxLength: MAX_LENGTH,
    labels,
    onChangeValue: () => {},
    onSubmit: () => {},
  },
} satisfies Meta<typeof FillInTheBlank>;

export default meta;

type Story = StoryObj<typeof meta>;

// Unanswered — editable blank, Submit enabled, no result (@s1).
export const Unanswered: Story = {};

// Correct — locked + correct banner (@s2).
export const Correct: Story = {
  args: {
    value: 'paris',
    result: { isCorrect: true, acceptedAnswerShown: 'Paris' },
    explanation: 'Paris is the capital of France.',
  },
};

// Incorrect — locked + incorrect banner + reveal [0] (@s3).
export const Incorrect: Story = {
  args: {
    value: 'london',
    result: { isCorrect: false, acceptedAnswerShown: 'Paris' },
    explanation: 'Paris is the capital of France.',
  },
};

// Empty/Error — unavailable notice (@s11/@s12).
export const Unavailable: Story = {
  args: {
    unavailable: true,
  },
};

// Missing blank marker — organism self-detect (@s12).
export const MissingBlank: Story = {
  args: {
    content: 'The capital of France is Paris.',
  },
};

// Interactive — type → Submit/Enter → lock for Playwright e2e.
const InteractiveDemo = () => {
  const [value, setValue] = useState('');
  const [result, setResult] = useState<FillInTheBlankResult | null>(null);

  return (
    <FillInTheBlank
      content={CONTENT}
      value={value}
      maxLength={MAX_LENGTH}
      result={result}
      explanation="Paris is the capital of France."
      labels={labels}
      onChangeValue={setValue}
      onSubmit={() => {
        if (result) return;
        setResult(grade(value));
      }}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
