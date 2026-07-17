jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string, opts?: Record<string, unknown>) => {
      if (key === 'activity.matching.summary' && opts) {
        return `${opts.correct} of ${opts.total} correct`;
      }
      return key;
    },
  }),
}));

import { layout, lightColors, mixHex, shape, spacing } from '@helsoft/components';
import type { MatchingAnswer, MatchingSlide } from '@helsoft/types';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';

import { Matching } from './matching';

const I18N = {
  submit: 'activity.matching.submit',
  correct: 'activity.matching.correct',
  incorrect: 'activity.matching.incorrect',
  correctPair: 'activity.matching.correctPair',
  incorrectPair: 'activity.matching.incorrectPair',
  explanationHeading: 'activity.matching.explanationHeading',
  unavailable: 'activity.matching.unavailable',
} as const;

const slide: MatchingSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'Match each country to its capital.',
  position: 0,
  kind: 'activity',
  activityType: 'matching',
  leftItems: [
    { id: 'l1', label: 'France' },
    { id: 'l2', label: 'Germany' },
    { id: 'l3', label: 'Italy' },
  ],
  rightItems: [
    { id: 'r1', label: 'Paris' },
    { id: 'r2', label: 'Berlin' },
    { id: 'r3', label: 'Rome' },
  ],
  correctPairs: [
    { leftId: 'l1', rightId: 'r1' },
    { leftId: 'l2', rightId: 'r2' },
    { leftId: 'l3', rightId: 'r3' },
  ],
  explanation: 'Capitals match their countries.',
};

const allCorrectAnswer: MatchingAnswer = {
  slideId: slide.id,
  activityType: 'matching',
  pairs: [
    { leftId: 'l1', rightId: 'r1', isCorrect: true },
    { leftId: 'l2', rightId: 'r2', isCorrect: true },
    { leftId: 'l3', rightId: 'r3', isCorrect: true },
  ],
  correctPairCount: 3,
  totalPairCount: 3,
  isCorrect: true,
};

const mixedAnswer: MatchingAnswer = {
  slideId: slide.id,
  activityType: 'matching',
  pairs: [
    { leftId: 'l1', rightId: 'r1', isCorrect: true },
    { leftId: 'l2', rightId: 'r3', isCorrect: false },
    { leftId: 'l3', rightId: 'r2', isCorrect: false },
  ],
  correctPairCount: 1,
  totalPairCount: 3,
  isCorrect: false,
};

const itemButton = (label: string) => screen.getByRole('button', { name: label });

