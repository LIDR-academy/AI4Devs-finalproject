import { render, screen } from '@testing-library/react-native';

import { LESSON_PROGRESS_TEST_ID, LessonProgressIndicator } from './lesson-progress-indicator';

describe('LessonProgressIndicator', () => {
  // @s10 — shows the provided "slide X of N" label and a progress bar.
  it('renders the label and a progress indicator for the current step', async () => {
    await render(<LessonProgressIndicator current={2} total={5} label="Slide 2 of 5" />);

    expect(LESSON_PROGRESS_TEST_ID).toBe('lesson-progress-indicator');
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

  // Mutation — percent = round((current/total)*100); total<=0 → 0.
  it('maps current/total to a 0–100 progress value and treats total 0 as 0%', async () => {
    await render(<LessonProgressIndicator current={2} total={5} label="Slide 2 of 5" />);
    const root = screen.getByTestId(LESSON_PROGRESS_TEST_ID);
    const bar = root.children[0] as { props: { accessibilityValue: { now: number } } };
    expect(bar.props.accessibilityValue.now).toBe(40);

    await render(<LessonProgressIndicator current={1} total={0} label="Slide 0 of 0" />);
    const emptyRoot = screen.getAllByTestId(LESSON_PROGRESS_TEST_ID).at(-1)!;
    const emptyBar = emptyRoot.children[0] as { props: { accessibilityValue: { now: number } } };
    expect(emptyBar.props.accessibilityValue.now).toBe(0);
  });

  // Mutation — root/label StyleSheet tokens must stay applied.
  it('applies stretch root layout and labelMedium on-surface-variant styles', async () => {
    await render(<LessonProgressIndicator current={2} total={5} label="Slide 2 of 5" />);

    const root = screen.getByTestId(LESSON_PROGRESS_TEST_ID);
    expect(root.props.style).toEqual(
      expect.objectContaining({ gap: 8, alignSelf: 'stretch' }),
    );
    expect(screen.getByText('Slide 2 of 5').props.style).toEqual(
      expect.objectContaining({
        fontFamily: 'IBM Plex Sans',
        fontSize: 12,
        color: '#414950',
      }),
    );
  });
});
