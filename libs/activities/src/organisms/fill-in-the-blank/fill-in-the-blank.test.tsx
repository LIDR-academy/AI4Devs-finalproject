import { AccessibilityInfo, Platform } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { layout } from '@helsoft/components';
import type { FillInTheBlankAnswer, FillInTheBlankSlide } from '@helsoft/types';

import { FillInTheBlank } from './fill-in-the-blank';

jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

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

const labels = {
  submit: 'activity.fillInTheBlank.submit',
  correct: 'activity.fillInTheBlank.correct',
  incorrect: 'activity.fillInTheBlank.incorrect',
  explanationHeading: 'activity.fillInTheBlank.explanationHeading',
  unavailable: 'activity.fillInTheBlank.unavailable',
  blankInput: 'activity.fillInTheBlank.blankInput',
};

const slide: FillInTheBlankSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'The capital of France is ____.',
  position: 0,
  kind: 'activity',
  activityType: 'fill-in-the-blank',
  acceptedAnswers: ['Paris', 'City of Light'],
};

const correctAnswer: FillInTheBlankAnswer = {
  slideId: slide.id,
  activityType: 'fill-in-the-blank',
  submittedAnswer: 'paris',
  acceptedAnswerShown: 'Paris',
  isCorrect: true,
};

const incorrectAnswer: FillInTheBlankAnswer = {
  slideId: slide.id,
  activityType: 'fill-in-the-blank',
  submittedAnswer: 'london',
  acceptedAnswerShown: 'Paris',
  isCorrect: false,
};

const blankInput = () => screen.getByLabelText(labels.blankInput);
const submitButton = () => screen.getByRole('button', { name: labels.submit });

const typeInBlank = async (text: string) => {
  await act(async () => {
    fireEvent.changeText(blankInput(), text);
  });
};

const pressSubmit = async () => {
  await act(async () => {
    fireEvent.press(submitButton());
  });
};

const submitEditing = async () => {
  await act(async () => {
    fireEvent(blankInput(), 'submitEditing');
  });
};

