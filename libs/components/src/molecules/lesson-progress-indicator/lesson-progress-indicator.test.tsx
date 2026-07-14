import { render, screen } from '@testing-library/react-native';

import { LESSON_PROGRESS_TEST_ID, LessonProgressIndicator } from './lesson-progress-indicator';

describe('LessonProgressIndicator', () => {
  // @s10 — shows the provided "slide X of N" label and a progress bar.
  it('renders the label and a progress indicator for the current step', async () => {
    await render(<LessonProgressIndicator current={2} total={5} label="Slide 2 of 5" />);

    expect(screen.getByTestId(LESSON_PROGRESS_TEST_ID)).toBeTruthy();
    expect(screen.getByText('Slide 2 of 5')).toBeTruthy();
  });

  it('renders the final step label on the results slide', async () => {
    await render(<LessonProgressIndicator current={5} total={5} label="Slide 5 of 5" />);

    expect(screen.getByText('Slide 5 of 5')).toBeTruthy();
  });

  // @s10/@s20 chrome — progress label exposed to assistive tech (WCAG 4.1.3).
  it('exposes the progress label as a polite live region with an accessible name', async () => {
    await render(<LessonProgressIndicator current={2} total={5} label="Slide 2 of 5" />);

    const label = screen.getByText('Slide 2 of 5');
    expect(label.props.accessibilityLiveRegion).toBe('polite');
    expect(label.props.accessibilityLabel).toBe('Slide 2 of 5');
  });
});
