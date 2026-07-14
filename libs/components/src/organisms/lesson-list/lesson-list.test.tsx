import { fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { LESSON_LIST_LOADING_TEST_ID, LessonList } from './lesson-list';

const labels = {
  loading: 'Loading saved lessons…',
  empty: 'No saved lessons yet.',
  error: "We couldn't load your lessons.",
  retry: 'Try again',
};

const lessons = [
  {
    id: 'lesson-2',
    title: 'Newer lesson',
    createdDateLabel: 'Jul 13, 2026',
    openAccessibilityLabel: 'Open Newer lesson',
  },
  {
    id: 'lesson-1',
    title: 'Older lesson',
    createdDateLabel: 'Jul 10, 2026',
    openAccessibilityLabel: 'Open Older lesson',
  },
];

describe('LessonList', () => {
  // @s13 — loading shows a progress indicator until lessons resolve.
  it('renders the loading indicator while state is loading', async () => {
    await render(
      <LessonList
        state="loading"
        lessons={[]}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByTestId(LESSON_LIST_LOADING_TEST_ID)).toBeTruthy();
  });

  // Slice-2 reviewer_slice — match ApiKeyForm: wrapper = testID only; ProgressIndicator owns
  // progressbar; polite live-region Text (visuallyHidden) carries the loading label.
  it('renders a polite visually-hidden live-region loading label beside the spinner', async () => {
    await render(
      <LessonList
        state="loading"
        lessons={[]}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    const loadingText = screen.getByText(labels.loading);
    expect(loadingText.props.accessibilityLiveRegion).toBe('polite');
    expect(loadingText).toHaveStyle({
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
    });
    expect(screen.getByTestId(LESSON_LIST_LOADING_TEST_ID).props.accessibilityRole).toBeUndefined();
  });

  // @s4 — content lists every lesson with title + created-date label in received order.
  it('renders each lesson title and created-date label in received order', async () => {
    await render(
      <LessonList
        state="content"
        lessons={lessons}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText('Newer lesson')).toBeTruthy();
    expect(screen.getByText('Jul 13, 2026')).toBeTruthy();
    expect(screen.getByText('Older lesson')).toBeTruthy();
    expect(screen.getByText('Jul 10, 2026')).toBeTruthy();
  });

  // @s4/@s6 — open action forwards the lesson id.
  it('calls onOpenLesson with the lesson id when an item is pressed', async () => {
    const onOpenLesson = jest.fn();
    await render(
      <LessonList
        state="content"
        lessons={lessons}
        labels={labels}
        onOpenLesson={onOpenLesson}
        onRetry={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Open Newer lesson' }));

    expect(onOpenLesson).toHaveBeenCalledWith('lesson-2');
  });

  // @s5 — empty invites creating a lesson; no list rows.
  it('renders the empty-state message when state is empty', async () => {
    await render(
      <LessonList
        state="empty"
        lessons={[]}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText('No saved lessons yet.')).toBeTruthy();
    expect(screen.queryByText('Newer lesson')).toBeNull();
  });

  // @s14 — error shows message + retry action.
  it('renders the error message and calls onRetry when retry is pressed', async () => {
    const onRetry = jest.fn();
    await render(
      <LessonList
        state="error"
        lessons={[]}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("We couldn't load your lessons.")).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // @s16 — loading / empty / error announced to assistive tech (WCAG 4.1.3).
  it('announces loading, empty, and error states via AccessibilityInfo', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});

    await render(
      <LessonList
        state="loading"
        lessons={[]}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(announceSpy).toHaveBeenCalledWith('Loading saved lessons…');

    announceSpy.mockClear();
    await render(
      <LessonList
        state="empty"
        lessons={[]}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(announceSpy).toHaveBeenCalledWith('No saved lessons yet.');

    announceSpy.mockClear();
    await render(
      <LessonList
        state="error"
        lessons={[]}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );
    expect(announceSpy).toHaveBeenCalledWith("We couldn't load your lessons.");

    announceSpy.mockRestore();
  });

  // @s16 — each lesson exposes an accessible name for the open action.
  it('exposes an accessible open action name per lesson', async () => {
    await render(
      <LessonList
        state="content"
        lessons={lessons}
        labels={labels}
        onOpenLesson={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Open Newer lesson' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open Older lesson' })).toBeTruthy();
  });
});
