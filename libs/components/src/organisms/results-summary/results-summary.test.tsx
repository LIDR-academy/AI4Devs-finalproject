import { fireEvent, render, screen } from '@testing-library/react-native';

import { RESULTS_LOADING_TEST_ID, ResultsSummary } from './results-summary';

const labels = {
  score: '3 / 3',
  percent: '100%',
  retake: 'Retake activities',
  backToLessons: 'Back to my lessons',
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
});
