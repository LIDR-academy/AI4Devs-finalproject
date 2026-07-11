import { AccessibilityInfo, Platform } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { layout, lightColors, mixHex, shape, spacing } from '@helsoft/components';

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

    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
    expect(itemButton('France').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Germany').props.accessibilityState.checked).toBe(false);
  });

  // @s3 — right-then-left forms a pair.
  it('forms a pair when tapping right then left', async () => {
    await render(<Matching {...defaultProps} />);

    await press('Berlin');
    await press('Germany');

    expect(itemButton('Berlin').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Berlin').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Germany').props.accessibilityState.checked).toBe(true);
    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
    expect(itemButton('France').props.accessibilityState.checked).toBe(false);
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
    expect(itemButton('France').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(true);

    await press('France');

    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
    expect(itemButton('France').props.accessibilityState.checked).toBe(false);
    expect(itemButton('Paris').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(false);
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

  // @s13 — empty left or right column → Empty (unavailable notice, nothing interactive).
  it('shows unavailable notice when a column is empty', async () => {
    await render(<Matching {...defaultProps} leftItems={[]} />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByText(defaultProps.prompt)).toBeNull();
    expect(screen.queryByText('Paris')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // @s14 — unequal column lengths → Error (unavailable notice, no crash).
  it('shows unavailable notice when column lengths differ', async () => {
    await render(
      <Matching {...defaultProps} rightItems={rightItems.slice(0, 2)} />,
    );

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

  // Slice-1 design review — item floor uses layout.touchTarget (runtime floor; token value).
  it('uses layout.touchTarget for item minHeight', async () => {
    await render(<Matching {...defaultProps} />);
    expect(itemButton('France')).toHaveStyle({ minHeight: layout.touchTarget });
  });

  // Story/demo seed — initialPairs paints a partially-paired board without interaction.
  it('seeds formed pairs from initialPairs so Submit stays disabled until all paired', async () => {
    await render(
      <Matching
        {...defaultProps}
        initialPairs={[{ leftId: 'l1', rightId: 'r1' }]}
      />,
    );

    expect(itemButton('France').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.checked).toBe(false);
    expect(submitButton().props.accessibilityState.disabled).toBe(true);
  });

  // @s17 — each item exposes button role + accessible label.
  it('exposes a button role and accessible label for every item', async () => {
    await render(<Matching {...defaultProps} />);

    for (const item of [...leftItems, ...rightItems]) {
      const btn = screen.getByRole('button', { name: item.label });
      expect(btn.props.accessibilityRole).toBe('button');
      expect(btn.props.accessibilityLabel).toBe(item.label);
    }
  });

  // @s17 — pending vs paired distinguishable via a11y state (not color alone).
  it('conveys pending and paired as distinct accessibility states', async () => {
    await render(<Matching {...defaultProps} />);

    await press('France');
    expect(itemButton('France').props.accessibilityState.selected).toBe(true);
    expect(itemButton('France').props.accessibilityState.checked).toBe(false);

    await press('Paris');
    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
    expect(itemButton('France').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(true);
  });

  // @s17 — post-submit correctness via text + icon + accessible label (not color alone).
  it('conveys pair correctness via text, icon, and accessible label', async () => {
    await render(<Matching {...defaultProps} result={mixedResult} />);

    expect(screen.getByText(labels.incorrect)).toBeTruthy();
    expect(screen.getAllByText('check_circle').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('cancel').length).toBeGreaterThanOrEqual(2);

    expect(screen.getByRole('button', { name: `France, ${labels.correctPair}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: `Germany, ${labels.incorrectPair}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: `Rome, ${labels.incorrectPair}` })).toBeTruthy();
  });

  // @s17 — correct result announced politely without alert role.
  it('announces a correct result via a polite live region and AccessibilityInfo, without an alert role', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<Matching {...defaultProps} result={allCorrectResult} />);

    const banner = screen.getByText(labels.correct);
    expect(banner.props.accessibilityLiveRegion).toBe('polite');
    expect(banner.parent?.props.accessibilityRole).toBeUndefined();
    expect(announceSpy).toHaveBeenCalledWith(labels.correct);

    announceSpy.mockRestore();
  });

  // @s17 — incorrect result uses alert + assertive live region.
  it('announces an incorrect result via an alert role and an assertive live region', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<Matching {...defaultProps} result={mixedResult} />);

    const banner = screen.getByText(labels.incorrect);
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    expect(banner.parent?.props.accessibilityRole).toBe('alert');
    expect(announceSpy).toHaveBeenCalledWith(labels.incorrect);

    announceSpy.mockRestore();
  });

  // @s17 — no announcement while unsubmitted.
  it('does not announce anything to assistive technology while unsubmitted', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<Matching {...defaultProps} />);

    expect(announceSpy).not.toHaveBeenCalled();

    announceSpy.mockRestore();
  });

  // @s17 — announce on transition from unsubmitted → result (dependency-array guard).
  it('announces the result when a re-render transitions from unsubmitted to submitted', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(<Matching {...defaultProps} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(<Matching {...defaultProps} result={allCorrectResult} />);
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.correct));
    expect(announceSpy).toHaveBeenCalledTimes(1);

    announceSpy.mockRestore();
  });

  // @s17 — Android relies on live region alone (no duplicate announceForAccessibility).
  describe('platform-scoped imperative announcement (Android relies on the live region alone)', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      Platform.OS = originalOS;
    });

    it('does not call announceForAccessibility on Android once submitted', async () => {
      Platform.OS = 'android';
      const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
      announceSpy.mockClear();

      await render(<Matching {...defaultProps} result={allCorrectResult} />);

      expect(announceSpy).not.toHaveBeenCalled();

      announceSpy.mockRestore();
    });

    it.each(['ios', 'web'] as const)('still calls announceForAccessibility on %s once submitted', async (os) => {
      Platform.OS = os;
      const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
      announceSpy.mockClear();

      await render(<Matching {...defaultProps} result={allCorrectResult} />);

      expect(announceSpy).toHaveBeenCalledWith(labels.correct);

      announceSpy.mockRestore();
    });
  });

  // --- PRE-REVIEW mutation survivors ---

  // Empty right only (left populated) — isEmptyRight branch.
  it('shows unavailable notice when the right column is empty', async () => {
    await render(<Matching {...defaultProps} rightItems={[]} />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByText('France')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // Both columns empty — length-equal (0===0); empty guards alone must reject (not isUnequal).
  it('shows unavailable notice when both columns are empty', async () => {
    await render(<Matching {...defaultProps} leftItems={[]} rightItems={[]} />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByText(defaultProps.prompt)).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // Unsubmitted resultLabel is null — never announced / never shown as banner text.
  it('uses a null resultLabel while unsubmitted', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<Matching {...defaultProps} />);
    expect(screen.queryByText(labels.correct)).toBeNull();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
    expect(announceSpy).not.toHaveBeenCalled();

    announceSpy.mockRestore();
  });

  // Release via right item — covers pair.rightId !== itemId (NoCoverage) + keeps other pairs.
  it('releases only the tapped pair when a right-column paired item is pressed', async () => {
    await render(<Matching {...defaultProps} />);

    await press('France');
    await press('Paris');
    await press('Germany');
    await press('Berlin');

    expect(itemButton('France').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Berlin').props.accessibilityState.checked).toBe(true);

    await press('Paris');

    expect(itemButton('France').props.accessibilityState.checked).toBe(false);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(false);
    expect(itemButton('Germany').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Berlin').props.accessibilityState.checked).toBe(true);
    expect(submitButton().props.accessibilityState.disabled).toBe(true);
  });

  // Lock via onPress={locked ? undefined : …} — press must not select when result is set.
  it('ignores item presses once result locks the activity', async () => {
    const onSubmit = jest.fn();
    const partialResult: MatchingResult = {
      pairs: [{ leftId: 'l1', rightId: 'r1', isCorrect: true }],
      isCorrect: false,
      summary: '1 of 3 correct',
    };
    await render(
      <Matching {...defaultProps} onSubmit={onSubmit} result={partialResult} />,
    );

    const germany = screen.getByRole('button', { name: 'Germany' });
    expect(germany.props.accessibilityState.selected).toBe(false);
    expect(germany.props.accessibilityState.disabled).toBe(true);
    expect(germany.props.onPress).toBeUndefined();

    await act(async () => {
      fireEvent.press(germany);
    });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Germany' }).props.accessibilityState.selected).toBe(
      false,
    );
    expect(screen.queryByRole('button', { name: labels.submit })).toBeNull();
  });

  // pending.column → true mutant: same id in both columns must still form a pair, not deselect.
  it('forms a pair when left and right items share the same id string', async () => {
    const sharedLeft = [{ id: 'x', label: 'Left X' }];
    const sharedRight = [{ id: 'x', label: 'Right X' }];
    const onSubmit = jest.fn();
    await render(
      <Matching
        {...defaultProps}
        leftItems={sharedLeft}
        rightItems={sharedRight}
        onSubmit={onSubmit}
      />,
    );

    await press('Left X');
    await press('Right X');

    expect(itemButton('Left X').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Right X').props.accessibilityState.checked).toBe(true);
    expect(submitButton().props.accessibilityState.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(submitButton());
    });
    expect(onSubmit).toHaveBeenCalledWith([{ leftId: 'x', rightId: 'x' }]);
  });

  // if (graded) → if (true): item missing from result.pairs must stay default (no icon/suffix).
  it('leaves items absent from result.pairs in the default graded state', async () => {
    const partialResult: MatchingResult = {
      pairs: [{ leftId: 'l1', rightId: 'r1', isCorrect: true }],
      isCorrect: false,
      summary: '1 of 3 correct',
    };
    await render(<Matching {...defaultProps} result={partialResult} />);

    expect(screen.getByRole('button', { name: `France, ${labels.correctPair}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: `Paris, ${labels.correctPair}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Germany' }).props.accessibilityLabel).toBe('Germany');
    expect(screen.getByRole('button', { name: 'Berlin' }).props.accessibilityLabel).toBe('Berlin');
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getAllByText('check_circle')).toHaveLength(2);
  });

  // feedbackIcon / selected guards — unpaired must not look selected or show feedback icons.
  it('shows no feedback icons and unselected state for unpaired items', async () => {
    await render(<Matching {...defaultProps} />);

    expect(screen.queryByText('check_circle')).toBeNull();
    expect(screen.queryByText('cancel')).toBeNull();
    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
  });

  // feedbackColor branches — correct uses tertiary, incorrect uses error on the Icon.
  it('colors correct and incorrect feedback icons from theme tokens', async () => {
    await render(<Matching {...defaultProps} result={mixedResult} />);

    for (const icon of screen.getAllByText('check_circle')) {
      expect(icon).toHaveStyle({ color: lightColors.tertiary });
    }
    for (const icon of screen.getAllByText('cancel')) {
      expect(icon).toHaveStyle({ color: lightColors.error });
    }
  });

  // Banner style array must apply correct/incorrect container tokens (not []).
  it('styles the result banner with shape and semantic container colors', async () => {
    await render(<Matching {...defaultProps} result={allCorrectResult} />);
    const correctBanner = screen.getByText(labels.correct).parent;
    expect(correctBanner).toHaveStyle({
      borderRadius: shape.card,
      padding: spacing.s3,
      backgroundColor: lightColors.tertiaryContainer,
    });

    await render(<Matching {...defaultProps} result={mixedResult} />);
    const incorrectBanner = screen.getByText(labels.incorrect).parent;
    expect(incorrectBanner).toHaveStyle({
      borderRadius: shape.card,
      padding: spacing.s3,
      backgroundColor: lightColors.errorContainer,
    });
  });

  // Item / column layout tokens — kills ObjectLiteral empties on shared layout styles.
  it('lays out columns and items from spacing and shape tokens', async () => {
    await render(<Matching {...defaultProps} />);

    expect(screen.getByText(defaultProps.prompt)).toHaveStyle({
      color: lightColors.onSurface,
    });
    // Default item label uses onSurface (kills itemLabel incorrect→true falling through).
    expect(screen.getByText('France')).toHaveStyle({ color: lightColors.onSurface });

    // columns View is the prompt's next sibling under the Card.
    const prompt = screen.getByText(defaultProps.prompt);
    const card = prompt.parent as { props?: { style?: unknown }; children?: unknown[] } | undefined;
    expect(card?.props?.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ gap: spacing.s4 })]),
    );

    const columns = card?.children?.[1] as { props?: { style?: unknown }; children?: unknown[] } | undefined;
    expect(columns?.props?.style).toEqual(
      expect.objectContaining({ flexDirection: 'row', gap: spacing.s3 }),
    );
    const leftColumn = columns?.children?.[0] as { props?: { style?: unknown } } | undefined;
    expect(leftColumn?.props?.style).toEqual(
      expect.objectContaining({ flex: 1, gap: spacing.s3 }),
    );

    const france = itemButton('France');
    expect(france).toHaveStyle({
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.s2,
      paddingVertical: spacing.s3,
      paddingHorizontal: spacing.s3,
      borderRadius: shape.md,
      minHeight: layout.touchTarget,
      backgroundColor: lightColors.surface,
      borderWidth: 1,
      borderColor: lightColors.outlineVariant,
    });
  });

  it('applies pending, paired, correct, and incorrect item state tokens', async () => {
    const { rerender } = await render(<Matching {...defaultProps} />);

    await press('France');
    expect(itemButton('France')).toHaveStyle({
      backgroundColor: lightColors.primaryContainer,
      borderWidth: 2,
      borderColor: lightColors.primary,
    });
    expect(screen.getByText('France')).toHaveStyle({ color: lightColors.onPrimaryContainer });

    await press('Paris');
    expect(itemButton('France')).toHaveStyle({
      backgroundColor: lightColors.secondaryContainer,
      borderWidth: 1,
      borderColor: lightColors.outline,
    });
    expect(screen.getByText('France')).toHaveStyle({ color: lightColors.onSecondaryContainer });

    await act(async () => {
      rerender(<Matching {...defaultProps} result={mixedResult} />);
    });

    const correctBg = mixHex(lightColors.tertiaryContainer, lightColors.surface, 0.55);
    expect(screen.getByRole('button', { name: `France, ${labels.correctPair}` })).toHaveStyle({
      backgroundColor: correctBg,
      borderWidth: 2,
      borderColor: lightColors.tertiary,
    });
    expect(screen.getByText('France')).toHaveStyle({ color: lightColors.onTertiaryContainer });

    expect(screen.getByRole('button', { name: `Germany, ${labels.incorrectPair}` })).toHaveStyle({
      backgroundColor: lightColors.errorContainer,
      borderWidth: 2,
      borderColor: lightColors.error,
    });
    expect(screen.getByText('Germany')).toHaveStyle({ color: lightColors.onErrorContainer });
  });

  it('styles the correct and incorrect banner title text from on-* tokens', async () => {
    await render(<Matching {...defaultProps} result={allCorrectResult} />);
    expect(screen.getByText(labels.correct)).toHaveStyle({
      color: lightColors.onTertiaryContainer,
    });

    await render(<Matching {...defaultProps} result={mixedResult} />);
    expect(screen.getByText(labels.incorrect)).toHaveStyle({
      color: lightColors.onErrorContainer,
    });
  });

  it('styles explanation chrome from typography and onSurface tokens', async () => {
    await render(
      <Matching
        {...defaultProps}
        result={allCorrectResult}
        explanation="Capitals match their countries."
      />,
    );

    const heading = screen.getByText(labels.explanationHeading);
    expect(heading).toHaveStyle({
      color: lightColors.onSurfaceVariant,
    });
    expect(screen.getByText('Capitals match their countries.')).toHaveStyle({
      color: lightColors.onSurface,
    });
    const explanation = heading.parent as { props?: { style?: unknown } } | undefined;
    expect(explanation?.props?.style).toEqual(
      expect.objectContaining({ gap: spacing.s1 }),
    );
  });
});
