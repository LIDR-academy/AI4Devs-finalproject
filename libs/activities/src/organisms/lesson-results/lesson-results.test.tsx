jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useLessonAttempt: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));
jest.mock('@helsoft/components', () => {
  const actual = jest.requireActual('@helsoft/components');
  return { ...actual, ResultsSummary: jest.fn(actual.ResultsSummary) };
});

import { RESULTS_LOADING_TEST_ID, ResultsSummary } from '@helsoft/components';
import { useLessonAttempt } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import type { Lesson } from '@helsoft/types';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { LessonResults, toScorableSlides } from './lesson-results';

const mockUseLessonAttempt = useLessonAttempt as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockResultsSummary = ResultsSummary as jest.Mock;

// Mimics the real `results.*` i18next templates so assertions can pin the exact rendered text.
const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'results.score') return `${options?.correct} / ${options?.total}`;
  if (key === 'results.scorePercent') return `${options?.percent}%`;
  if (key === 'results.retake') return 'Retake activities';
  if (key === 'results.backHome') return 'Back to my lessons';
  if (key === 'results.completeHeadline') return 'Lesson complete';
  if (key === 'results.completeBody') return "You've reached the end of this lesson.";
  if (key === 'results.saveFailed') return "Couldn't save this attempt";
  if (key === 'results.retrySave') return 'Try again';
  if (key === 'results.scoreAnnouncement') return `${options?.score}, ${options?.percent}`;
  return key;
};

const localizationValue = () => ({
  t,
  locale: 'en' as const,
  setLocale: jest.fn(),
  supportedLocales: ['en'] as const,
});

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

// @s8 — an instructional-only lesson has nothing system-checked (scoreLesson returns
// isScorable: false), driving the completion variant instead of a score.
const instructionalOnlyLesson: Lesson = {
  id: 'lesson-2',
  userId: 'user-1',
  title: 'Intro to Capitals',
  createdAt: '2026-07-11T00:00:00.000Z',
  slides: [
    {
      id: 'slide-1',
      lessonId: 'lesson-2',
      title: 'Intro',
      content: 'Welcome!',
      position: 0,
      kind: 'instructional',
    },
  ],
};

// Mutation-kill fixture — a deck mixing an instructional slide with activity slides, used to
// pin that `toScorableSlides` projects only the activity slides (an instructional slide has no
// `activityType`, so it must never reach `scoreLesson`'s input).
const mixedDeckLesson: Lesson = {
  id: 'lesson-3',
  userId: 'user-1',
  title: 'Mixed deck',
  createdAt: '2026-07-11T00:00:00.000Z',
  slides: [
    {
      id: 'slide-intro',
      lessonId: 'lesson-3',
      title: 'Intro',
      content: 'Welcome!',
      position: 0,
      kind: 'instructional',
    },
    {
      id: 'slide-a',
      lessonId: 'lesson-3',
      title: 'Q1',
      content: 'What is the capital of Italy?',
      position: 1,
      kind: 'activity',
      activityType: 'multiple-choice',
      options: [{ id: 'opt-a', label: 'Rome' }],
      correctOptionId: 'opt-a',
    },
  ],
};

describe('toScorableSlides', () => {
  // Mutation-kill — the projection must keep only activity slides: an instructional slide has
  // no `activityType`, so it must never appear in the array fed to `scoreLesson`.
  it('excludes instructional slides, keeping only activity slides in the projection', () => {
    expect(toScorableSlides(mixedDeckLesson)).toEqual([
      { id: 'slide-a', activityType: 'multiple-choice' },
    ]);
  });
});

