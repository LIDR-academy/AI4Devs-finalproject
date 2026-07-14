jest.mock('../slide-image/slide-image', () => ({
  SlideImage: () => null,
}));
jest.mock('../multiple-choice-activity/multiple-choice-activity', () => ({
  MultipleChoiceActivity: ({ slide }: { slide: { content: string } }) => {
    const { Text } = require('react-native');
    return <Text testID="activity-multiple-choice">{slide.content}</Text>;
  },
}));
jest.mock('../fill-in-the-blank-activity/fill-in-the-blank-activity', () => ({
  FillInTheBlankActivity: ({ slide }: { slide: { content: string } }) => {
    const { Text } = require('react-native');
    return <Text testID="activity-fill-in-the-blank">{slide.content}</Text>;
  },
}));
jest.mock('../matching-activity/matching-activity', () => ({
  MatchingActivity: ({ slide }: { slide: { content: string } }) => {
    const { Text } = require('react-native');
    return <Text testID="activity-matching">{slide.content}</Text>;
  },
}));
jest.mock('../flashcard-activity/flashcard-activity', () => ({
  FlashcardActivity: ({ slide }: { slide: { content: string } }) => {
    const { Text } = require('react-native');
    return <Text testID="activity-flashcard">{slide.content}</Text>;
  },
}));
jest.mock('../open-ended-activity/open-ended-activity', () => ({
  OpenEndedActivity: ({ slide }: { slide: { content: string } }) => {
    const { Text } = require('react-native');
    return <Text testID="activity-open-ended">{slide.content}</Text>;
  },
}));

import type {
  FillInTheBlankSlide,
  FlashcardSlide,
  InstructionalSlide,
  MatchingSlide,
  MultipleChoiceSlide,
  OpenEndedSlide,
} from '@helsoft/types';
import { render, screen } from '@testing-library/react-native';

import { SlideView } from './slide-view';

const instructional: InstructionalSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Photosynthesis',
  content: 'Plants convert light into energy.',
  position: 0,
  kind: 'instructional',
};

const multipleChoice: MultipleChoiceSlide = {
  id: 'slide-2',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'What is the capital of France?',
  position: 1,
  kind: 'activity',
  activityType: 'multiple-choice',
  options: [
    { id: 'opt-a', label: 'Paris' },
    { id: 'opt-b', label: 'Berlin' },
  ],
  correctOptionId: 'opt-a',
};

const fillBlank: FillInTheBlankSlide = {
  id: 'slide-3',
  lessonId: 'lesson-1',
  title: 'Blank',
  content: 'The capital is ____',
  position: 2,
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  acceptedAnswers: ['Paris'],
};

const matching: MatchingSlide = {
  id: 'slide-4',
  lessonId: 'lesson-1',
  title: 'Match',
  content: 'Match the pairs',
  position: 3,
  kind: 'activity',
  activityType: 'matching',
  leftItems: [{ id: 'l1', label: 'FR' }],
  rightItems: [{ id: 'r1', label: 'Paris' }],
  correctPairs: [{ leftId: 'l1', rightId: 'r1' }],
};

const flashcard: FlashcardSlide = {
  id: 'slide-5',
  lessonId: 'lesson-1',
  title: 'Card',
  content: 'Front prompt',
  position: 4,
  kind: 'activity',
  activityType: 'flashcard',
  back: 'Back answer',
};

const openEnded: OpenEndedSlide = {
  id: 'slide-6',
  lessonId: 'lesson-1',
  title: 'Essay',
  content: 'Explain photosynthesis',
  position: 5,
  kind: 'activity',
  activityType: 'open-ended',
  modelAnswer: 'Light to energy',
};

describe('SlideView', () => {
  // @s5 — instructional shows title + content text.
  it('renders an instructional slide title and content', async () => {
    await render(<SlideView slide={instructional} />);

    expect(screen.getByText('Photosynthesis')).toBeTruthy();
    expect(screen.getByText('Plants convert light into energy.')).toBeTruthy();
  });

  // @s6 — each activity type renders its wrapper with the prompt.
  it.each([
    ['multiple-choice', multipleChoice, 'activity-multiple-choice'],
    ['fill-in-the-blank', fillBlank, 'activity-fill-in-the-blank'],
    ['matching', matching, 'activity-matching'],
    ['flashcard', flashcard, 'activity-flashcard'],
    ['open-ended', openEnded, 'activity-open-ended'],
  ] as const)('renders the %s activity wrapper with its prompt', async (_type, slide, testId) => {
    await render(<SlideView slide={slide} />);

    expect(screen.getByText(slide.title)).toBeTruthy();
    expect(screen.getByTestId(testId)).toBeTruthy();
    expect(screen.getByText(slide.content)).toBeTruthy();
  });
});
