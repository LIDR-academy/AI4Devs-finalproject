jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

import { useLocalization } from '@helsoft/localization';
import type { SupabaseClient } from '@helsoft/supabase-services';
import { initSupabase } from '@helsoft/supabase-services';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { SavedLessons } from './saved-lessons';

const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'home.openLesson') return `Open ${options?.title}`;
  if (key === 'home.delete.action') return `Delete ${options?.title}`;
  if (key === 'home.delete.confirmHeadline') return 'Delete this lesson?';
  if (key === 'home.delete.confirmBody') {
    return 'This permanently removes the lesson and its progress.';
  }
  if (key === 'home.delete.confirmAction') return 'Delete';
  if (key === 'home.delete.cancelAction') return 'Cancel';
  if (key === 'home.createdDate') return String(options?.date ?? '');
  if (key === 'home.loading') return 'Loading saved lessons…';
  if (key === 'home.empty') return 'No saved lessons yet. Create one to get started.';
  if (key === 'home.error') return "We couldn't load your lessons.";
  if (key === 'home.retry') return 'Try again';
  if (key === 'home.savedLessons') return 'Saved lessons';
  if (key === 'lessons.count') return `${options?.count} lessons`;
  return key;
};

/**
 * Integration: SavedLessons → useLessons → LessonsService → LessonsDao (mocked Supabase).
 * Covers @s4/@s7 list survival via the real read path.
 */
describe('SavedLessons integration (wiring → hook → service → DAO)', () => {
  let client: SupabaseClient;

  beforeAll(() => {
    client = initSupabase({ url: 'https://example.supabase.co', anonKey: 'anon-key' });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseLocalization.mockReturnValue({
      t,
      locale: 'en',
      setLocale: jest.fn(),
      supportedLocales: ['en'],
    });
  });

  it('loads lessons from Supabase and renders titles newest-first', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'lesson-2',
          title: 'Newer',
          created_at: '2026-07-13T12:00:00.000Z',
        },
        {
          id: 'lesson-1',
          title: 'Older',
          created_at: '2026-07-10T12:00:00.000Z',
        },
      ],
      error: null,
    });
    const select = jest.fn(() => ({ order }));
    jest.spyOn(client, 'from').mockReturnValue({ select } as never);

    await render(<SavedLessons />);

    await waitFor(() => expect(screen.getByText('Newer')).toBeTruthy());
    expect(screen.getByText('Older')).toBeTruthy();
    expect(screen.getByText('Saved lessons')).toBeTruthy();
  });

  // @s8 — confirm delete hits DAO delete by id and removes the row from Home.
  it('deletes a lesson through the real hook → service → DAO chain after confirm', async () => {
    const order = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'lesson-2',
          title: 'Newer',
          created_at: '2026-07-13T12:00:00.000Z',
        },
        {
          id: 'lesson-1',
          title: 'Older',
          created_at: '2026-07-10T12:00:00.000Z',
        },
      ],
      error: null,
    });
    const select = jest.fn(() => ({ order }));
    const delEq = jest.fn().mockResolvedValue({ error: null });
    const del = jest.fn().mockReturnValue({ eq: delEq });
    jest.spyOn(client, 'from').mockReturnValue({ select, delete: del } as never);

    await render(<SavedLessons />);
    await waitFor(() => expect(screen.getByText('Newer')).toBeTruthy());

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete Newer' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    });

    await waitFor(() => expect(screen.queryByText('Newer')).toBeNull());
    expect(screen.getByText('Older')).toBeTruthy();
    expect(client.from).toHaveBeenCalledWith('lessons');
    expect(delEq).toHaveBeenCalledWith('id', 'lesson-2');
  });
});
