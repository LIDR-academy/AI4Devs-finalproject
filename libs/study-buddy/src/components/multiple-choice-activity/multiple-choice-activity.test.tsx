jest.mock('@helsoft/activities', () => ({
  MultipleChoice: ({ initialAnswer }: { initialAnswer?: { selectedOptionId?: string } | null }) => {
    const { Text } = require('react-native');
    return <Text testID="organism-mc-initial">{initialAnswer?.selectedOptionId ?? 'none'}</Text>;
  },
}));

import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';
import { render, screen } from '@testing-library/react-native';

import { MultipleChoiceActivity } from './multiple-choice-activity';

const slide: MultipleChoiceSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'What is the capital of France?',
  position: 0,
  kind: 'activity',
  activityType: 'multiple-choice',
  options: [
    { id: 'opt-a', label: 'Paris' },
    { id: 'opt-b', label: 'Berlin' },
  ],
  correctOptionId: 'opt-a',
};

const answer: MultipleChoiceAnswer = {
  slideId: 'slide-1',
  activityType: 'multiple-choice',
  selectedOptionId: 'opt-a',
  correctOptionId: 'opt-a',
  isCorrect: true,
};

describe('MultipleChoiceActivity', () => {
  // @s12 — wrapper forwards restore prop to the organism.
  it('forwards initialAnswer to the MultipleChoice organism', async () => {
    await render(<MultipleChoiceActivity slide={slide} initialAnswer={answer} />);

    expect(screen.getByTestId('organism-mc-initial').props.children).toBe('opt-a');
  });
});
