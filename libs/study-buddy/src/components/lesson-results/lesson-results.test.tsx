jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useLessonAttempt: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import type { Lesson } from '@helsoft/types';
import { useLessonAttempt } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, render, screen } from '@testing-library/react-native';

import { RESULTS_LOADING_TEST_ID } from '@helsoft/components';

import { LessonResults } from './lesson-results';

const mockUseLessonAttempt = useLessonAttempt as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;

// Mimics the real `results.score` / `results.scorePercent` i18next templates
// ("{{correct}} / {{total}}" and "{{percent}}%") so assertions can pin the exact rendered text.
const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'results.score') return `${options?.correct} / ${options?.total}`;
  if (key === 'results.scorePercent') return `${options?.percent}%`;
  if (key === 'results.retake') return 'Retake activities';
  if (key === 'results.backHome') return 'Back to my lessons';
  return key;
};

const localizationValue = () => ({ t, locale: 'en' as const, setLocale: jest.fn(), supportedLocales: ['en'] as const });

const scorableLesson: Lesson = {
  id: 'lesson-1',
  userId: 'user-1',
  title: 'Capitals',
  createdAt: '2026-07-11T00:00:00.000Z',
  slides: [
    {
      id: 'slide-1',
      lessonId: 'lesson-1',
      title: 'Q1',
      content: 'What is the capital of France?',
      position: 0,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [{ id: 'opt-a', label: 'Paris' }],
      correctOptionId: 'opt-a',
    },
    {
      id: 'slide-2',
      lessonId: 'lesson-1',
      title: 'Q2',
      content: 'What is the capital of Germany?',
      position: 1,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [{ id: 'opt-a', label: 'Berlin' }],
      correctOptionId: 'opt-a',
    },
    {
      id: 'slide-3',
      lessonId: 'lesson-1',
      title: 'Q3',
      content: 'What is the capital of Spain?',
      position: 2,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [{ id: 'opt-a', label: 'Madrid' }],
      correctOptionId: 'opt-a',
    },
  ],
};

const allCorrectAnswers = [
  { slideId: 'slide-1', activityType: 'multiple-choice' as const, isCorrect: true },
  { slideId: 'slide-2', activityType: 'multiple-choice' as const, isCorrect: true },
  { slideId: 'slide-3', activityType: 'multiple-choice' as const, isCorrect: true },
];

describe('LessonResults', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s1 — a scorable lesson renders the pre-formatted score + percentage via ResultsSummary.
  it('renders the pre-formatted score and percentage for a scorable lesson', async () => {
    mockUseLessonAttempt.mockReturnValue({ status: 'idle', attempt: null, saveAttempt: jest.fn(), retry: jest.fn() });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults lesson={scorableLesson} answers={allCorrectAnswers} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
  });

  // @s5 — while the attempt is saving, the loading state shows.
  it('shows the loading state while useLessonAttempt().status is saving', async () => {
    mockUseLessonAttempt.mockReturnValue({ status: 'saving', attempt: null, saveAttempt: jest.fn(), retry: jest.fn() });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults lesson={scorableLesson} answers={allCorrectAnswers} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(screen.getByTestId(RESULTS_LOADING_TEST_ID)).toBeTruthy();
  });

  // Content state — outside of "saving", no loading affordance shows.
  it('does not show the loading state when useLessonAttempt().status is idle', async () => {
    mockUseLessonAttempt.mockReturnValue({ status: 'idle', attempt: null, saveAttempt: jest.fn(), retry: jest.fn() });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults lesson={scorableLesson} answers={allCorrectAnswers} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(screen.queryByTestId(RESULTS_LOADING_TEST_ID)).toBeNull();
  });

  // @s6 — completion (mount, for a scorable lesson) calls saveAttempt exactly once with the
  // computed score/total and the lesson's id.
  it('calls saveAttempt exactly once on mount with the computed score, total, and lessonId', async () => {
    const saveAttempt = jest.fn();
    mockUseLessonAttempt.mockReturnValue({ status: 'idle', attempt: null, saveAttempt, retry: jest.fn() });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults lesson={scorableLesson} answers={allCorrectAnswers} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(saveAttempt).toHaveBeenCalledTimes(1);
    expect(saveAttempt).toHaveBeenCalledWith({ lessonId: 'lesson-1', score: 3, total: 3 });
  });

  // @s6 — a re-render (e.g. a parent state change, not a remount) does not double-save.
  it('does not call saveAttempt again on a re-render with the same lesson/answers', async () => {
    const saveAttempt = jest.fn();
    mockUseLessonAttempt.mockReturnValue({ status: 'idle', attempt: null, saveAttempt, retry: jest.fn() });
    mockUseLocalization.mockReturnValue(localizationValue());

    const { rerender } = await render(
      <LessonResults lesson={scorableLesson} answers={allCorrectAnswers} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );
    await act(async () => {
      rerender(
        <LessonResults lesson={scorableLesson} answers={allCorrectAnswers} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
      );
    });

    expect(saveAttempt).toHaveBeenCalledTimes(1);
  });
});
