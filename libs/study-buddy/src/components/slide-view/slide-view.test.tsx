jest.mock('../slide-image/slide-image', () => ({
  SlideImage: () => null,
}));
jest.mock('../multiple-choice-activity/multiple-choice-activity', () => ({
  MultipleChoiceActivity: ({
    slide,
    initialAnswer,
  }: {
    slide: { content: string };
    initialAnswer?: { activityType?: string; selectedOptionId?: string } | null;
  }) => {
    const { Text, View } = require('react-native');
    return (
      <View testID="activity-multiple-choice">
        <Text>{slide.content}</Text>
        {initialAnswer ? (
          <Text testID="mc-initial">
            {`${initialAnswer.activityType}:${initialAnswer.selectedOptionId ?? 'none'}`}
          </Text>
        ) : null}
      </View>
    );
  },
}));
jest.mock('../fill-in-the-blank-activity/fill-in-the-blank-activity', () => ({
  FillInTheBlankActivity: ({
    slide,
    initialAnswer,
  }: {
    slide: { content: string };
    initialAnswer?: { submittedAnswer?: string } | null;
  }) => {
    const { Text, View } = require('react-native');
    return (
      <View testID="activity-fill-in-the-blank">
        <Text>{slide.content}</Text>
        {initialAnswer?.submittedAnswer ? (
          <Text testID="fitb-initial">{initialAnswer.submittedAnswer}</Text>
        ) : null}
      </View>
    );
  },
}));
jest.mock('../matching-activity/matching-activity', () => ({
  MatchingActivity: ({
    slide,
    initialAnswer,
  }: {
    slide: { content: string };
    initialAnswer?: { isCorrect?: boolean } | null;
  }) => {
    const { Text, View } = require('react-native');
    return (
      <View testID="activity-matching">
        <Text>{slide.content}</Text>
        {initialAnswer ? (
          <Text testID="matching-initial">{String(initialAnswer.isCorrect)}</Text>
        ) : null}
      </View>
    );
  },
}));
jest.mock('../flashcard-activity/flashcard-activity', () => ({
  FlashcardActivity: ({
    slide,
    initialAnswer,
  }: {
    slide: { content: string };
    initialAnswer?: { recalled?: boolean } | null;
  }) => {
    const { Text, View } = require('react-native');
    return (
      <View testID="activity-flashcard">
        <Text>{slide.content}</Text>
        {initialAnswer ? (
          <Text testID="flashcard-initial">{String(initialAnswer.recalled)}</Text>
        ) : null}
      </View>
    );
  },
}));
jest.mock('../open-ended-activity/open-ended-activity', () => ({
  OpenEndedActivity: ({
    slide,
    initialAnswer,
  }: {
    slide: { content: string };
    initialAnswer?: { activityType?: string; submittedAnswer?: string } | null;
  }) => {
    const { Text, View } = require('react-native');
    return (
      <View testID="activity-open-ended">
        <Text>{slide.content}</Text>
        {initialAnswer ? (
          <Text testID="oe-initial">
            {`${initialAnswer.activityType}:${initialAnswer.submittedAnswer ?? 'none'}`}
          </Text>
        ) : null}
      </View>
    );
  },
}));

