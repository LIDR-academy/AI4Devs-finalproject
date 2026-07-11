import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';

import {
  Matching,
  MatchingItemView,
  MatchingPairSelection,
  MatchingResult,
} from './matching';

const labels = {
  submit: 'Submit',
  correct: 'All correct!',
  incorrect: 'Not quite — review the explanation below.',
  correctPair: 'correct',
  incorrectPair: 'incorrect',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
};

const leftItems: MatchingItemView[] = [
  { id: 'l1', label: 'France' },
  { id: 'l2', label: 'Germany' },
  { id: 'l3', label: 'Italy' },
];

const rightItems: MatchingItemView[] = [
  { id: 'r1', label: 'Paris' },
  { id: 'r2', label: 'Berlin' },
  { id: 'r3', label: 'Rome' },
];

const correctPairs = [
  { leftId: 'l1', rightId: 'r1' },
  { leftId: 'l2', rightId: 'r2' },
  { leftId: 'l3', rightId: 'r3' },
];

const gradePairs = (pairs: MatchingPairSelection[]): MatchingResult => {
  const graded = pairs.map((pair) => ({
    ...pair,
    isCorrect: correctPairs.some((c) => c.leftId === pair.leftId && c.rightId === pair.rightId),
  }));
  const correctCount = graded.filter((p) => p.isCorrect).length;
  return {
    pairs: graded,
    isCorrect: correctCount === graded.length,
    summary: `${correctCount} of ${graded.length} correct`,
  };
};

const allCorrectResult: MatchingResult = gradePairs(correctPairs);

const mixedResult: MatchingResult = gradePairs([
  { leftId: 'l1', rightId: 'r1' },
  { leftId: 'l2', rightId: 'r3' },
  { leftId: 'l3', rightId: 'r2' },
]);

const meta = {
  title: 'Organisms/Matching',
  component: Matching,
  args: {
    prompt: 'Match each country to its capital.',
    leftItems,
    rightItems,
    labels,
    onSubmit: () => {},
  },
} satisfies Meta<typeof Matching>;

export default meta;

type Story = StoryObj<typeof meta>;

// Unpaired — all items tappable, Submit disabled (@s1/@s7).
export const Unpaired: Story = {};

// PartiallyPaired — one pair pre-formed, Submit still disabled (@s7).
export const PartiallyPaired: Story = {
  args: {
    initialPairs: [{ leftId: 'l1', rightId: 'r1' }],
  },
};

// SubmittedAllCorrect — result all correct (@s8/@s9).
export const SubmittedAllCorrect: Story = {
  args: {
    result: allCorrectResult,
    explanation: 'Capitals match their countries.',
  },
};

// SubmittedMixed — result mixed (@s8/@s10).
export const SubmittedMixed: Story = {
  args: {
    result: mixedResult,
    explanation: 'Capitals match their countries.',
  },
};

// Empty — a column empty (@s13).
export const Empty: Story = {
  args: {
    leftItems: [],
  },
};

// Error — unequal lengths (@s14).
export const Error: Story = {
  args: {
    rightItems: rightItems.slice(0, 2),
  },
};

// Interactive — real pending/pair/submit state for Playwright e2e.
const InteractiveDemo = () => {
  const [result, setResult] = useState<MatchingResult | null>(null);
  return (
    <Matching
      prompt="Match each country to its capital."
      leftItems={leftItems}
      rightItems={rightItems}
      explanation="Capitals match their countries."
      labels={labels}
      result={result}
      onSubmit={(pairs) => setResult(gradePairs(pairs))}
    />
  );
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};