describe('LessonResults', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s1 — a scorable lesson renders the pre-formatted score + percentage via ResultsSummary.
  it('renders the pre-formatted score and percentage for a scorable lesson', async () => {
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
  });

  // @s5 — while the attempt is saving, the loading state shows.
  it('shows the loading state while useLessonAttempt().status is saving', async () => {
    mockUseLessonAttempt.mockReturnValue({
      status: 'saving',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(screen.getByTestId(RESULTS_LOADING_TEST_ID)).toBeTruthy();
  });

  // Content state — outside of "saving", no loading affordance shows.
  it('does not show the loading state when useLessonAttempt().status is idle', async () => {
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(screen.queryByTestId(RESULTS_LOADING_TEST_ID)).toBeNull();
  });

  // @s6 — completion (mount, for a scorable lesson) calls saveAttempt exactly once with the
  // computed score/total and the lesson's id.
  it('calls saveAttempt exactly once on mount with the computed score, total, and lessonId', async () => {
    const saveAttempt = jest.fn();
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt,
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(saveAttempt).toHaveBeenCalledTimes(1);
    expect(saveAttempt).toHaveBeenCalledWith({ lessonId: 'lesson-1', score: 3, total: 3 });
  });

  // @s21 feed — persistOnMount false skips save (deck already saved this session).
  it('does not call saveAttempt when persistOnMount is false', async () => {
    const saveAttempt = jest.fn();
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt,
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
        persistOnMount={false}
      />,
    );

    expect(saveAttempt).not.toHaveBeenCalled();
  });

  // @s6 — a re-render (e.g. a parent state change, not a remount) does not double-save.
  it('does not call saveAttempt again on a re-render with the same lesson/answers', async () => {
    const saveAttempt = jest.fn();
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt,
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    const { rerender } = await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );
    await act(async () => {
      rerender(
        <LessonResults
          lesson={scorableLesson}
          answers={allCorrectAnswers}
          onRetake={jest.fn()}
          onBackToLessons={jest.fn()}
        />,
      );
    });

    expect(saveAttempt).toHaveBeenCalledTimes(1);
  });

  // @s8 — an instructional-only lesson (isScorable: false) renders the completion variant
  // and never calls saveAttempt (no attempt record is created). The same isScorable: false
  // branch also drives @s9 (a deck with only flashcard/open-ended slides) — already proven at
  // the scoreLesson level (score-lesson.test.ts); Lesson/Slide has no flashcard/open-ended
  // payload yet, so this component test exercises the shared branch via the instructional case.
  it('renders the completion variant and never calls saveAttempt for an instructional-only lesson', async () => {
    const saveAttempt = jest.fn();
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt,
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={instructionalOnlyLesson}
        answers={[]}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(screen.getByText('Lesson complete')).toBeTruthy();
    expect(screen.getByText("You've reached the end of this lesson.")).toBeTruthy();
    expect(screen.queryByText('0 / 0')).toBeNull();
    expect(saveAttempt).not.toHaveBeenCalled();
  });

  // Mutation-kill — pins the exact `variant` string passed to `ResultsSummary` (its declared
  // `ResultsSummaryVariant` type is exactly `'score' | 'completion'`, so any other literal would
  // be a contract violation even though it happens to render identically today).
  it('passes the exact "completion" variant string to ResultsSummary for an instructional-only lesson', async () => {
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={instructionalOnlyLesson}
        answers={[]}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(mockResultsSummary).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'completion' }),
      undefined,
    );
  });

  // Mutation-kill — same pin for the "score" variant, for a scorable lesson.
  it('passes the exact "score" variant string to ResultsSummary for a scorable lesson', async () => {
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(mockResultsSummary).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'score' }),
      undefined,
    );
  });

  // @s7 — a failed save keeps the score visible and shows the non-blocking save-failure
  // notice, bound to the hook's "error" status.
  it('shows the score alongside the save-failure notice when useLessonAttempt().status is error', async () => {
    mockUseLessonAttempt.mockReturnValue({
      status: 'error',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText("Couldn't save this attempt")).toBeTruthy();
  });

  // @s7 — the retry action re-invokes the hook's retry() to re-attempt the failed save.
  it('calls the hook retry() when the retry action is pressed', async () => {
    const retry = jest.fn();
    mockUseLessonAttempt.mockReturnValue({
      status: 'error',
      attempt: null,
      saveAttempt: jest.fn(),
      retry,
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  // @s11 — the retake action, threaded through from ResultsSummary, calls the given onRetake
  // handler (the app route binds this to the retake navigation, task-9 Notes).
  it('calls onRetake when the retake action is pressed for a scorable lesson', async () => {
    const onRetake = jest.fn();
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={onRetake}
        onBackToLessons={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByRole('button', { name: 'Retake activities' }));

    expect(onRetake).toHaveBeenCalledTimes(1);
  });

  // @s12 — the completion labels render whatever the active locale's translation returns
  // (distinct marker strings here), proving they are sourced from `t('results.completeHeadline'
  // /'results.completeBody')` rather than hardcoded literals baked into the component.
  it('sources the completion labels from translation keys, not hardcoded literals', async () => {
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    const localizedT = (key: string, options?: Record<string, unknown>) => {
      if (key === 'results.completeHeadline') return 'i18n-marker-complete-headline';
      if (key === 'results.completeBody') return 'i18n-marker-complete-body';
      return t(key, options);
    };
    mockUseLocalization.mockReturnValue({ ...localizationValue(), t: localizedT });

    await render(
      <LessonResults
        lesson={instructionalOnlyLesson}
        answers={[]}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(screen.getByText('i18n-marker-complete-headline')).toBeTruthy();
    expect(screen.getByText('i18n-marker-complete-body')).toBeTruthy();
  });

  // @s12 — same proof for the save-failure notice: it renders whatever
  // `t('results.saveFailed'/'results.retrySave')` returns, not a hardcoded literal.
  it('sources the save-failure labels from translation keys, not hardcoded literals', async () => {
    mockUseLessonAttempt.mockReturnValue({
      status: 'error',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    const localizedT = (key: string, options?: Record<string, unknown>) => {
      if (key === 'results.saveFailed') return 'i18n-marker-save-failed';
      if (key === 'results.retrySave') return 'i18n-marker-retry-save';
      return t(key, options);
    };
    mockUseLocalization.mockReturnValue({ ...localizationValue(), t: localizedT });

    await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );

    expect(screen.getByText('i18n-marker-save-failed')).toBeTruthy();
    expect(screen.getByText('i18n-marker-retry-save')).toBeTruthy();
  });

  // @s10 — the completion variant offers both actions and threads their callbacks through.
  it('calls onRetake and onBackToLessons in the completion state', async () => {
    const onRetake = jest.fn();
    const onBackToLessons = jest.fn();
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(
      <LessonResults
        lesson={instructionalOnlyLesson}
        answers={[]}
        onRetake={onRetake}
        onBackToLessons={onBackToLessons}
      />,
    );
    await act(async () =>
      fireEvent.press(screen.getByRole('button', { name: 'Retake activities' })),
    );
    await act(async () =>
      fireEvent.press(screen.getByRole('button', { name: 'Back to my lessons' })),
    );

    expect(onRetake).toHaveBeenCalledTimes(1);
    expect(onBackToLessons).toHaveBeenCalledTimes(1);
  });

  // Slice-3 review round 1, Finding 2 — the announcement handed to ResultsSummary must be a
  // single pre-joined, localized string sourced from `t('results.scoreAnnouncement', …)`, not
  // composed inside the presentational organism from `labels.score`/`labels.percent`.
  it('announces the composed score label via t(results.scoreAnnouncement) once saving resolves', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    mockUseLessonAttempt.mockReturnValue({
      status: 'saving',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    mockUseLocalization.mockReturnValue(localizationValue());

    const { rerender } = await render(
      <LessonResults
        lesson={scorableLesson}
        answers={allCorrectAnswers}
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
      />,
    );
    mockUseLessonAttempt.mockReturnValue({
      status: 'idle',
      attempt: null,
      saveAttempt: jest.fn(),
      retry: jest.fn(),
    });
    await act(async () => {
      rerender(
        <LessonResults
          lesson={scorableLesson}
          answers={allCorrectAnswers}
          onRetake={jest.fn()}
          onBackToLessons={jest.fn()}
        />,
      );
    });

    expect(announceSpy).toHaveBeenCalledWith('3 / 3, 100%');

    announceSpy.mockRestore();
  });
});
