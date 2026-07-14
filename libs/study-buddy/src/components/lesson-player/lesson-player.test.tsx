jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));
jest.mock('../slide-view/slide-view', () => ({
  SlideView: ({ slide }: { slide: { title: string; id: string } }) => {
    const { Text } = require('react-native');
    return <Text testID={`slide-${slide.id}`}>{slide.title}</Text>;
  },
}));
jest.mock('../lesson-results/lesson-results', () => ({
  LessonResults: ({
    persistOnMount,
    answers,
  }: {
    persistOnMount?: boolean;
    answers: { slideId: string; isCorrect: boolean }[];
  }) => {
    const { Text, View } = require('react-native');
    return (
      <View testID="lesson-results">
        <Text testID="persist-flag">{persistOnMount ? 'persist' : 'no-persist'}</Text>
        <Text testID="graded-count">{String(answers.length)}</Text>
      </View>
    );
  },
}));

import { useLocalization } from '@helsoft/localization';
import type { Lesson } from '@helsoft/types';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { LESSON_PLAYER_TEST_ID, LessonPlayer } from './lesson-player';

const mockUseLocalization = useLocalization as jest.Mock;

const lesson: Lesson = {
  id: 'lesson-1',
  userId: 'user-1',
  title: 'Capitals',
  createdAt: '2026-07-12T12:00:00.000Z',
  slides: [
    {
      id: 's1',
      lessonId: 'lesson-1',
      title: 'Intro',
      content: 'Welcome',
      position: 0,
      kind: 'instructional',
    },
    {
      id: 's2',
      lessonId: 'lesson-1',
      title: 'Q1',
      content: 'Capital?',
      position: 1,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [
        { id: 'a', label: 'Paris' },
        { id: 'b', label: 'Berlin' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 's3',
      lessonId: 'lesson-1',
      title: 'Q2',
      content: 'Another?',
      position: 2,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [
        { id: 'a', label: 'Yes' },
        { id: 'b', label: 'No' },
      ],
      correctOptionId: 'a',
    },
    {
      id: 's4',
      lessonId: 'lesson-1',
      title: 'Outro',
      content: 'Done teaching',
      position: 3,
      kind: 'instructional',
    },
  ],
};

const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'player.slideOf') return `Slide ${options?.current} of ${options?.total}`;
  if (key === 'player.next') return 'Next';
  if (key === 'player.back') return 'Back';
  if (key === 'player.loading') return 'Loading lesson…';
  return key;
};

const pressNext = async () => {
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Next' }));
  });
};
const pressBack = async () => {
  await act(async () => {
    fireEvent.press(screen.getByRole('button', { name: 'Back' }));
  });
};

describe('LessonPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue({ t }));
  });

  // @s1 — starts on first content slide, exactly one.
  it('starts on the first content slide', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    expect(screen.getByTestId(LESSON_PLAYER_TEST_ID)).toBeTruthy();
    expect(screen.getByTestId('slide-s1')).toBeTruthy();
    expect(screen.queryByTestId('slide-s2')).toBeNull();
    expect(screen.getByText('Slide 1 of 5')).toBeTruthy();
  });

  // @s4 — Back unavailable on first slide.
  it('does not show Back on the first slide', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
  });

  // @s2 — Next advances between content slides.
  it('advances to the next content slide on Next', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    await pressNext();

    expect(screen.getByTestId('slide-s2')).toBeTruthy();
    expect(screen.queryByTestId('slide-s1')).toBeNull();
    expect(screen.getByText('Slide 2 of 5')).toBeTruthy();
  });

  // @s3 — Back returns to previous content slide.
  it('goes back to the preceding content slide', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    await pressNext();
    await pressBack();

    expect(screen.getByTestId('slide-s1')).toBeTruthy();
    expect(screen.getByText('Slide 1 of 5')).toBeTruthy();
  });

  // @s11 — Next never gates on an answer.
  it('allows Next on an unanswered activity slide', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    await pressNext(); // → activity s2
    await pressNext(); // skip unanswered → s3

    expect(screen.getByTestId('slide-s3')).toBeTruthy();
  });

  // @s10 — progress counts results as final step (N = content + 1).
  it('shows slide N of N on the results slide', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    await pressNext();
    await pressNext();
    await pressNext();
    await pressNext(); // → results

    expect(screen.getByText('Slide 5 of 5')).toBeTruthy();
    expect(screen.getByTestId('lesson-results')).toBeTruthy();
  });

  // @s13 — results inline; Next hidden; persist once.
  it('shows results inline with persist on first entry and hides Next', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    for (let i = 0; i < 4; i++) await pressNext();

    expect(screen.getByTestId('lesson-results')).toBeTruthy();
    expect(screen.getByTestId('persist-flag').props.children).toBe('persist');
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
    // @s14 — graded answers for all 2 activity slides (even unanswered).
    expect(screen.getByTestId('graded-count').props.children).toBe('2');
  });

  // @s20 — Back from results returns to last content slide.
  it('returns to the last content slide when going Back from results', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    for (let i = 0; i < 4; i++) await pressNext();
    await pressBack();

    expect(screen.getByTestId('slide-s4')).toBeTruthy();
    expect(screen.queryByTestId('lesson-results')).toBeNull();
  });

  // @s21 — re-entering results does not persist again.
  it('disables persist on re-entry to results in the same session', async () => {
    await render(<LessonPlayer lesson={lesson} onBackToLessons={jest.fn()} />);

    for (let i = 0; i < 4; i++) await pressNext();
    expect(screen.getByTestId('persist-flag').props.children).toBe('persist');

    await pressBack();
    await pressNext();

    expect(screen.getByTestId('lesson-results')).toBeTruthy();
    expect(screen.getByTestId('persist-flag').props.children).toBe('no-persist');
  });
});
