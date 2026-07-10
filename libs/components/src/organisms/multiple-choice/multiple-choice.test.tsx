import { AccessibilityInfo, Platform } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { MultipleChoice, MultipleChoiceLabels, MultipleChoiceOptionView } from './multiple-choice';

const labels: MultipleChoiceLabels = {
  correct: 'Correct!',
  incorrect: 'Not quite',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
};

const options: MultipleChoiceOptionView[] = [
  { id: 'opt-a', label: 'Paris' },
  { id: 'opt-b', label: 'Berlin' },
];

describe('MultipleChoice', () => {
  // @s1 — unanswered: the question and every option are visible and enabled, none pre-selected,
  // and no result banner is shown.
  it('renders the question and every option as visible and enabled, with no result banner', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getByText('What is the capital of France?')).toBeTruthy();
    expect(screen.getByText('Paris')).toBeTruthy();
    expect(screen.getByText('Berlin')).toBeTruthy();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button.props.accessibilityState.disabled).toBe(false));

    expect(screen.queryByText(labels.correct)).toBeNull();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s1 — every option is selectable in the unanswered state: tapping one reports its id up.
  it('calls onSelectOption with the tapped option id while unanswered', async () => {
    const onSelectOption = jest.fn();
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={onSelectOption}
      />,
    );

    fireEvent.press(screen.getAllByRole('button')[1]);

    expect(onSelectOption).toHaveBeenCalledWith('opt-b');
  });

  // @s2 — once a selection has been made, the attempt is locked: every option becomes disabled.
  it('locks every option once answered', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-b"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => expect(button.props.accessibilityState.disabled).toBe(true));
  });

  // @s3 — a correct choice marks the selected tile correct (check_circle feedback icon, not
  // color-only) and shows the correct result banner.
  it('marks the selected tile correct and shows the correct banner when the selection matches', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText(labels.correct)).toBeTruthy();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s4 — an incorrect choice marks the selected tile incorrect, reveals the correct tile
  // alongside it, and shows the incorrect result banner.
  it('marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-b"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.getAllByText('cancel')).toHaveLength(1);
    expect(screen.getByText(labels.incorrect)).toBeTruthy();
    expect(screen.queryByText(labels.correct)).toBeNull();
  });

  // @s5 — when the slide has an explanation, it is displayed together with the result.
  it('shows the explanation heading and text together with the result when provided', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        explanation="Paris has been the capital since the 12th century."
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getByText(labels.explanationHeading)).toBeTruthy();
    expect(screen.getByText('Paris has been the capital since the 12th century.')).toBeTruthy();
  });

  // @s5 — absent when no explanation is provided.
  it('does not show an explanation heading when none is provided', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.queryByText(labels.explanationHeading)).toBeNull();
  });

  // @s6 — once answered, a locked option does not fire onSelectOption on tap (single-select,
  // no re-selection).
  it('does not call onSelectOption when a locked option is tapped', async () => {
    const onSelectOption = jest.fn();
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        labels={labels}
        onSelectOption={onSelectOption}
      />,
    );

    fireEvent.press(screen.getAllByRole('button')[1]);

    expect(onSelectOption).not.toHaveBeenCalled();
  });

  // @s8 — a slide with no options is Empty: the unavailable notice replaces the question and
  // nothing is selectable.
  it('shows the unavailable notice and nothing selectable when there are no options', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={[]}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByText('What is the capital of France?')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByText(labels.correct)).toBeNull();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s9 — a malformed slide whose correctOptionId is not among its options degrades to the
  // unavailable notice instead of a broken question, and does not crash.
  it('shows the unavailable notice and nothing selectable when correctOptionId is not among the options', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-does-not-exist"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByText('What is the capital of France?')).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // @s11 — every option exposes a button role and an accessible label combining its marker and
  // option text (not just a bare `<Text>`), so assistive tech announces what each option is.
  it('exposes a button role and an accessible label for every option', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName('A Paris');
    expect(buttons[1]).toHaveAccessibleName('B Berlin');
  });

  // Full-review Round 1 (blocker) — once answered, the feedback icon's literal ligature name
  // (`check_circle`/`cancel`) must not leak into an option's accessible name; correctness is
  // conveyed via the name's wording instead (not just color/icon), matching @s11's accessible-
  // label requirement in the answered state too.
  it('conveys correctness through the accessible name, not the icon ligature, once answered', async () => {
    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-b"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName(`A Paris, ${labels.correct}`);
    expect(buttons[1]).toHaveAccessibleName(`B Berlin, ${labels.incorrect}`);
    buttons.forEach((button) => {
      expect(button).not.toHaveAccessibleName(/check_circle|cancel/);
    });
  });

  // @s11 — once answered correctly, the result is announced to assistive technology via a
  // *polite* live region (Android/Web): WAI-ARIA reserves assertive/`alert` for time-critical,
  // typically negative information that must interrupt current speech — a "Correct!" confirmation
  // is the majority, non-urgent, positive case, so it should not interrupt (full-review Round 1,
  // major finding). The imperative AccessibilityInfo.announceForAccessibility call still fires for
  // iOS parity (mirrors LoginForm's pattern), guaranteeing delivery regardless of politeness level.
  it('announces a correct result via a polite live region and AccessibilityInfo, without an alert role', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    const banner = screen.getByText(labels.correct);
    expect(banner.props.accessibilityLiveRegion).toBe('polite');
    expect(banner.parent?.props.accessibilityRole).toBeUndefined();
    expect(announceSpy).toHaveBeenCalledWith(labels.correct);

    announceSpy.mockRestore();
  });

  // @s11 — once answered incorrectly, the result keeps the more urgent alert role + assertive
  // live region: unlike the correct case, a wrong-answer result reveals new, unexpected
  // information (the correct option, elsewhere on screen) the learner didn't already know.
  it('announces an incorrect result via an alert role and an assertive live region', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        selectedOptionId="opt-b"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    const banner = screen.getByText(labels.incorrect);
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    expect(banner.parent?.props.accessibilityRole).toBe('alert');
    expect(announceSpy).toHaveBeenCalledWith(labels.incorrect);

    announceSpy.mockRestore();
  });

  // @s11 — no announcement fires while unanswered (nothing to announce yet).
  it('does not announce anything to assistive technology while unanswered', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );

    expect(announceSpy).not.toHaveBeenCalled();

    announceSpy.mockRestore();
  });

  // Mutation-kill (Full-review Round 1 mutation survivor) — pins the announce effect's dependency
  // array: an `[isUnavailable, answered, resultLabel]` → `[]` mutant would only run the effect
  // once, on the initial (unanswered) mount, and never again — so the real-world transition this
  // organism is controlled to support (a parent re-rendering it with a freshly-set
  // `selectedOptionId` once the learner answers, mirroring `MultipleChoiceActivity`) would never
  // be announced. Matches `login-form.test.tsx`'s identical `errorMessage` dependency-array guard.
  it('announces the result when a re-render transitions from unanswered to answered, not just on mount', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(
      <MultipleChoice
        question="What is the capital of France?"
        options={options}
        correctOptionId="opt-a"
        labels={labels}
        onSelectOption={jest.fn()}
      />,
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(
        <MultipleChoice
          question="What is the capital of France?"
          options={options}
          correctOptionId="opt-a"
          selectedOptionId="opt-a"
          labels={labels}
          onSelectOption={jest.fn()}
        />,
      );
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.correct));
    expect(announceSpy).toHaveBeenCalledTimes(1);

    announceSpy.mockRestore();
  });

  // Full-review Round 2 (m4, minor) — on Android, the result banner's own `accessibilityLiveRegion`
  // (`multiple-choice.tsx`, banner `Text`) already announces the result to TalkBack (RN docs mark
  // `accessibilityLiveRegion` as Android-only); firing the imperative
  // `AccessibilityInfo.announceForAccessibility` call there too risks a duplicate announcement.
  // iOS and web have no live-region equivalent, so they still need the imperative call.
  describe('platform-scoped imperative announcement (Android relies on the live region alone)', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      Platform.OS = originalOS;
    });

    it('does not call announceForAccessibility on Android once answered', async () => {
      Platform.OS = 'android';
      const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
      announceSpy.mockClear();

      await render(
        <MultipleChoice
          question="What is the capital of France?"
          options={options}
          correctOptionId="opt-a"
          selectedOptionId="opt-a"
          labels={labels}
          onSelectOption={jest.fn()}
        />,
      );

      expect(announceSpy).not.toHaveBeenCalled();

      announceSpy.mockRestore();
    });

    it.each(['ios', 'web'] as const)('still calls announceForAccessibility on %s once answered', async (os) => {
      Platform.OS = os;
      const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
      announceSpy.mockClear();

      await render(
        <MultipleChoice
          question="What is the capital of France?"
          options={options}
          correctOptionId="opt-a"
          selectedOptionId="opt-a"
          labels={labels}
          onSelectOption={jest.fn()}
        />,
      );

      expect(announceSpy).toHaveBeenCalledWith(labels.correct);

      announceSpy.mockRestore();
    });
  });
});