describe('FillInTheBlank', () => {
  // @s1 — unanswered inline blank + Submit enabled, no result.
  it('renders the prompt with an inline empty editable blank and enabled Submit, with no result', async () => {
    await render(<FillInTheBlank slide={slide} />);

    expect(screen.getByText('The capital of France is')).toBeTruthy();
    expect(screen.getByText('.')).toBeTruthy();

    const input = blankInput();
    expect(input.props.value).toBe('');
    expect(input.props.editable).not.toBe(false);

    expect(submitButton().props.accessibilityState?.disabled).not.toBe(true);

    expect(screen.queryByText(labels.correct)).toBeNull();
    expect(screen.queryByText(labels.incorrect)).toBeNull();
  });

  // @s1 — typing updates the blank while unanswered.
  it('updates the blank value when text changes while unanswered', async () => {
    await render(<FillInTheBlank slide={slide} />);

    await typeInBlank('Paris');

    expect(blankInput().props.value).toBe('Paris');
  });

  // @s2 — correct submit locks + banner + onAnswered once.
  it('shows the correct banner, locks the input, and calls onAnswered once on a correct submit', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlank slide={slide} onAnswered={onAnswered} />);

    await typeInBlank('paris');
    await pressSubmit();

    expect(screen.getByText(labels.correct)).toBeTruthy();
    expect(screen.getByText('check_circle', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('check_circle')).toBeNull();
    expect(blankInput().props.editable).toBe(false);
    expect(submitButton().props.accessibilityState.disabled).toBe(true);
    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: 'paris',
      acceptedAnswerShown: 'Paris',
      isCorrect: true,
    });
  });

  // Mutation kill — acceptedAnswerShown must not render when correct.
  it('does not reveal acceptedAnswerShown when the result is correct', async () => {
    await render(<FillInTheBlank slide={slide} initialAnswer={correctAnswer} />);

    expect(screen.getByText(labels.correct)).toBeTruthy();
    expect(screen.queryByText('Paris')).toBeNull();
  });

  // Mutation kill — blank-at-start: omit empty before Text.
  it('omits an empty before-blank Text when the marker is at the start', async () => {
    const { toJSON } = await render(
      <FillInTheBlank slide={{ ...slide, content: '____ is the capital.' }} />,
    );

    expect(screen.getByText(' is the capital.')).toBeTruthy();
    expect(collectEmptyTextNodes(toJSON())).toHaveLength(0);
  });

  // Mutation kill — blank-at-end: omit empty after Text.
  it('omits an empty after-blank Text when the marker is at the end', async () => {
    const { toJSON } = await render(
      <FillInTheBlank slide={{ ...slide, content: 'The capital is ____' }} />,
    );

    expect(screen.getByText('The capital is')).toBeTruthy();
    expect(collectEmptyTextNodes(toJSON())).toHaveLength(0);
  });

  // @s3 — incorrect submit reveals acceptedAnswers[0] + locks.
  it('shows the incorrect banner, reveals acceptedAnswerShown, and locks on incorrect submit', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlank slide={slide} onAnswered={onAnswered} />);

    await typeInBlank('london');
    await pressSubmit();

    expect(screen.getByText(labels.incorrect)).toBeTruthy();
    expect(screen.getByText('cancel', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText('Paris')).toBeTruthy();
    expect(blankInput().props.editable).toBe(false);
    expect(onAnswered).toHaveBeenCalledWith(
      expect.objectContaining({
        submittedAnswer: 'london',
        acceptedAnswerShown: 'Paris',
        isCorrect: false,
      }),
    );
  });

  // @s4 — explanation with result.
  it('shows the explanation heading and text together with the result when provided', async () => {
    const explainedSlide = {
      ...slide,
      explanation: 'Paris is the capital of France.',
    };
    await render(
      <FillInTheBlank slide={explainedSlide} initialAnswer={correctAnswer} />,
    );

    expect(screen.getByText(labels.explanationHeading)).toBeTruthy();
    expect(screen.getByText('Paris is the capital of France.')).toBeTruthy();
  });

  it('does not show an explanation heading when none is provided', async () => {
    await render(<FillInTheBlank slide={slide} initialAnswer={correctAnswer} />);

    expect(screen.queryByText(labels.explanationHeading)).toBeNull();
  });

  // @s5 — locked ignores edit and resubmit.
  it('does not change value or call onAnswered again when locked', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlank slide={slide} onAnswered={onAnswered} />);

    await typeInBlank('paris');
    await pressSubmit();
    expect(onAnswered).toHaveBeenCalledTimes(1);

    await act(async () => {
      fireEvent.changeText(blankInput(), 'hack');
      fireEvent.press(submitButton());
      fireEvent(blankInput(), 'submitEditing');
    });

    expect(blankInput().props.value).toBe('paris');
    expect(onAnswered).toHaveBeenCalledTimes(1);
  });

  // @s7 — Submit button and Enter share grading path.
  it('grades from the Submit control', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlank slide={slide} onAnswered={onAnswered} />);

    await typeInBlank('paris');
    await pressSubmit();

    expect(onAnswered).toHaveBeenCalledTimes(1);
  });

  it('grades from Enter/return on the blank', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlank slide={slide} onAnswered={onAnswered} />);

    await typeInBlank('paris');
    await submitEditing();

    expect(onAnswered).toHaveBeenCalledTimes(1);
  });

  // @s6 — empty value still allows Submit (grades incorrect).
  it('keeps Submit enabled and grades incorrect when the blank is empty', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlank slide={slide} onAnswered={onAnswered} />);

    expect(submitButton().props.accessibilityState?.disabled).not.toBe(true);

    await pressSubmit();

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(
      expect.objectContaining({
        submittedAnswer: '',
        acceptedAnswerShown: 'Paris',
        isCorrect: false,
      }),
    );
    expect(screen.getByText(labels.incorrect)).toBeTruthy();
  });

  // @s11/@s12 — unavailable when slide invalid or unrenderable blank.
  it('shows the unavailable notice when acceptedAnswers is empty', async () => {
    await render(<FillInTheBlank slide={{ ...slide, acceptedAnswers: [] }} />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.blankInput)).toBeNull();
    expect(screen.queryByRole('button', { name: labels.submit })).toBeNull();
  });

  it('shows the unavailable notice when acceptedAnswers contains an empty string', async () => {
    await render(<FillInTheBlank slide={{ ...slide, acceptedAnswers: [''] }} />);

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.blankInput)).toBeNull();
  });

  it('shows the unavailable notice when content has no blank marker', async () => {
    await render(
      <FillInTheBlank slide={{ ...slide, content: 'No blank here.' }} />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.blankInput)).toBeNull();
  });

  it('shows the unavailable notice when content has more than one blank marker', async () => {
    await render(
      <FillInTheBlank slide={{ ...slide, content: '____ is the capital of ____.' }} />,
    );

    expect(screen.getByText(labels.unavailable)).toBeTruthy();
    expect(screen.queryByLabelText(labels.blankInput)).toBeNull();
    expect(screen.queryByRole('button', { name: labels.submit })).toBeNull();
  });

  it('sets maxLength from the first accepted answer length', async () => {
    await render(<FillInTheBlank slide={slide} />);

    expect(blankInput().props.maxLength).toBe(7);
  });

  // @s14 — blank exposes accessible name.
  it('exposes an accessible name on the blank input', async () => {
    await render(<FillInTheBlank slide={slide} />);

    expect(blankInput()).toBeTruthy();
  });

  // @s14 / B1 — blank TextInput meets touch-target minHeight.
  it('gives the blank input a minHeight of layout.touchTarget', async () => {
    await render(<FillInTheBlank slide={slide} />);

    expect(blankInput()).toHaveStyle({
      minHeight: layout.touchTarget,
    });
  });

  // @s14 / M1 — locked blank exposes accessibilityState.disabled.
  it('sets accessibilityState.disabled on the blank when locked', async () => {
    await render(<FillInTheBlank slide={slide} />);
    expect(blankInput().props.accessibilityState?.disabled).not.toBe(true);

    await render(<FillInTheBlank slide={slide} initialAnswer={correctAnswer} />);
    expect(blankInput().props.accessibilityState.disabled).toBe(true);
  });

  // @s14 — Submit meets touch-target via Button hitSlop.
  it('exposes a Submit hitSlop that reaches the touch-target token', async () => {
    await render(<FillInTheBlank slide={slide} />);

    const { hitSlop } = submitButton().props;
    const BUTTON_MEDIUM_HEIGHT = 40;
    expect(hitSlop.top + hitSlop.bottom + BUTTON_MEDIUM_HEIGHT).toBeGreaterThanOrEqual(
      layout.touchTarget,
    );
  });

  // @s14 / M2 — correctness via text + decorative icon (icon hidden from AT).
  it('conveys correctness with text and a decorative icon hidden from the a11y tree', async () => {
    await render(<FillInTheBlank slide={slide} initialAnswer={correctAnswer} />);
    expect(screen.getByText(labels.correct)).toBeTruthy();
    const correctIcon = screen.getByText('check_circle', { includeHiddenElements: true });
    expect(correctIcon.parent?.props.accessibilityElementsHidden).toBe(true);
    expect(correctIcon.parent?.props.importantForAccessibility).toBe('no-hide-descendants');
    expect(screen.queryByText('check_circle')).toBeNull();

    await render(<FillInTheBlank slide={slide} initialAnswer={incorrectAnswer} />);
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

    await render(<FillInTheBlank slide={slide} initialAnswer={correctAnswer} />);

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

    await render(<FillInTheBlank slide={slide} initialAnswer={incorrectAnswer} />);

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

    await render(<FillInTheBlank slide={slide} />);

    expect(announceSpy).not.toHaveBeenCalled();

    announceSpy.mockRestore();
  });

  // @s14 — announce on unanswered → answered transition.
  it('announces the result when submit transitions from unanswered to answered', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<FillInTheBlank slide={slide} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await typeInBlank('paris');
    await pressSubmit();

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.correct));
    expect(announceSpy).toHaveBeenCalledTimes(1);

    announceSpy.mockRestore();
  });

  // @s14 / m1 — Android live region alone; iOS/web imperative announce.
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

      await render(<FillInTheBlank slide={slide} initialAnswer={correctAnswer} />);

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

        await render(<FillInTheBlank slide={slide} initialAnswer={correctAnswer} />);

        expect(announceSpy).toHaveBeenCalledWith(labels.correct);

        announceSpy.mockRestore();
      },
    );
  });
});