const submitButton = () => screen.getByRole('button', { name: I18N.submit });

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
  let announceSpy: jest.SpyInstance;

  beforeEach(() => {
    announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();
  });

  afterEach(() => {
    announceSpy.mockRestore();
  });

  // @s1 — both columns visible, all unpaired/tappable, Submit disabled, no result.
  it('renders both columns unpaired and tappable with Submit disabled', async () => {
    await render(<Matching slide={slide} />);

    expect(screen.getByText(slide.content)).toBeTruthy();
    for (const item of [...slide.leftItems, ...slide.rightItems]) {
      const btn = itemButton(item.label);
      expect(btn).toBeTruthy();
      expect(btn.props.accessibilityState.disabled).toBe(false);
      expect(btn.props.accessibilityState.selected).toBe(false);
    }

    expect(submitButton().props.accessibilityState.disabled).toBe(true);
    expect(screen.queryByText(I18N.correct)).toBeNull();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  // @s2 — first tap selects pending.
  it('marks a tapped unpaired item as the pending selection', async () => {
    await render(<Matching slide={slide} />);

    await press('France');

    expect(itemButton('France').props.accessibilityState.selected).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.selected).toBe(false);
  });

  // @s3 — left-then-right forms a pair.
  it('forms a pair when tapping left then right', async () => {
    await render(<Matching slide={slide} />);

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
    await render(<Matching slide={slide} />);

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
    await render(<Matching slide={slide} />);

    await press('France');
    await press('France');

    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
  });

  // @s4 — right-column deselect.
  it('deselects a pending right-column item when tapped again', async () => {
    await render(<Matching slide={slide} />);

    await press('Paris');
    await press('Paris');

    expect(itemButton('Paris').props.accessibilityState.selected).toBe(false);
  });

  // @s5 — same-column retarget.
  it('retargets pending when tapping another item in the same column', async () => {
    await render(<Matching slide={slide} />);

    await press('France');
    await press('Germany');

    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Germany').props.accessibilityState.selected).toBe(true);
  });

  // @s5 — right-column same-column retarget.
  it('retargets pending when tapping another item in the right column', async () => {
    await render(<Matching slide={slide} />);

    await press('Paris');
    await press('Berlin');

    expect(itemButton('Paris').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Berlin').props.accessibilityState.selected).toBe(true);
  });

  // @s6 — tap paired item releases the pair.
  it('releases a pair when a paired item is tapped before submit', async () => {
    await render(<Matching slide={slide} />);

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
    await render(<Matching slide={slide} />);

    expect(submitButton().props.accessibilityState.disabled).toBe(true);

    await press('France');
    await press('Paris');
    expect(submitButton().props.accessibilityState.disabled).toBe(true);
  });

  // @s7 — disabled Submit does not call onAnswered.
  it('does not call onAnswered when Submit is pressed while disabled', async () => {
    const onAnswered = jest.fn();
    await render(<Matching slide={slide} onAnswered={onAnswered} />);

    expect(submitButton().props.accessibilityState.disabled).toBe(true);

    await act(async () => {
      fireEvent.press(submitButton());
    });

    expect(onAnswered).not.toHaveBeenCalled();
  });

  // @s7 — Submit enabled when all paired.
  it('enables Submit when every item is paired', async () => {
    await render(<Matching slide={slide} />);

    await pairAllCorrectly();

    expect(submitButton().props.accessibilityState.disabled).toBe(false);
  });

  // @s8 — Submit grades via onAnswered; result locks.
  it('calls onAnswered with graded pairs and locks after submit', async () => {
    const onAnswered = jest.fn();
    await render(<Matching slide={slide} onAnswered={onAnswered} />);

    await pairAllCorrectly();

    await act(async () => {
      fireEvent.press(submitButton());
    });

    expect(onAnswered).toHaveBeenCalledWith(allCorrectAnswer);

    for (const item of [...slide.leftItems, ...slide.rightItems]) {
      const btn = screen.getByRole('button', { name: new RegExp(`^${item.label}`) });
      expect(btn.props.accessibilityState.disabled).toBe(true);
    }
    expect(screen.queryByRole('button', { name: I18N.submit })).toBeNull();
  });

  // @s9 — all-correct result display.
  it('marks every pair correct and shows the correct banner when initialAnswer is all-correct', async () => {
    await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);

    expect(screen.getAllByText('check_circle')).toHaveLength(6);
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText(I18N.correct)).toBeTruthy();
    expect(screen.getByText('3 of 3 correct')).toBeTruthy();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  // @s10 — mixed result display.
  it('marks pairs correct/incorrect and shows the incorrect banner for mixed results', async () => {
    await render(<Matching slide={slide} initialAnswer={mixedAnswer} />);

    expect(screen.getAllByText('check_circle')).toHaveLength(2);
    expect(screen.getAllByText('cancel')).toHaveLength(4);
    expect(screen.getByText(I18N.incorrect)).toBeTruthy();
    expect(screen.getByText('1 of 3 correct')).toBeTruthy();
    expect(screen.queryByText(I18N.correct)).toBeNull();
  });

  // @s11 — explanation with results.
  it('shows the explanation with results when provided', async () => {
    await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);

    expect(screen.getByText(I18N.explanationHeading)).toBeTruthy();
    expect(screen.getByText(slide.explanation!)).toBeTruthy();
  });

  it('does not show explanation heading when none is provided', async () => {
    await render(
      <Matching slide={{ ...slide, explanation: undefined }} initialAnswer={allCorrectAnswer} />,
    );

    expect(screen.queryByText(I18N.explanationHeading)).toBeNull();
  });

  it('does not show explanation when result is absent', async () => {
    await render(<Matching slide={slide} />);

    expect(screen.queryByTestId('matching-explanation')).toBeNull();
    expect(screen.queryByText(I18N.explanationHeading)).toBeNull();
    expect(screen.queryByText(slide.explanation!)).toBeNull();
  });

  it('shows unavailable notice when the slide is invalid', async () => {
    const invalid: MatchingSlide = {
      ...slide,
      correctPairs: [{ leftId: 'nope', rightId: 'r1' }],
    };
    await render(<Matching slide={invalid} />);

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByText('France')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // @s13 — empty left or right column → unavailable notice, nothing interactive.
  it('shows unavailable notice when a column is empty', async () => {
    await render(<Matching slide={{ ...slide, leftItems: [], correctPairs: [] }} />);

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByText(slide.content)).toBeNull();
    expect(screen.queryByText('Paris')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // @s14 — unequal column lengths → unavailable notice, no crash.
  it('shows unavailable notice when column lengths differ', async () => {
    await render(
      <Matching
        slide={{
          ...slide,
          rightItems: slide.rightItems.slice(0, 2),
          correctPairs: slide.correctPairs.slice(0, 2),
        }}
      />,
    );

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByText('France')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('colors the all-correct summary with onTertiaryContainer', async () => {
    await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);

    expect(screen.getByText('3 of 3 correct')).toHaveStyle({
      color: lightColors.onTertiaryContainer,
    });
  });

  it('colors the mixed/incorrect summary with onErrorContainer', async () => {
    await render(<Matching slide={slide} initialAnswer={mixedAnswer} />);

    expect(screen.getByText('1 of 3 correct')).toHaveStyle({
      color: lightColors.onErrorContainer,
    });
  });

  it('uses layout.touchTarget for item minHeight', async () => {
    await render(<Matching slide={slide} />);
    expect(itemButton('France')).toHaveStyle({ minHeight: layout.touchTarget });
  });

  it('seeds formed pairs from initialPairs so Submit stays disabled until all paired', async () => {
    await render(<Matching slide={slide} initialPairs={[{ leftId: 'l1', rightId: 'r1' }]} />);

    expect(itemButton('France').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Germany').props.accessibilityState.checked).toBe(false);
    expect(submitButton().props.accessibilityState.disabled).toBe(true);
  });

  it('exposes a button role and accessible label for every item', async () => {
    await render(<Matching slide={slide} />);

    for (const item of [...slide.leftItems, ...slide.rightItems]) {
      const btn = screen.getByRole('button', { name: item.label });
      expect(btn.props.accessibilityRole).toBe('button');
      expect(btn.props.accessibilityLabel).toBe(item.label);
    }
  });

  it('conveys pending and paired as distinct accessibility states', async () => {
    await render(<Matching slide={slide} />);

    await press('France');
    expect(itemButton('France').props.accessibilityState.selected).toBe(true);
    expect(itemButton('France').props.accessibilityState.checked).toBe(false);

    await press('Paris');
    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
    expect(itemButton('France').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Paris').props.accessibilityState.selected).toBe(false);
    expect(itemButton('Paris').props.accessibilityState.checked).toBe(true);
  });

  it('conveys pair correctness via text, icon, and accessible label', async () => {
    await render(<Matching slide={slide} initialAnswer={mixedAnswer} />);

    expect(screen.getByText(I18N.incorrect)).toBeTruthy();
    expect(screen.getAllByText('check_circle')).toHaveLength(2);
    expect(screen.getAllByText('cancel')).toHaveLength(4);

    expect(screen.getByRole('button', { name: `France, ${I18N.correctPair}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: `Germany, ${I18N.incorrectPair}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: `Rome, ${I18N.incorrectPair}` })).toBeTruthy();
  });

  it('announces a correct result via a polite live region and AccessibilityInfo, without an alert role', async () => {
    await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);

    const banner = screen.getByText(I18N.correct);
    expect(banner.props.accessibilityLiveRegion).toBe('polite');
    expect(screen.getByTestId('matching-result-banner').props.accessibilityRole).toBeUndefined();
    expect(announceSpy).toHaveBeenCalledWith(I18N.correct);
  });

  it('announces an incorrect result via an alert role and an assertive live region', async () => {
    await render(<Matching slide={slide} initialAnswer={mixedAnswer} />);

    const banner = screen.getByText(I18N.incorrect);
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    expect(screen.getByTestId('matching-result-banner').props.accessibilityRole).toBe('alert');
    expect(announceSpy).toHaveBeenCalledWith(I18N.incorrect);
  });

  it('does not announce anything to assistive technology while unsubmitted', async () => {
    await render(<Matching slide={slide} />);

    expect(announceSpy).not.toHaveBeenCalled();
  });

  it('announces the result when transitioning from unsubmitted to submitted', async () => {
    await render(<Matching slide={slide} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await pairAllCorrectly();
    await act(async () => {
      fireEvent.press(submitButton());
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.correct));
    expect(announceSpy).toHaveBeenCalledTimes(1);
  });

  describe('platform-scoped imperative announcement (Android relies on the live region alone)', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      Platform.OS = originalOS;
    });

    it('does not call announceForAccessibility on Android once submitted', async () => {
      Platform.OS = 'android';

      await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);

      expect(announceSpy).not.toHaveBeenCalled();
    });

    it.each([
      'ios',
      'web',
    ] as const)('still calls announceForAccessibility on %s once submitted', async (os) => {
      Platform.OS = os;

      await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);

      expect(announceSpy).toHaveBeenCalledWith(I18N.correct);
    });
  });

  it('shows unavailable notice when the right column is empty', async () => {
    await render(<Matching slide={{ ...slide, rightItems: [], correctPairs: [] }} />);

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByText('France')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('shows unavailable notice when both columns are empty', async () => {
    await render(
      <Matching slide={{ ...slide, leftItems: [], rightItems: [], correctPairs: [] }} />,
    );

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByText(slide.content)).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('uses a null resultLabel while unsubmitted', async () => {
    await render(<Matching slide={slide} />);
    expect(screen.queryByText(I18N.correct)).toBeNull();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
    expect(announceSpy).not.toHaveBeenCalled();
  });

  it('releases only the tapped pair when a right-column paired item is pressed', async () => {
    await render(<Matching slide={slide} />);

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

  it('ignores item presses once result locks the activity', async () => {
    const onAnswered = jest.fn();
    const partialAnswer: MatchingAnswer = {
      slideId: slide.id,
      activityType: 'matching',
      pairs: [{ leftId: 'l1', rightId: 'r1', isCorrect: true }],
      correctPairCount: 1,
      totalPairCount: 3,
      isCorrect: false,
    };
    await render(<Matching slide={slide} onAnswered={onAnswered} initialAnswer={partialAnswer} />);

    const germany = screen.getByRole('button', { name: 'Germany' });
    expect(germany.props.accessibilityState.selected).toBe(false);
    expect(germany.props.accessibilityState.disabled).toBe(true);
    expect(germany.props.onPress).toBeUndefined();

    await act(async () => {
      fireEvent.press(germany);
    });

    expect(onAnswered).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Germany' }).props.accessibilityState.selected).toBe(
      false,
    );
    expect(screen.queryByRole('button', { name: I18N.submit })).toBeNull();
  });

  it('forms a pair when left and right items share the same id string', async () => {
    const sharedSlide: MatchingSlide = {
      ...slide,
      leftItems: [{ id: 'x', label: 'Left X' }],
      rightItems: [{ id: 'x', label: 'Right X' }],
      correctPairs: [{ leftId: 'x', rightId: 'x' }],
    };
    const onAnswered = jest.fn();
    await render(<Matching slide={sharedSlide} onAnswered={onAnswered} />);

    await press('Left X');
    await press('Right X');

    expect(itemButton('Left X').props.accessibilityState.checked).toBe(true);
    expect(itemButton('Right X').props.accessibilityState.checked).toBe(true);
    expect(submitButton().props.accessibilityState.disabled).toBe(false);

    await act(async () => {
      fireEvent.press(submitButton());
    });
    expect(onAnswered).toHaveBeenCalledWith(
      expect.objectContaining({
        pairs: [{ leftId: 'x', rightId: 'x', isCorrect: true }],
        isCorrect: true,
      }),
    );
  });

  it('leaves items absent from graded pairs in the default graded state', async () => {
    const partialAnswer: MatchingAnswer = {
      slideId: slide.id,
      activityType: 'matching',
      pairs: [{ leftId: 'l1', rightId: 'r1', isCorrect: true }],
      correctPairCount: 1,
      totalPairCount: 3,
      isCorrect: false,
    };
    await render(<Matching slide={slide} initialAnswer={partialAnswer} />);

    expect(screen.getByRole('button', { name: `France, ${I18N.correctPair}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: `Paris, ${I18N.correctPair}` })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Germany' }).props.accessibilityLabel).toBe(
      'Germany',
    );
    expect(screen.getByRole('button', { name: 'Berlin' }).props.accessibilityLabel).toBe('Berlin');
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getAllByText('check_circle')).toHaveLength(2);
  });

  it('shows no feedback icons and unselected state for unpaired items', async () => {
    await render(<Matching slide={slide} />);

    expect(screen.queryByText('check_circle')).toBeNull();
    expect(screen.queryByText('cancel')).toBeNull();
    expect(itemButton('France').props.accessibilityState.selected).toBe(false);
  });

  it('colors correct and incorrect feedback icons from theme tokens', async () => {
    await render(<Matching slide={slide} initialAnswer={mixedAnswer} />);

    for (const icon of screen.getAllByText('check_circle')) {
      expect(icon).toHaveStyle({ color: lightColors.tertiary });
    }
    for (const icon of screen.getAllByText('cancel')) {
      expect(icon).toHaveStyle({ color: lightColors.error });
    }
  });

  it('styles the all-correct result banner with shape and tertiary container tokens', async () => {
    await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);
    expect(screen.getByTestId('matching-result-banner')).toHaveStyle({
      borderRadius: shape.card,
      padding: spacing.s3,
      backgroundColor: lightColors.tertiaryContainer,
    });
  });

  it('styles the incorrect result banner with shape and error container tokens', async () => {
    await render(<Matching slide={slide} initialAnswer={mixedAnswer} />);
    expect(screen.getByTestId('matching-result-banner')).toHaveStyle({
      borderRadius: shape.card,
      padding: spacing.s3,
      backgroundColor: lightColors.errorContainer,
    });
  });

  it('lays out columns and items from spacing and shape tokens', async () => {
    await render(<Matching slide={slide} />);

    expect(screen.getByText(slide.content)).toHaveStyle({
      color: lightColors.onSurface,
    });
    expect(screen.getByText('France')).toHaveStyle({ color: lightColors.onSurface });

    expect(screen.getByTestId('matching-root')).toHaveStyle({ gap: spacing.s4 });
    expect(screen.getByTestId('matching-columns')).toHaveStyle({
      flexDirection: 'row',
      gap: spacing.s3,
    });
    expect(screen.getByTestId('matching-column-left')).toHaveStyle({
      flex: 1,
      gap: spacing.s3,
    });

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

  it('applies pending and paired item state tokens', async () => {
    await render(<Matching slide={slide} />);

    await press('France');
    expect(itemButton('France')).toHaveStyle({
      backgroundColor: lightColors.primaryContainer,
      borderWidth: 1,
      borderColor: lightColors.tertiary,
    });
    expect(screen.getByText('France')).toHaveStyle({ color: lightColors.onPrimaryContainer });

    await press('Paris');
    expect(itemButton('France')).toHaveStyle({
      backgroundColor: lightColors.secondaryContainer,
      borderWidth: 1,
      borderColor: lightColors.outline,
    });
    expect(screen.getByText('France')).toHaveStyle({ color: lightColors.onSecondaryContainer });
  });

  it('applies correct and incorrect item state tokens', async () => {
    await render(<Matching slide={slide} initialAnswer={mixedAnswer} />);

    const correctBg = mixHex(lightColors.tertiaryContainer, lightColors.surface, 0.55);
    expect(screen.getByRole('button', { name: `France, ${I18N.correctPair}` })).toHaveStyle({
      backgroundColor: correctBg,
      borderWidth: 1,
      borderColor: lightColors.tertiary,
    });
    expect(screen.getByText('France')).toHaveStyle({ color: lightColors.onTertiaryContainer });

    expect(screen.getByRole('button', { name: `Germany, ${I18N.incorrectPair}` })).toHaveStyle({
      backgroundColor: lightColors.errorContainer,
      borderWidth: 1,
      borderColor: lightColors.error,
    });
    expect(screen.getByText('Germany')).toHaveStyle({ color: lightColors.onErrorContainer });
  });

  it('styles the correct banner title text from onTertiaryContainer', async () => {
    await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);
    expect(screen.getByText(I18N.correct)).toHaveStyle({
      color: lightColors.onTertiaryContainer,
    });
  });

  it('styles the incorrect banner title text from onErrorContainer', async () => {
    await render(<Matching slide={slide} initialAnswer={mixedAnswer} />);
    expect(screen.getByText(I18N.incorrect)).toHaveStyle({
      color: lightColors.onErrorContainer,
    });
  });

  it('styles explanation chrome from typography and onSurface tokens', async () => {
    await render(<Matching slide={slide} initialAnswer={allCorrectAnswer} />);

    expect(screen.getByText(I18N.explanationHeading)).toHaveStyle({
      color: lightColors.onSurfaceVariant,
    });
    expect(screen.getByText(slide.explanation!)).toHaveStyle({
      color: lightColors.onSurface,
    });
    expect(screen.getByTestId('matching-explanation')).toHaveStyle({
      gap: spacing.s1,
    });
  });
});
