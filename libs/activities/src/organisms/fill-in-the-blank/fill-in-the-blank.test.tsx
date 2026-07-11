import { AccessibilityInfo, Platform } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { layout } from '@helsoft/components';

import {
  FillInTheBlank,
  FillInTheBlankLabels,
  FillInTheBlankResult,
} from './fill-in-the-blank';

/** Collect Text nodes whose only content is an empty string (mutation probe for omit-empty guards). */
const collectEmptyTextNodes = (node: unknown, out: unknown[] = []): unknown[] => {
  if (node == null) return out;
  if (Array.isArray(node)) {
    for (const child of node) collectEmptyTextNodes(child, out);
    return out;
  }
  if (typeof node === 'object') {
    const record = node as { type?: unknown; children?: unknown };
    if (record.type === 'Text') {
      const kids = record.children;
      if (
        kids === '' ||
        kids == null ||
        (Array.isArray(kids) && (kids.length === 0 || kids.every((c) => c === '')))
      ) {
        out.push(node);
      }
    }
    if ('children' in record) collectEmptyTextNodes(record.children, out);
  }
  return out;
};

const labels: FillInTheBlankLabels = {
  submit: 'Submit',
  correct: 'Correct!',
  incorrect: 'Incorrect',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
  blankInput: 'Fill in the blank',
};

const defaultProps = {
  content: 'The capital of France is ____.',
  value: '',
  maxLength: 10,
  labels,
  onChangeValue: jest.fn(),
  onSubmit: jest.fn(),
};

const correctResult: FillInTheBlankResult = { isCorrect: true, acceptedAnswerShown: 'Paris' };
const incorrectResult: FillInTheBlankResult = {
  isCorrect: false,
  acceptedAnswerShown: 'Paris',
};

