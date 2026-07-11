jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { layout, lightColors } from '@helsoft/components';
import type { FlashcardAnswer, FlashcardSlide } from '@helsoft/types';

import { Flashcard } from './flashcard';

const I18N = {
  reveal: 'activity.flashcard.reveal',
  recalled: 'activity.flashcard.recalled',
  notRecalled: 'activity.flashcard.notRecalled',
  recalledConfirmed: 'activity.flashcard.recalledConfirmed',
  notRecalledConfirmed: 'activity.flashcard.notRecalledConfirmed',
  answerHeading: 'activity.flashcard.answerHeading',
  explanationHeading: 'activity.flashcard.explanationHeading',
  unavailable: 'activity.flashcard.unavailable',
} as const;

const slide: FlashcardSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Photosynthesis',
  content: 'What pigment absorbs light for photosynthesis?',
  position: 0,
  kind: 'activity',
  activityType: 'flashcard',
  back: 'Chlorophyll',
};

const revealButton = () => screen.getByRole('button', { name: I18N.reveal });
const recalledButton = () => screen.getByRole('button', { name: new RegExp(`^${I18N.recalled}`) });
const notRecalledButton = () =>
  screen.getByRole('button', { name: new RegExp(`^${I18N.notRecalled}`) });

const press = async (getter: () => ReturnType<typeof screen.getByRole>) => {
  await act(async () => {
    fireEvent.press(getter());
  });
};

