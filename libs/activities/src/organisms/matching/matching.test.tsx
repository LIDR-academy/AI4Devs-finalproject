import { readFileSync } from 'fs';
import { join } from 'path';

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { layout, lightColors } from '@helsoft/components';

import {
  Matching,
  MatchingItemView,
  MatchingLabels,
  MatchingResult,
} from './matching';

const labels: MatchingLabels = {
  submit: 'Submit',
  correct: 'All correct!',
  incorrect: 'Not quite',
  correctPair: 'correct',
  incorrectPair: 'incorrect',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
};

const leftItems: MatchingItemView[] = [
  { id: 'l1', label: 'France' },
  { id: 'l2', label: 'Germany' },
  { id: 'l3', label: 'Italy' },
];

const rightItems: MatchingItemView[] = [
  { id: 'r1', label: 'Paris' },
  { id: 'r2', label: 'Berlin' },
  { id: 'r3', label: 'Rome' },
];

const defaultProps = {
  prompt: 'Match each country to its capital.',
  leftItems,
  rightItems,
  labels,
  onSubmit: jest.fn(),
};

const allCorrectResult: MatchingResult = {
  pairs: [
    { leftId: 'l1', rightId: 'r1', isCorrect: true },
    { leftId: 'l2', rightId: 'r2', isCorrect: true },
    { leftId: 'l3', rightId: 'r3', isCorrect: true },
  ],
  isCorrect: true,
  summary: '3 of 3 correct',
};

const mixedResult: MatchingResult = {
  pairs: [
    { leftId: 'l1', rightId: 'r1', isCorrect: true },
    { leftId: 'l2', rightId: 'r3', isCorrect: false },
    { leftId: 'l3', rightId: 'r2', isCorrect: false },
  ],
  isCorrect: false,
  summary: '1 of 3 correct',
};

const itemButton = (label: string) => screen.getByRole('button', { name: label });

const submitButton = () => screen.getByRole('button', { name: labels.submit });

const press = async (label: string) => {
  await act(async () => {
    fireEvent.press(itemButton(label));
  });
};

const pairAllCorrectly = async () => {
  await press('France');
  await press('Paris');
  await press('Germany');
  await press('Berlin');
  await press('Italy');
  await press('Rome');
};