describe('FillInTheBlank', () => {
  // @s1 — unanswered inline blank + Submit enabled, no result.
  it('renders the prompt with an inline empty editable blank and enabled Submit, with no result', async () => {
    await render(<FillInTheBlank {...defaultProps} />);

    expect(screen.getByText('The capital of France is')).toBeTruthy();
    expect(screen.getByText('.')).toBeTruthy();

    const input = screen.getByLabelText(labels.blankInput);
    expect(input).toBeTruthy();
    expect(input.props.value).toBe('');
    expect(input.props.editable).not.toBe(false);

    const submit = screen.getByRole('button', { name: labels.submit });
    expect(submit.props.accessibilityState?.disabled).not.toBe(true);

    expect(screen.queryByText(labels.correct)).toBeNull();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s1 — reports typed value up while unanswered.
  it('calls onChangeValue when the blank text changes while unanswered', async () => {
    const onChangeValue = jest.fn();
    await render(<FillInTheBlank {...defaultProps} onChangeValue={onChangeValue} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText(labels.blankInput), 'Paris');
    });

    expect(onChangeValue).toHaveBeenCalledWith('Paris');
  });

  // @s2 — correct result locks + banner.
  it('shows the correct banner and locks the input once result is correct', async () => {
    await render(
      <FillInTheBlank {...defaultProps} value="paris" result={correctResult} />,
    );

    expect(screen.getByText(labels.correct)).toBeTruthy();
    expect(screen.getByText('check_circle', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('check_circle')).toBeNull();
    expect(screen.getByLabelText(labels.blankInput).props.editable).toBe(false);
    expect(screen.getByRole('button', { name: labels.submit }).props.accessibilityState.disabled).toBe(
      true,
    );
  });

  // Mutation kill — acceptedAnswerShown must not render when correct (:129).
  it('does not reveal acceptedAnswerShown when the result is correct', async () => {
    await render(
      <FillInTheBlank {...defaultProps} value="paris" result={correctResult} />,
    );

    expect(screen.getByText(labels.correct)).toBeTruthy();
    expect(screen.queryByText('Paris')).toBeNull();
  });

  // Mutation kill — blank-at-start: omit empty before Text (:88).
  it('omits an empty before-blank Text when the marker is at the start', async () => {
    const { toJSON } = await render(
      <FillInTheBlank {...defaultProps} content="____ is the capital." />,
    );

    expect(screen.getByText(' is the capital.')).toBeTruthy();
    expect(collectEmptyTextNodes(toJSON())).toHaveLength(0);
  });

  // Mutation kill — blank-at-end: omit empty after Text (:99).
  it('omits an empty after-blank Text when the marker is at the end', async () => {
    const { toJSON } = await render(
      <FillInTheBlank {...defaultProps} content="The capital is ____" />,
    );

    expect(screen.getByText('The capital is')).toBeTruthy();
    expect(collectEmptyTextNodes(toJSON())).toHaveLength(0);
  });

  // @s3 — incorrect result reveals acceptedAnswerShown + locks.
  it('shows the incorrect banner, reveals acceptedAnswerShown, and locks when incorrect', async () => {
    await render(
      <FillInTheBlank {...defaultProps} value="london" result={incorrectResult} />,
    );

    expect(screen.getByText(labels.incorrect)).toBeTruthy();
    expect(screen.getByText('cancel', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText('Paris')).toBeTruthy();
    expect(screen.getByLabelText(labels.blankInput).props.editable).toBe(false);
  });

  // @s4 — explanation with result.
  it('shows the explanation heading and text together with the result when provided', async () => {
    await render(
      <FillInTheBlank
        {...defaultProps}
        result={correctResult}
        explanation="Paris is the capital of France."
      />,
    );

    expect(screen.getByText(labels.explanationHeading)).toBeTruthy();
    expect(screen.getByText('Paris is the capital of France.')).toBeTruthy();
  });

  it('does not show an explanation heading when none is provided', async () => {
    await render(<FillInTheBlank {...defaultProps} result={correctResult} />);

    expect(screen.queryByText(labels.explanationHeading)).toBeNull();
  });

  // @s5 — locked ignores edit and resubmit.
  it('does not call onChangeValue or onSubmit when locked', async () => {
    const onChangeValue = jest.fn();
    const onSubmit = jest.fn();
    await render(
      <FillInTheBlank
        {...defaultProps}
        value="paris"
        result={correctResult}
        onChangeValue={onChangeValue}
        onSubmit={onSubmit}
      />,
    );

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText(labels.blankInput), 'hack');
      fireEvent.press(screen.getByRole('button', { name: labels.submit }));
      fireEvent(screen.getByLabelText(labels.blankInput), 'submitEditing');
    });

    expect(onChangeValue).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // @s7 — Submit button and Enter share onSubmit.
  it('invokes onSubmit from the Submit control', async () => {
    const onSubmit = jest.fn();
    await render(<FillInTheBlank {...defaultProps} value="paris" onSubmit={onSubmit} />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: labels.submit }));
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('invokes onSubmit from Enter/return on the blank', async () => {
    const onSubmit = jest.fn();
    await render(<FillInTheBlank {...defaultProps} value="paris" onSubmit={onSubmit} />);

    await act(async () => {
      fireEvent(screen.getByLabelText(labels.blankInput), 'submitEditing');
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // @s6 — empty value still allows Submit (grades incorrect upstream).
  it('keeps Submit enabled and invokes onSubmit when the blank is empty', async () => {
    const onSubmit = jest.fn();
    await render(<FillInTheBlank {...defaultProps} value="" onSubmit={onSubmit} />);

    const submit = screen.getByRole('button', { name: labels.submit });
    expect(submit.props.accessibilityState?.disabled).not.toBe(true);

    await act(async () => {
      fireEvent.press(submit);
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  // @s11/@s12 — unavailable prop or unrenderable blank.
  it('shows the unavailable notice when unavailable is set', async () => {
    await render(<FillInTheBlank {...defaultProps} unavailable />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.blankInput)).toBeNull();
    expect(screen.queryByRole('button', { name: labels.submit })).toBeNull();
  });

  it('shows the unavailable notice when content has no blank marker', async () => {
    await render(<FillInTheBlank {...defaultProps} content="No blank here." />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.blankInput)).toBeNull();
  });

  // @s12 — multiple blank markers are unrenderable.
  it('shows the unavailable notice when content has more than one blank marker', async () => {
    await render(
      <FillInTheBlank {...defaultProps} content="____ is the capital of ____." />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.blankInput)).toBeNull();
    expect(screen.queryByRole('button', { name: labels.submit })).toBeNull();
  });

  it('respects maxLength on the blank input', async () => {
    await render(<FillInTheBlank {...defaultProps} maxLength={7} />);

    expect(screen.getByLabelText(labels.blankInput).props.maxLength).toBe(7);
  });

  // @s14 — blank exposes accessible name.
  it('exposes an accessible name on the blank input', async () => {
    await render(<FillInTheBlank {...defaultProps} />);

    expect(screen.getByLabelText(labels.blankInput)).toBeTruthy();
  });

  // @s14 / B1 — blank TextInput meets touch-target minHeight.
  it('gives the blank input a minHeight of layout.touchTarget', async () => {
    await render(<FillInTheBlank {...defaultProps} />);

    expect(screen.getByLabelText(labels.blankInput)).toHaveStyle({
      minHeight: layout.touchTarget,
    });
  });

  // @s14 / M1 — locked blank exposes accessibilityState.disabled.
  it('sets accessibilityState.disabled on the blank when locked', async () => {
    await render(<FillInTheBlank {...defaultProps} />);
    expect(screen.getByLabelText(labels.blankInput).props.accessibilityState?.disabled).not.toBe(
      true,
    );

    await render(
      <FillInTheBlank {...defaultProps} value="paris" result={correctResult} />,
    );
    expect(screen.getByLabelText(labels.blankInput).props.accessibilityState.disabled).toBe(true);
  });

  // @s14 — Submit meets touch-target via Button hitSlop.
  it('exposes a Submit hitSlop that reaches the touch-target token', async () => {
    await render(<FillInTheBlank {...defaultProps} />);

    const { hitSlop } = screen.getByRole('button', { name: labels.submit }).props;
    const BUTTON_MEDIUM_HEIGHT = 40;
    expect(hitSlop.top + hitSlop.bottom + BUTTON_MEDIUM_HEIGHT).toBeGreaterThanOrEqual(
      layout.touchTarget,
    );
  });

  // @s14 / M2 — correctness via text + decorative icon (icon hidden from AT).
  it('conveys correctness with text and a decorative icon hidden from the a11y tree', async () => {
    await render(<FillInTheBlank {...defaultProps} result={correctResult} />);
    expect(screen.getByText(labels.correct)).toBeTruthy();
    const correctIcon = screen.getByText('check_circle', { includeHiddenElements: true });
    expect(correctIcon.parent?.props.accessibilityElementsHidden).toBe(true);
    expect(correctIcon.parent?.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(screen.queryByText('check_circle')).toBeNull();

    await render(<FillInTheBlank {...defaultProps} result={incorrectResult} />);
    expect(screen.getByText(labels.incorrect)).toBeTruthy();
    const incorrectIcon = screen.getByText('cancel', { includeHiddenElements: true });
    expect(incorrectIcon.parent?.props.accessibilityElementsHidden).toBe(true);
    expect(incorrectIcon.parent?.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(screen.queryByText('cancel')).toBeNull();
  });

  // @s14 — correct result announced politely without alert role.
  it('announces a correct result via a polite live region and AccessibilityInfo, without an alert role', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<FillInTheBlank {...defaultProps} result={correctResult} />);

    const banner = screen.getByText(labels.correct);
    expect(banner.props.accessibilityLiveRegion).toBe('polite');
    expect(banner.parent?.props.accessibilityRole).toBeUndefined();
    expect(announceSpy).toHaveBeenCalledWith(labels.correct);

    announceSpy.mockRestore();
  });

  // @s14 — incorrect result uses alert + assertive live region.
  it('announces an incorrect result via an alert role and an assertive live region', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<FillInTheBlank {...defaultProps} result={incorrectResult} />);

    const banner = screen.getByText(labels.incorrect);
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    expect(banner.parent?.props.accessibilityRole).toBe('alert');
    expect(announceSpy).toHaveBeenCalledWith(labels.incorrect);

    announceSpy.mockRestore();
  });

  // @s14 — no announcement while unanswered.
  it('does not announce anything to assistive technology while unanswered', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<FillInTheBlank {...defaultProps} />);

    expect(announceSpy).not.toHaveBeenCalled();

    announceSpy.mockRestore();
  });

  // @s14 — announce on unanswered → answered transition.
  it('announces the result when a re-render transitions from unanswered to answered', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(<FillInTheBlank {...defaultProps} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(<FillInTheBlank {...defaultProps} result={correctResult} />);
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.correct));
    expect(announceSpy).toHaveBeenCalledTimes(1);

    announceSpy.mockRestore();
  });

  // @s14 / m1 — Matching/MCQ pattern: Android live region alone; iOS/web imperative announce.
  // RN docs: accessibilityLiveRegion is Android-only; announceForAccessibility covers iOS/web.
  // Skipping imperative announce on Android avoids duplicate TalkBack with the live region.
  describe('platform-scoped imperative announcement (Android relies on the live region alone)', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      Platform.OS = originalOS;
    });

    it('does not call announceForAccessibility on Android once answered', async () => {
      Platform.OS = 'android';
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await render(<FillInTheBlank {...defaultProps} result={correctResult} />);

      expect(announceSpy).not.toHaveBeenCalled();
      expect(screen.getByText(labels.correct).props.accessibilityLiveRegion).toBe('polite');

      announceSpy.mockRestore();
    });

    it.each(['ios', 'web'] as const)(
      'still calls announceForAccessibility on %s once answered',
      async (os) => {
        Platform.OS = os;
        const announceSpy = jest
          .spyOn(AccessibilityInfo, 'announceForAccessibility')
          .mockImplementation(() => {});
        announceSpy.mockClear();

        await render(<FillInTheBlank {...defaultProps} result={correctResult} />);

        expect(announceSpy).toHaveBeenCalledWith(labels.correct);

        announceSpy.mockRestore();
      },
    );
  });
});
