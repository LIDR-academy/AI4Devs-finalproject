import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';

import { AnswerOption } from './answer-option';

const meta = {
  title: 'Molecules/AnswerOption',
  component: AnswerOption,
  args: {
    marker: 'A',
    label: 'Chloroplasts capture light energy',
    style: { maxWidth: 480 },
  },
} satisfies Meta<typeof AnswerOption>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selected: Story = {
  args: { state: 'selected' },
};

export const Correct: Story = {
  args: { state: 'correct' },
};

export const Incorrect: Story = {
  args: { marker: 'B', label: 'Mitochondria capture light energy', state: 'incorrect' },
};

const QuizDemo = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const options = [
    'Chloroplasts capture light energy',
    'Mitochondria capture light energy',
    'Ribosomes capture light energy',
  ];
  return (
    <View style={{ gap: 12, maxWidth: 480 }}>
      {options.map((label, i) => (
        <AnswerOption
          key={label}
          marker={String.fromCharCode(65 + i)}
          label={label}
          state={selected === i ? 'selected' : 'default'}
          onPress={() => setSelected(i)}
        />
      ))}
    </View>
  );
};

export const Interactive: Story = {
  render: () => <QuizDemo />,
};