import type {
  FillInTheBlankAnswer,
  FillInTheBlankSlide,
  FlashcardAnswer,
  FlashcardSlide,
  InstructionalSlide,
  MatchingAnswer,
  MatchingSlide,
  MultipleChoiceAnswer,
  MultipleChoiceSlide,
  OpenEndedAnswer,
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

  // @s12 — SlideView forwards stored answer to the activity wrapper.
  it('forwards initialAnswer to the multiple-choice wrapper', async () => {
    const answer: MultipleChoiceAnswer = {
      slideId: multipleChoice.id,
      activityType: 'multiple-choice',
      selectedOptionId: 'opt-a',
      correctOptionId: 'opt-a',
      isCorrect: true,
    };
    await render(<SlideView slide={multipleChoice} initialAnswer={answer} />);

    expect(screen.getByTestId('mc-initial').props.children).toBe('multiple-choice:opt-a');
  });

  it('forwards initialAnswer to fill-in-the-blank, matching, flashcard, and open-ended', async () => {
    const fitb: FillInTheBlankAnswer = {
      slideId: fillBlank.id,
      activityType: 'fill-in-the-blank',
      submittedAnswer: 'Paris',
      acceptedAnswerShown: 'Paris',
      isCorrect: true,
    };
    const matchAns: MatchingAnswer = {
      slideId: matching.id,
      activityType: 'matching',
      pairs: [{ leftId: 'l1', rightId: 'r1', isCorrect: true }],
      correctPairCount: 1,
      totalPairCount: 1,
      isCorrect: true,
    };
    const flashAns: FlashcardAnswer = {
      slideId: flashcard.id,
      activityType: 'flashcard',
      recalled: true,
      isCorrect: true,
    };
    const oeAns: OpenEndedAnswer = {
      slideId: openEnded.id,
      activityType: 'open-ended',
      submittedAnswer: 'prior essay',
    };

    await render(<SlideView slide={fillBlank} initialAnswer={fitb} />);
    expect(screen.getByTestId('fitb-initial').props.children).toBe('Paris');

    await render(<SlideView slide={matching} initialAnswer={matchAns} />);
    expect(screen.getByTestId('matching-initial').props.children).toBe('true');

    await render(<SlideView slide={flashcard} initialAnswer={flashAns} />);
    expect(screen.getByTestId('flashcard-initial').props.children).toBe('true');

    await render(<SlideView slide={openEnded} initialAnswer={oeAns} />);
    expect(screen.getByTestId('oe-initial').props.children).toBe('open-ended:prior essay');
  });

  // Mutation — activityType gate must drop mismatched initialAnswer (not `true ? answer`).
  it('does not forward a mismatched activityType initialAnswer to the wrapper', async () => {
    const oeAns: OpenEndedAnswer = {
      slideId: multipleChoice.id,
      activityType: 'open-ended',
      submittedAnswer: 'wrong type',
    };

    await render(<SlideView slide={multipleChoice} initialAnswer={oeAns} />);
    expect(screen.queryByTestId('mc-initial')).toBeNull();

    await render(<SlideView slide={fillBlank} initialAnswer={oeAns} />);
    expect(screen.queryByTestId('fitb-initial')).toBeNull();

    await render(<SlideView slide={matching} initialAnswer={oeAns} />);
    expect(screen.queryByTestId('matching-initial')).toBeNull();

    await render(<SlideView slide={flashcard} initialAnswer={oeAns} />);
    expect(screen.queryByTestId('flashcard-initial')).toBeNull();

    const mcAns: MultipleChoiceAnswer = {
      slideId: openEnded.id,
      activityType: 'multiple-choice',
      selectedOptionId: 'opt-a',
      correctOptionId: 'opt-a',
      isCorrect: true,
    };
    await render(<SlideView slide={openEnded} initialAnswer={mcAns} />);
    expect(screen.queryByTestId('oe-initial')).toBeNull();
  });

  // Mutation — instructional content + root/title styles from StyleSheet.
  it('applies root gap and title/content typography styles on instructional slides', async () => {
    await render(<SlideView slide={instructional} />);

    const title = screen.getByText('Photosynthesis');
    const content = screen.getByText('Plants convert light into energy.');
    expect(title.props.style).toEqual(
      expect.objectContaining({ fontFamily: 'Sora', fontSize: 24, color: '#1c1a17' }),
    );
    expect(content.props.style).toEqual(
      expect.objectContaining({
        fontFamily: 'IBM Plex Sans',
        fontSize: 16,
        color: '#1c1a17',
      }),
    );
    expect(title.parent?.props.style).toEqual(expect.objectContaining({ gap: 12, flex: 1 }));
  });
});
