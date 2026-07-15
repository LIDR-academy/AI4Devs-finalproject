import { render, screen } from '@testing-library/react-native';

import type { SlideProgressSlide } from '../slide-progress/slide-progress';
import { LESSON_PROGRESS_TEST_ID, LessonProgressIndicator } from './lesson-progress-indicator';

const deck: SlideProgressSlide[] = [
  { type: 'lesson' },
  { type: 'activity' },
  { type: 'lesson' },
  { type: 'activity' },
];

describe('LessonProgressIndicator', () => {
  // @s10 — shows the provided "slide X of N" label and segmented progress.
  it('renders the label and slide segments for the current step', async () => {
    await render(<LessonProgressIndicator slides={deck} current={1} label="Slide 2 of 5" />);

    expect(LESSON_PROGRESS_TEST_ID).toBe('lesson-progress-indicator');
    expect(screen.getByTestId(LESSON_PROGRESS_TEST_ID)).toBeTruthy();
    expect(screen.getByText('Slide 2 of 5')).toBeTruthy();
    expect(screen.getByLabelText('Lesson 1')).toBeTruthy();
    expect(screen.getByLabelText('Activity 2')).toBeTruthy();
  });

  it('renders the final step label on the results slide', async () => {
    await render(<LessonProgressIndicator slides={deck} current={4} label="Slide 5 of 5" />);

    expect(screen.getByText('Slide 5 of 5')).toBeTruthy();
  });

  // @s10/@s20 chrome — progress label exposed to assistive tech (WCAG 4.1.3).
  it('exposes the progress label as a polite live region with an accessible name', async () => {
    await render(<LessonProgressIndicator slides={deck} current={1} label="Slide 2 of 5" />);

    const label = screen.getByText('Slide 2 of 5');
    expect(label.props.accessibilityLiveRegion).toBe('polite');
    expect(label.props.accessibilityLabel).toBe('Slide 2 of 5');
  });

  // Mutation — root/label StyleSheet tokens must stay applied.
  it('applies stretch root layout and labelMedium on-surface-variant styles', async () => {
    await render(<LessonProgressIndicator slides={deck} current={1} label="Slide 2 of 5" />);

    const root = screen.getByTestId(LESSON_PROGRESS_TEST_ID);
    expect(root.props.style).toEqual(expect.objectContaining({ gap: 8, alignSelf: 'stretch' }));
    expect(screen.getByText('Slide 2 of 5').props.style).toEqual(
      expect.objectContaining({
        fontFamily: 'IBM Plex Sans',
        fontSize: 12,
        color: '#414950',
      }),
    );
  });
});
