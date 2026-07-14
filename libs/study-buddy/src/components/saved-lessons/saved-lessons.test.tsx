jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useLessons: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

import { useLessons } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { AccessibilityInfo } from 'react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { SavedLessons } from './saved-lessons';

const mockUseLessons = useLessons as jest.Mock;
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
  if (key === 'home.delete.failed') return "We couldn't delete that lesson.";
  if (key === 'home.createdDate') return String(options?.date ?? '');
  if (key === 'home.loading') return 'Loading saved lessons…';
  if (key === 'home.empty') return 'No saved lessons yet. Create one to get started.';
  if (key === 'home.error') return "We couldn't load your lessons.";
  if (key === 'home.retry') return 'Try again';
  if (key === 'home.savedLessons') return 'Saved lessons';
  if (key === 'lessons.count') return `${options?.count} lessons`;
  return key;
};

const lessonsValue = (overrides: Partial<ReturnType<typeof useLessons>> = {}) => ({
  lessons: [],
  isLoading: false,
  error: null,
  refetch: jest.fn(),
  deleteLesson: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe('SavedLessons', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push });
    mockUseLocalization.mockReturnValue(localizationValue({ t, locale: 'en' }));
  });

  // @s13 — loading maps to LessonList loading state.
  it('shows the loading indicator while lessons are loading', async () => {
    mockUseLessons.mockReturnValue(lessonsValue({ isLoading: true }));

    await render(<SavedLessons />);

    expect(screen.getByTestId('lesson-list-loading-indicator')).toBeTruthy();
    // Mutation: t('home.loading') → t("") — live-region must carry the real loading copy.
    expect(screen.getByText('Loading saved lessons…')).toBeTruthy();
    // Mutation: `state === 'content' ?` → true — count must stay hidden while loading.
    expect(screen.queryByText('0 lessons')).toBeNull();
  });

  // @s5 — empty list → empty state copy from t().
  it('shows the empty state when there are no saved lessons', async () => {
    mockUseLessons.mockReturnValue(lessonsValue());

    await render(<SavedLessons />);

    expect(screen.getByText('No saved lessons yet. Create one to get started.')).toBeTruthy();
  });

  // @s4 — content shows title + locale-formatted date; newest-first comes from hook order.
  it('renders lesson titles and formatted created dates from useLessons', async () => {
    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-2',
            title: 'Newer lesson',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
          {
            id: 'lesson-1',
            title: 'Older lesson',
            createdAt: '2026-07-10T12:00:00.000Z',
          },
        ],
      }),
    );

    await render(<SavedLessons />);

    expect(screen.getByText('Newer lesson')).toBeTruthy();
    expect(screen.getByText('Older lesson')).toBeTruthy();
    // en locale medium date for 2026-07-13
    expect(screen.getByText(/Jul(y)?\s*13,?\s*2026/)).toBeTruthy();
  });

  // @s6 — reopen navigates to /lesson/[id] (existing entry, starts from top).
  it('navigates to /lesson/[id] when a lesson is opened', async () => {
    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-42',
            title: 'Capitals',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
        ],
      }),
    );

    await render(<SavedLessons />);
    fireEvent.press(screen.getByRole('button', { name: 'Open Capitals' }));

    expect(push).toHaveBeenCalledWith({
      pathname: '/lesson/[id]',
      params: { id: 'lesson-42' },
    });
  });

  // @s14 — error + retry wired to refetch.
  it('shows error copy and retries via refetch', async () => {
    const refetch = jest.fn();
    mockUseLessons.mockReturnValue(lessonsValue({ error: new Error('network'), refetch }));

    await render(<SavedLessons />);

    expect(screen.getByText("We couldn't load your lessons.")).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  // @s7 — list is driven by useLessons (server-backed); logout/login survival is the hook path.
  it('renders the heading and count from localization', async () => {
    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-1',
            title: 'One',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
        ],
      }),
    );

    await render(<SavedLessons />);

    expect(screen.getByText('Saved lessons')).toBeTruthy();
    expect(screen.getByText('1 lessons')).toBeTruthy();
    // Mutation: `state === 'content' && error` → `||` — no delete banner without an error.
    expect(screen.queryByText("We couldn't delete that lesson.")).toBeNull();
  });

  // @s8 — confirm delete calls useLessons().deleteLesson with the lesson id.
  it('calls deleteLesson when delete is confirmed', async () => {
    const deleteLesson = jest.fn().mockResolvedValue(undefined);
    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-42',
            title: 'Capitals',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
        ],
        deleteLesson,
      }),
    );

    await render(<SavedLessons />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete Capitals' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    });

    expect(deleteLesson).toHaveBeenCalledWith('lesson-42');
  });

  // @s9 — dismiss keeps the lesson; deleteLesson is never called.
  it('does not call deleteLesson when the confirmation is dismissed', async () => {
    const deleteLesson = jest.fn().mockResolvedValue(undefined);
    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-42',
            title: 'Capitals',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
        ],
        deleteLesson,
      }),
    );

    await render(<SavedLessons />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete Capitals' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    });

    expect(deleteLesson).not.toHaveBeenCalled();
  });

  // Failed delete must not become an unhandled rejection (SignOut catch pattern).
  it('does not leave a rejected deleteLesson promise unhandled', async () => {
    const unhandledRejectionSpy = jest.fn();
    process.on('unhandledRejection', unhandledRejectionSpy);

    const deleteLesson = jest.fn().mockRejectedValue(new Error('delete failed'));
    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-42',
            title: 'Capitals',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
        ],
        deleteLesson,
      }),
    );

    await render(<SavedLessons />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete Capitals' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete' }));
    });
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    process.off('unhandledRejection', unhandledRejectionSpy);
    expect(deleteLesson).toHaveBeenCalledWith('lesson-42');
    expect(unhandledRejectionSpy).not.toHaveBeenCalled();
  });

  // Delete failure keeps remaining lessons visible — not the @s14 load-error banner.
  it('keeps the list visible and shows delete failure when deleteLesson rejects', async () => {
    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-42',
            title: 'Capitals',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
          {
            id: 'lesson-7',
            title: 'Flags',
            createdAt: '2026-07-12T12:00:00.000Z',
          },
        ],
        // Hook surfaces delete failure on `error` while keeping lessons (@s8).
        error: new Error('delete failed'),
      }),
    );

    await render(<SavedLessons />);

    expect(screen.getByText('Capitals')).toBeTruthy();
    expect(screen.getByText('Flags')).toBeTruthy();
    expect(screen.queryByText("We couldn't load your lessons.")).toBeNull();
    expect(screen.getByText("We couldn't delete that lesson.")).toBeTruthy();
  });

  // Full-review major [a11y] WCAG 4.1.3 — iOS needs announceForAccessibility (live-region alone insufficient).
  it('announces delete failure via AccessibilityInfo when content shows a delete error', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});

    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-42',
            title: 'Capitals',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
        ],
        error: new Error('delete failed'),
      }),
    );

    await render(<SavedLessons />);

    expect(announceSpy).toHaveBeenCalledWith("We couldn't delete that lesson.");
    announceSpy.mockRestore();
  });

  // Mutation: delete-error banner `state === 'content' && error` → true — hide outside content.
  it('does not show the delete-failure banner while loading or on load error', async () => {
    mockUseLessons.mockReturnValue(
      lessonsValue({ isLoading: true, error: new Error('delete failed') }),
    );
    await render(<SavedLessons />);
    expect(screen.queryByText("We couldn't delete that lesson.")).toBeNull();

    mockUseLessons.mockReturnValue(lessonsValue({ error: new Error('load failed'), lessons: [] }));
    await render(<SavedLessons />);
    expect(screen.queryByText("We couldn't delete that lesson.")).toBeNull();
    expect(screen.getByText("We couldn't load your lessons.")).toBeTruthy();
  });

  // Mutation: confirm i18n keys → "" — dialog copy must use the real home.delete.* strings.
  it('shows localized delete confirmation copy from home.delete.* keys', async () => {
    mockUseLessons.mockReturnValue(
      lessonsValue({
        lessons: [
          {
            id: 'lesson-42',
            title: 'Capitals',
            createdAt: '2026-07-13T12:00:00.000Z',
          },
        ],
      }),
    );

    await render(<SavedLessons />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Delete Capitals' }));
    });

    expect(screen.getByText('Delete this lesson?')).toBeTruthy();
    expect(screen.getByText('This permanently removes the lesson and its progress.')).toBeTruthy();
  });
});
