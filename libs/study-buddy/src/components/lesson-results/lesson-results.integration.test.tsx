jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));

import { render, screen, waitFor } from '@testing-library/react-native';
import { useLocalization } from '@helsoft/localization';
import { initSupabase } from '@helsoft/services';
import type { SupabaseClient } from '@helsoft/services';
import type { Lesson } from '@helsoft/types';

import { LessonResults } from './lesson-results';

const mockUseLocalization = useLocalization as jest.Mock;

// Mimics the real `results.score` / `results.scorePercent` i18next templates so the rendered
// text proves the compute step (scoreLesson) ran, not just that saveAttempt was called.
const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'results.score') return `${options?.correct} / ${options?.total}`;
  if (key === 'results.scorePercent') return `${options?.percent}%`;
  if (key === 'results.retake') return 'Retake activities';
  if (key === 'results.backHome') return 'Back to my lessons';
  return key;
};

const lesson: Lesson = {
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
  ],
};
const answers = [{ slideId: 'slide-1', activityType: 'multiple-choice' as const, isCorrect: true }];

/**
 * Integration (score-results-summary, Slice 1, task-7/@s1/@s6): LessonResults -> the real
 * scoreLesson -> the real useLessonAttempt -> the real LessonAttemptService -> LessonAttemptDao,
 * exercised end-to-end against a mocked Supabase client boundary (only `.from()` is stubbed —
 * nothing above the DAO is mocked). Proves compute-then-persist for a scorable lesson.
 */
describe('LessonResults integration (study-buddy -> hook -> service -> DAO)', () => {
  let client: SupabaseClient;

  beforeAll(() => {
    client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  it('computes the score and persists it via the real hook/service pipeline', async () => {
    const single = jest.fn().mockResolvedValue({
      data: { id: 'attempt-1', lesson_id: 'lesson-1', score: 1, total: 1, created_at: '2026-07-11T00:00:00.000Z' },
      error: null,
    });
    const select = jest.fn(() => ({ single }));
    const insert = jest.fn(() => ({ select }));
    jest.spyOn(client, 'from').mockReturnValue({ insert } as never);
    mockUseLocalization.mockReturnValue({ t, locale: 'en', setLocale: jest.fn(), supportedLocales: ['en'] });

    await render(<LessonResults lesson={lesson} answers={answers} onRetake={jest.fn()} onBackToLessons={jest.fn()} />);

    expect(screen.getByText('1 / 1')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    await waitFor(() => expect(insert).toHaveBeenCalledWith({ lesson_id: 'lesson-1', score: 1, total: 1 }));
  });
});