describe('Flashcard', () => {
  // @s1 — only the front is visible; back hidden; Reveal available; no self-mark actions.
  it('renders only the front with a Reveal action and no self-mark actions', async () => {
    await render(<Flashcard slide={slide} />);

    expect(screen.getByText(slide.content)).toBeTruthy();
    expect(screen.queryByText(slide.back)).toBeNull();
    expect(revealButton()).toBeTruthy();
    expect(screen.queryByText(I18N.recalled)).toBeNull();
    expect(screen.queryByText(I18N.notRecalled)).toBeNull();
  });

  // @s2 — reveal shows the back alongside the front.
  it('shows the back alongside the front once revealed', async () => {
    await render(<Flashcard slide={slide} />);

    await press(revealButton);

    expect(screen.getByText(slide.content)).toBeTruthy();
    expect(screen.getByText(slide.back)).toBeTruthy();
    expect(screen.getByText(I18N.answerHeading)).toBeTruthy();
    expect(screen.queryByRole('button', { name: I18N.reveal })).toBeNull();
  });

  // @s3 — both self-mark actions available once revealed.
  it('shows both self-mark actions once revealed', async () => {
    await render(<Flashcard slide={slide} />);

    await press(revealButton);

    expect(recalledButton()).toBeTruthy();
    expect(notRecalledButton()).toBeTruthy();
    expect(recalledButton().props.accessibilityState.disabled).toBe(false);
    expect(notRecalledButton().props.accessibilityState.disabled).toBe(false);
  });

  // @s4 — choosing a self-mark locks it in, confirms it, and reports the answer once (@s6).
  it.each([
    { mark: 'Recalled' as const, recalled: true, getButton: () => recalledButton() },
    { mark: 'Not recalled' as const, recalled: false, getButton: () => notRecalledButton() },
  ])('locks in and confirms "$mark", reporting the answer exactly once', async ({ recalled, getButton }) => {
    const onAnswered = jest.fn();
    await render(<Flashcard slide={slide} onAnswered={onAnswered} />);

    await press(revealButton);
    await press(getButton);

    expect(recalledButton().props.accessibilityState.disabled).toBe(true);
    expect(notRecalledButton().props.accessibilityState.disabled).toBe(true);
    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: slide.id,
      activityType: 'flashcard',
      recalled,
      isCorrect: recalled,
    });
  });

  it('shows text and icon confirmation for the chosen mark, not color alone', async () => {
    await render(<Flashcard slide={slide} />);

    await press(revealButton);
    await press(recalledButton);

    expect(screen.getByText(I18N.recalledConfirmed)).toBeTruthy();
    expect(screen.getByText('check_circle')).toBeTruthy();
    expect(screen.getByRole('button', { name: I18N.recalledConfirmed }).props.accessibilityState.selected).toBe(true);
  });

  // Design-lens fix: the chosen mark's icon color must always agree with its own
  // (static) container chrome, and never imply a right/wrong judgment — this is a
  // self-report, not a graded answer.
  it.each([
    { mark: 'Recalled' as const, getButton: () => recalledButton(), iconName: 'check_circle' },
    { mark: 'Not recalled' as const, getButton: () => notRecalledButton(), iconName: 'cancel' },
  ])('gives the chosen "$mark" button an icon color consistent with its own container chrome', async ({ getButton, iconName }) => {
    await render(<Flashcard slide={slide} />);

    await press(revealButton);
    await press(getButton);

    const icon = screen.getByText(iconName);
    const button = getButton();

    expect(icon).toHaveStyle({ color: lightColors.onSecondaryContainer });
    expect(button).toHaveStyle({
      backgroundColor: lightColors.secondaryContainer,
      borderColor: lightColors.secondary,
    });
  });

  // @s5 — a locked self-mark cannot be changed or re-emitted (switch or re-tap, both ignored).
  it.each([
    { tapped: 'the other mark' as const, getButton: () => notRecalledButton() },
    { tapped: 'the same locked mark again' as const, getButton: () => recalledButton() },
  ])('ignores tapping $tapped once locked to Recalled', async ({ getButton }) => {
    const onAnswered = jest.fn();
    await render(<Flashcard slide={slide} onAnswered={onAnswered} />);

    await press(revealButton);
    await press(recalledButton);
    expect(onAnswered).toHaveBeenCalledTimes(1);

    await press(getButton);

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(screen.getByText(I18N.recalledConfirmed)).toBeTruthy();
    expect(screen.queryByText(I18N.notRecalledConfirmed)).toBeNull();
  });

  // @s7 — an explanation is shown alongside the revealed answer, before any self-mark.
  it('shows the explanation alongside the revealed answer when present', async () => {
    const explainedSlide = { ...slide, explanation: 'Chlorophyll reflects green light.' };
    await render(<Flashcard slide={explainedSlide} />);

    await press(revealButton);

    expect(screen.getByText(I18N.explanationHeading)).toBeTruthy();
    expect(screen.getByText(explainedSlide.explanation)).toBeTruthy();
  });

  it('does not show an explanation heading or body when none is provided', async () => {
    await render(<Flashcard slide={slide} />);

    await press(revealButton);

    expect(screen.queryByText(I18N.explanationHeading)).toBeNull();
    expect(screen.queryByTestId('flashcard-explanation')).toBeNull();
  });

  it('does not show the explanation before the answer is revealed', async () => {
    const explainedSlide = { ...slide, explanation: 'Chlorophyll reflects green light.' };
    await render(<Flashcard slide={explainedSlide} />);

    expect(screen.queryByText(I18N.explanationHeading)).toBeNull();
    expect(screen.queryByText(explainedSlide.explanation)).toBeNull();
  });

  // @s8 — a slide missing its front or back degrades to the unavailable notice, nothing
  // interactive, no crash, and `onAnswered` never fires.
  it.each([
    { missing: 'front/prompt' as const, invalidSlide: { ...slide, content: '' }, hiddenText: slide.back },
    { missing: 'back/answer' as const, invalidSlide: { ...slide, back: '' }, hiddenText: slide.content },
  ])('shows the unavailable notice and nothing interactive when the $missing is empty', async ({ invalidSlide, hiddenText }) => {
    const onAnswered = jest.fn();

    await render(<Flashcard slide={invalidSlide} onAnswered={onAnswered} />);

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByText(hiddenText)).toBeNull();
    expect(screen.queryByRole('button', { name: I18N.reveal })).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(onAnswered).not.toHaveBeenCalled();
  });

  // Storybook-demo support (FlashcardProps) — pre-marked / pre-revealed seeding.
  it('renders already revealed and locked when seeded with initialAnswer', async () => {
    const initialAnswer: FlashcardAnswer = {
      slideId: slide.id,
      activityType: 'flashcard',
      recalled: false,
      isCorrect: false,
    };
    await render(<Flashcard slide={slide} initialAnswer={initialAnswer} />);

    expect(screen.getByText(slide.back)).toBeTruthy();
    expect(screen.getByText(I18N.notRecalledConfirmed)).toBeTruthy();
    expect(recalledButton().props.accessibilityState.disabled).toBe(true);
  });

  it('renders already revealed but unmarked when seeded with initialRevealed', async () => {
    await render(<Flashcard slide={slide} initialRevealed />);

    expect(screen.getByText(slide.back)).toBeTruthy();
    expect(recalledButton().props.accessibilityState.disabled).toBe(false);
    expect(notRecalledButton().props.accessibilityState.disabled).toBe(false);
  });

  // @s10 — reveal + self-mark expose button role + accessible label; self-mark meets the
  // minimum touch-target size via the shared theme token (not a magic number).
  describe('accessibility', () => {
    it('exposes a button role and accessible label for reveal', async () => {
      await render(<Flashcard slide={slide} />);

      const reveal = revealButton();
      expect(reveal.props.accessibilityRole).toBe('button');
    });

    it('exposes a button role and accessible label for both self-mark actions', async () => {
      await render(<Flashcard slide={slide} />);

      await press(revealButton);

      for (const [getButton, label] of [
        [recalledButton, I18N.recalled],
        [notRecalledButton, I18N.notRecalled],
      ] as const) {
        const btn = getButton();
        expect(btn.props.accessibilityRole).toBe('button');
        expect(btn.props.accessibilityLabel).toBe(label);
      }
    });

    it('uses layout.touchTarget for self-mark minHeight', async () => {
      await render(<Flashcard slide={slide} />);

      await press(revealButton);

      expect(recalledButton()).toHaveStyle({ minHeight: layout.touchTarget });
      expect(notRecalledButton()).toHaveStyle({ minHeight: layout.touchTarget });
    });
  });
});
