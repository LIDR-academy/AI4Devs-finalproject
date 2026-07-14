jest.mock('@helsoft/activities', () => ({
  FillInTheBlank: ({ initialAnswer }: { initialAnswer?: { submittedAnswer?: string } | null }) => {
    const { Text } = require('react-native');
    return <Text testID="organism-fitb-initial">{initialAnswer?.submittedAnswer ?? 'none'}</Text>;
  },
}));

import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';
import { render, screen } from '@testing-library/react-native';

import { FillInTheBlankActivity } from './fill-in-the-blank-activity';

const slide: FillInTheBlankSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Blank',
  content: 'The capital is ____',
  position: 0,
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  acceptedAnswers: ['Paris'],
};

const answer: FillInTheBlankAnswer = {
  slideId: 'slide-1',
  activityType: 'fill-in-the-blank',
  submittedAnswer: 'Paris',
  acceptedAnswerShown: 'Paris',
  isCorrect: true,
};

describe('FillInTheBlankActivity', () => {
  // @s12 — wrapper forwards restore prop to the organism.
  it('forwards initialAnswer to the FillInTheBlank organism', async () => {
    await render(<FillInTheBlankActivity slide={slide} initialAnswer={answer} />);

    expect(screen.getByTestId('organism-fitb-initial').props.children).toBe('Paris');
  });
});
