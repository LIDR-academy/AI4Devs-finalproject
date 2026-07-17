jest.mock('@helsoft/activities', () => ({
  Matching: ({ initialAnswer }: { initialAnswer?: { isCorrect?: boolean } | null }) => {
    const { Text } = require('react-native');
    return (
      <Text testID="organism-matching-initial">
        {initialAnswer ? String(initialAnswer.isCorrect) : 'none'}
      </Text>
    );
  },
}));

import type { MatchingAnswer, MatchingSlide } from '@helsoft/types';
import { render, screen } from '@testing-library/react-native';

import { MatchingActivity } from './matching-activity';

const slide: MatchingSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Match',
  content: 'Match the pairs',
  position: 0,
  kind: 'activity',
  activityType: 'matching',
  leftItems: [{ id: 'l1', label: 'FR' }],
  rightItems: [{ id: 'r1', label: 'Paris' }],
  correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
};

const answer: MatchingAnswer = {
  slideId: 'slide-1',
  activityType: 'matching',
  pairs: [{ leftId: 'l1', rightId: 'r1', isCorrect: true }],
  correctPairCount: 1,
  totalPairCount: 1,
  isCorrect: true,
};

describe('MatchingActivity', () => {
  // @s12 — wrapper forwards restore prop to the organism.
  it('forwards initialAnswer to the Matching organism', async () => {
    await render(<MatchingActivity slide={slide} initialAnswer={answer} />);

    expect(screen.getByTestId('organism-matching-initial').props.children).toBe('true');
  });
});