describe('Matching', () => {
  // @s1 — both columns visible, all unpaired/tappable, Submit disabled, no result.
  it('renders both columns unpaired and tappable with Submit disabled', async () => {
    await render(<Matching {...defaultProps} />);

    expect(screen.getByText('Match each country to its capital.')).toBeTruthy();
    for (const item of [...leftItems, ...rightItems]) {
      const btn = itemButton(item.label);
      expect(btn).toBeTruthy();
      expect(btn.props.accessibilityState.disabled).toBe(false);
      expect(btn.props.accessibilityState.selected).toBe(false);
    }

    expect(submitButton().props.accessibilityState.disabled).toBe(true);
    expect(screen.queryByText(labels.correct)).toBeNull();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s2 — first tap selects pending.
  it('marks a tapped unpaired item as the pending selection', async () => {
    await render(<Matching {...defaultProps} />);

    await press('France');

    expect(itemButton('France').props.accessibilityState.selected).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.selected).toBe(false);
  });

  // @s3 — left-then-right forms a pair.
  it('forms a pair when tapping left then right', async () => {
    await render(<Matching {...defaultProps} />);

    await press('France');
    await press('Paris');

    expect(itemButton('France').props.accessibilityState.selected).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.selected).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.selected).toBe(false);
  });

  // @s3 — right-then-left forms a pair.
  it('forms a pair when tapping right then left', async () => {
    await render(<Matching {...defaultProps} />);

    await press('Berlin');
    await press('Germany');

    expect(itemButton('Berlin').props.accessibilityState.selected).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.selected).toBe(true);
    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
  });

  // @s4 — tap pending again deselects.
  it('deselects the pending item when tapped again', async () => {
    await render(<Matching {...defaultProps} />);

    await press('France');
    await press('France');

    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
  });

  // @s5 — same-column retarget.
  it('retargets pending when tapping another item in the same column', async () => {
    await render(<Matching {...defaultProps} />);

    await press('France');
    await press('Germany');

    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Germany').props.accessibilityState.selected).toBe(true);
  });

  // @s6 — tap paired item releases the pair.
  it('releases a pair when a paired item is tapped before submit', async () => {
    await render(<Matching {...defaultProps} />);

    await press('France');
    await press('Paris');
    expect(itemButton('France').props.accessibilityState.selected).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.selected).toBe(true);

    await press('France');

    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Paris').props.accessibilityState.selected).toBe(false);
  });

  // @s7 — Submit disabled while unpaired remain.
  it('keeps Submit disabled while at least one item is unpaired', async () => {
    await render(<Matching {...defaultProps} />);

    expect(submitButton().props.accessibilityState.disabled).toBe(true);

    await press('France');
    await press('Paris');
    expect(submitButton().props.accessibilityState.disabled).toBe(true);
  });

  // @s7 — Submit enabled when all paired.
  it('enables Submit when every item is paired', async () => {
    await render(<Matching {...defaultProps} />);

    await pairAllCorrectly();

    expect(submitButton().props.accessibilityState.disabled).toBe(false);
  });

  // @s8 — Submit calls onSubmit with pairs; result locks.
  it('calls onSubmit with formed pairs and locks when result is set', async () => {
    const onSubmit = jest.fn();
    const { rerender } = await render(<Matching {...defaultProps} onSubmit={onSubmit} />);

    await pairAllCorrectly();

    await act(async () => {
      fireEvent.press(submitButton());
    });

    expect(onSubmit).toHaveBeenCalledWith([
      { leftId: 'l1', rightId: 'r1' },
      { leftId: 'l2', rightId: 'r2' },
      { leftId: 'l3', rightId: 'r3' },
    ]);

    await act(async () => {
      rerender(<Matching {...defaultProps} onSubmit={onSubmit} result={allCorrectResult} />);
    });

    for (const item of [...leftItems, ...rightItems]) {
      // Accessible name gains correctness suffix once graded.
      const btn = screen.getByRole('button', { name: new RegExp(`^${item.label}`) });
      expect(btn.props.accessibilityState.disabled).toBe(true);
    }
    expect(screen.queryByRole('button', { name: labels.submit })).toBeNull();
  });

  // @s9 — all-correct result display.
  it('marks every pair correct and shows the correct banner when result is all-correct', async () => {
    await render(<Matching {...defaultProps} result={allCorrectResult} />);

    expect(screen.getAllByText('check_circle')).toHaveLength(6);
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText(labels.correct)).toBeTruthy();
    expect(screen.getByText('3 of 3 correct')).toBeTruthy();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s10 — mixed result display.
  it('marks pairs correct/incorrect and shows the incorrect banner for mixed results', async () => {
    await render(<Matching {...defaultProps} result={mixedResult} />);

    expect(screen.getAllByText('check_circle').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('cancel').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(labels.incorrect)).toBeTruthy();
    expect(screen.getByText('1 of 3 correct')).toBeTruthy();
    expect(screen.queryByText(labels.correct)).toBeNull();
  });

  // @s11 — explanation with results.
  it('shows the explanation with results when provided', async () => {
    await render(
      <Matching
        {...defaultProps}
        result={allCorrectResult}
        explanation="Capitals match their countries."
      />,
    );

    expect(screen.getByText(labels.explanationHeading)).toBeTruthy();
    expect(screen.getByText('Capitals match their countries.')).toBeTruthy();
  });

  it('does not show explanation heading when none is provided', async () => {
    await render(<Matching {...defaultProps} result={allCorrectResult} />);

    expect(screen.queryByText(labels.explanationHeading)).toBeNull();
  });

  // Wrapper-driven unavailable (task-4 / @s15 path); Empty/Error self-detect is Slice 2.
  it('shows unavailable notice when unavailable prop is true', async () => {
    await render(<Matching {...defaultProps} unavailable />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByText('France')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // Slice-1 design review — summary on-* must pair with banner container.
  it('colors the all-correct summary with onTertiaryContainer', async () => {
    await render(<Matching {...defaultProps} result={allCorrectResult} />);

    expect(screen.getByText('3 of 3 correct')).toHaveStyle({
      color: lightColors.onTertiaryContainer,
    });
  });

  it('colors the mixed/incorrect summary with onErrorContainer', async () => {
    await render(<Matching {...defaultProps} result={mixedResult} />);

    expect(screen.getByText('1 of 3 correct')).toHaveStyle({
      color: lightColors.onErrorContainer,
    });
  });

  // Slice-1 design review — item floor uses layout.touchTarget, not spacing.s12
  // (same numeric value; assert the semantic token in source + runtime floor).
  it('uses layout.touchTarget for item minHeight', async () => {
    const src = readFileSync(join(__dirname, 'matching.tsx'), 'utf8');
    expect(src).toMatch(/minHeight:\s*theme\.layout\.touchTarget/);
    expect(src).not.toMatch(/minHeight:\s*theme\.spacing\.s12/);

    await render(<Matching {...defaultProps} />);
    expect(itemButton('France')).toHaveStyle({ minHeight: layout.touchTarget });
  });
});
