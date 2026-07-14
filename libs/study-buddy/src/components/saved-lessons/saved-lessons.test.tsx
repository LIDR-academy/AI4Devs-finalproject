jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useLessons: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({ useLocalization: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: jest.fn() }));

import { useLessons } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { SavedLessons } from './saved-lessons';

const mockUseLessons = useLessons as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'home.openLesson') return `Open ${options?.title}`;
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
  });
});
