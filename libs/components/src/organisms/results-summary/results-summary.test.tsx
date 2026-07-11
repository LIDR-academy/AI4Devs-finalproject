import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { RESULTS_LOADING_TEST_ID, ResultsSummary } from './results-summary';

const labels = {
  score: '3 / 3',
  percent: '100%',
  retake: 'Retake activities',
  backToLessons: 'Back to my lessons',
  completeHeadline: 'Lesson complete',
  completeBody: "You've reached the end of this lesson.",
  saveFailed: "We couldn't save this attempt.",
  retrySave: 'Retry',
};

describe('ResultsSummary', () => {
  // @s1 — the score variant renders the pre-formatted score and percent label strings passed
  // in (no numeric props, no self-computed percentage).
  it('renders the pre-formatted score and percent labels for the score variant', async () => {
    await render(
      <ResultsSummary variant="score" labels={labels} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
  });

  // Content state — the retake action renders and calls the given handler when pressed.
  it('calls onRetake when the retake action is pressed', async () => {
    const onRetake = jest.fn();
    await render(
      <ResultsSummary variant="score" labels={labels} onRetake={onRetake} onBackToLessons={jest.fn()} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Retake activities' }));

    expect(onRetake).toHaveBeenCalledTimes(1);
  });

  // Content state — the back-to-lessons action renders and calls the given handler when pressed.
  it('calls onBackToLessons when the back-to-lessons action is pressed', async () => {
    const onBackToLessons = jest.fn();
    await render(
      <ResultsSummary variant="score" labels={labels} onRetake={jest.fn()} onBackToLessons={onBackToLessons} />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Back to my lessons' }));

    expect(onBackToLessons).toHaveBeenCalledTimes(1);
  });

  // @s5 — loading renders the progress indicator and the actions become unavailable until
  // saving resolves.
  it('renders the loading indicator and disables both actions while loading', async () => {
    await render(
      <ResultsSummary variant="score" labels={labels} loading onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(screen.getByTestId(RESULTS_LOADING_TEST_ID)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retake activities', disabled: true })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back to my lessons', disabled: true })).toBeTruthy();
  });

  // Content state — the loading affordance is absent and actions stay enabled outside of
  // `loading` (the score content state).
  it('does not show the loading indicator and keeps actions enabled outside of loading', async () => {
    await render(<ResultsSummary variant="score" labels={labels} onRetake={jest.fn()} onBackToLessons={jest.fn()} />);

    expect(screen.queryByTestId(RESULTS_LOADING_TEST_ID)).toBeNull();
    expect(screen.getByRole('button', { name: 'Retake activities', disabled: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back to my lessons', disabled: false })).toBeTruthy();
  });

  // @s8 / @s9 — the completion variant shows the completion message instead of a score, and
  // still offers both actions (@s10).
  it('renders the completion headline and body for the completion variant, with no score', async () => {
    await render(
      <ResultsSummary variant="completion" labels={labels} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(screen.getByText('Lesson complete')).toBeTruthy();
    expect(screen.getByText("You've reached the end of this lesson.")).toBeTruthy();
    expect(screen.queryByText('3 / 3')).toBeNull();
    expect(screen.queryByText('100%')).toBeNull();
    expect(screen.getByRole('button', { name: 'Retake activities' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back to my lessons' })).toBeTruthy();
  });

  // @s7 — a failed save keeps the score visible and shows a non-blocking notice + retry
  // action; the primary actions stay available (loading is false here).
  it('shows the score alongside a non-blocking save-failure notice when saveFailed is true', async () => {
    await render(
      <ResultsSummary
        variant="score"
        labels={labels}
        saveFailed
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
        onRetrySave={jest.fn()}
      />,
    );

    expect(screen.getByText('3 / 3')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText("We couldn't save this attempt.")).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Retake activities', disabled: false })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Back to my lessons', disabled: false })).toBeTruthy();
  });

  // @s7 — the retry action re-attempts the save by calling the given handler when pressed.
  it('calls onRetrySave when the retry action is pressed', async () => {
    const onRetrySave = jest.fn();
    await render(
      <ResultsSummary
        variant="score"
        labels={labels}
        saveFailed
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
        onRetrySave={onRetrySave}
      />,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));

    expect(onRetrySave).toHaveBeenCalledTimes(1);
  });

  // Content state — outside of saveFailed, no notice or retry action renders.
  it('does not show the save-failure notice when saveFailed is false', async () => {
    await render(
      <ResultsSummary variant="score" labels={labels} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(screen.queryByText("We couldn't save this attempt.")).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  // Full-review, Minor 4 — nothing is ever saved for the completion variant (@s8/@s9), so the
  // save-failure notice must never render there even if a caller mistakenly passes saveFailed.
  it('does not show the save-failure notice for the completion variant even if saveFailed is true', async () => {
    await render(
      <ResultsSummary
        variant="completion"
        labels={labels}
        saveFailed
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
        onRetrySave={jest.fn()}
      />,
    );

    expect(screen.queryByText("We couldn't save this attempt.")).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });

  // Full-review, Major 1 — accessibilityLiveRegion is Android/Web-only, so iOS VoiceOver needs
  // the imperative AccessibilityInfo call fired directly when saveFailed is set (mirrors
  // LoginForm's errorMessage announcement, WCAG 4.1.3).
  it('announces the save-failure notice via AccessibilityInfo when saveFailed is set', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <ResultsSummary
        variant="score"
        labels={labels}
        saveFailed
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
        onRetrySave={jest.fn()}
      />,
    );

    expect(announceSpy).toHaveBeenCalledWith("We couldn't save this attempt.");

    announceSpy.mockRestore();
  });

  // Full-review, Major 1 + Minor 4 — the announcement must respect the same variant guard as
  // the visual notice: nothing is ever saved for the completion variant, so it must never
  // announce a save failure there either.
  it('does not announce a save-failure notice for the completion variant even if saveFailed is true', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <ResultsSummary
        variant="completion"
        labels={labels}
        saveFailed
        onRetake={jest.fn()}
        onBackToLessons={jest.fn()}
        onRetrySave={jest.fn()}
      />,
    );

    expect(announceSpy).not.toHaveBeenCalled();

    announceSpy.mockRestore();
  });

  // @s13 — the score becoming final (loading resolves) is a state change that must be
  // announced to assistive tech, the same iOS-parity need as the save-failure notice.
  it('announces the score via AccessibilityInfo when loading resolves for the score variant', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(
      <ResultsSummary variant="score" labels={labels} loading onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <ResultsSummary variant="score" labels={labels} loading={false} onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
      );
    });

    expect(announceSpy).toHaveBeenCalledWith('3 / 3, 100%');

    announceSpy.mockRestore();
  });

  // @s13 — the same loading→content state change applies to the completion variant: once
  // saving resolves, the completion headline is announced (nothing renders differently for
  // the completion variant, so this also relies on the imperative call).
  it('announces the completion headline via AccessibilityInfo when loading resolves for the completion variant', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(
      <ResultsSummary variant="completion" labels={labels} loading onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <ResultsSummary
          variant="completion"
          labels={labels}
          loading={false}
          onRetake={jest.fn()}
          onBackToLessons={jest.fn()}
        />,
      );
    });

    expect(announceSpy).toHaveBeenCalledWith('Lesson complete');

    announceSpy.mockRestore();
  });

  // Full-review, Minor 6 — onRetrySave is documented as required whenever saveFailed is true,
  // but nothing statically enforces it; guard the runtime contract by never rendering a retry
  // action that would have no handler to call.
  it('does not render the retry action when onRetrySave is omitted even though saveFailed is true', async () => {
    await render(
      <ResultsSummary variant="score" labels={labels} saveFailed onRetake={jest.fn()} onBackToLessons={jest.fn()} />,
    );

    expect(screen.getByText("We couldn't save this attempt.")).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });
});
