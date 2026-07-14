jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';

import { MultipleChoice } from './multiple-choice';

const I18N = {
  submit: 'activity.mcq.submit',
  correct: 'activity.mcq.correct',
  incorrect: 'activity.mcq.incorrect',
  explanation: 'activity.mcq.explanation',
  unavailable: 'activity.mcq.unavailable',
} as const;

const slide: MultipleChoiceSlide = {
  id: 'slide-1',
  lessonId: 'lesson-1',
  title: 'Capitals',
  content: 'What is the capital of France?',
  position: 0,
  kind: 'activity',
  activityType: 'multiple-choice',
  options: [
    { id: 'opt-a', label: 'Paris' },
    { id: 'opt-b', label: 'Berlin' },
  ],
  correctOptionId: 'opt-a',
};

const gradedAnswer = (
  selectedOptionId: string,
  isCorrect: boolean,
  slideOverride: MultipleChoiceSlide = slide,
): MultipleChoiceAnswer => ({
  slideId: slideOverride.id,
  activityType: 'multiple-choice',
  selectedOptionId,
  correctOptionId: slideOverride.correctOptionId,
  isCorrect,
});

const optionButton = (label: string) => screen.getByRole('button', { name: new RegExp(label) });
const submitButton = () => screen.getByRole('button', { name: I18N.submit });

const selectOption = async (label: string) => {
  await act(async () => {
    fireEvent.press(optionButton(label));
  });
};

const pressSubmit = async () => {
  await act(async () => {
    fireEvent.press(submitButton());
  });
};

describe('MultipleChoice', () => {
  it('renders the question and every option as visible and enabled, with Submit disabled and no result banner', async () => {
    await render(<MultipleChoice slide={slide} />);

    expect(screen.getByText(slide.content)).toBeTruthy();
    expect(screen.getByText('Paris')).toBeTruthy();
    expect(screen.getByText('Berlin')).toBeTruthy();

    expect(optionButton('Paris').props.accessibilityState.disabled).toBe(false);
    expect(optionButton('Berlin').props.accessibilityState.disabled).toBe(false);
    expect(submitButton().props.accessibilityState.disabled).toBe(true);

    expect(screen.queryByText(I18N.correct)).toBeNull();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  it('enables Submit after selecting an option without grading yet', async () => {
    const onAnswered = jest.fn();
    await render(<MultipleChoice slide={slide} onAnswered={onAnswered} />);

    await selectOption('Berlin');

    expect(submitButton().props.accessibilityState.disabled).toBe(false);
    expect(optionButton('Berlin').props.accessibilityState.selected).toBe(true);
    expect(onAnswered).not.toHaveBeenCalled();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  it('allows changing the selection before submit', async () => {
    await render(<MultipleChoice slide={slide} />);

    await selectOption('Berlin');
    await selectOption('Paris');

    expect(optionButton('Paris').props.accessibilityState.selected).toBe(true);
    expect(optionButton('Berlin').props.accessibilityState.selected).toBe(false);
  });

  it('calls onAnswered with the graded answer once when Submit is pressed', async () => {
    const onAnswered = jest.fn();
    await render(<MultipleChoice slide={slide} onAnswered={onAnswered} />);

    await selectOption('Berlin');
    await pressSubmit();

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(gradedAnswer('opt-b', false));
  });

  it('locks every option and hides Submit once answered via Submit', async () => {
    await render(<MultipleChoice slide={slide} />);

    await selectOption('Berlin');
    await pressSubmit();

    expect(optionButton('Paris').props.accessibilityState.disabled).toBe(true);
    expect(optionButton('Berlin').props.accessibilityState.disabled).toBe(true);
    expect(screen.queryByRole('button', { name: I18N.submit })).toBeNull();
  });

  it('locks every option and hides Submit when initialAnswer is provided', async () => {
    await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-b', false)} />);

    expect(optionButton('Paris').props.accessibilityState.disabled).toBe(true);
    expect(optionButton('Berlin').props.accessibilityState.disabled).toBe(true);
    expect(screen.queryByRole('button', { name: I18N.submit })).toBeNull();
  });

  it('marks the selected tile correct and shows the correct banner when submitted correctly', async () => {
    await render(<MultipleChoice slide={slide} />);

    await selectOption('Paris');
    await pressSubmit();

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText(I18N.correct)).toBeTruthy();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  it('marks the selected tile correct and shows the correct banner from initialAnswer', async () => {
    await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />);

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText(I18N.correct)).toBeTruthy();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  it('marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner when submitted incorrectly', async () => {
    await render(<MultipleChoice slide={slide} />);

    await selectOption('Berlin');
    await pressSubmit();

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.getAllByText('cancel')).toHaveLength(1);
    expect(screen.getByText(I18N.incorrect)).toBeTruthy();
    expect(screen.queryByText(I18N.correct)).toBeNull();
  });

  it('marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner from initialAnswer', async () => {
    await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-b', false)} />);

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.getAllByText('cancel')).toHaveLength(1);
    expect(screen.getByText(I18N.incorrect)).toBeTruthy();
    expect(screen.queryByText(I18N.correct)).toBeNull();
  });

  it('shows the explanation heading and text together with the result when provided', async () => {
    const slideWithExplanation: MultipleChoiceSlide = {
      ...slide,
      explanation: 'Paris has been the capital since the 12th century.',
    };
    await render(
      <MultipleChoice
        slide={slideWithExplanation}
        initialAnswer={gradedAnswer('opt-a', true, slideWithExplanation)}
      />,
    );

    expect(screen.getByText(I18N.explanation)).toBeTruthy();
    expect(screen.getByText('Paris has been the capital since the 12th century.')).toBeTruthy();
  });

  it('does not show an explanation heading when none is provided', async () => {
    await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />);

    expect(screen.queryByText(I18N.explanation)).toBeNull();
  });

  it('does not call onAnswered when a locked option is tapped', async () => {
    const onAnswered = jest.fn();
    await render(
      <MultipleChoice
        slide={slide}
        onAnswered={onAnswered}
        initialAnswer={gradedAnswer('opt-a', true)}
      />,
    );

    await act(async () => {
      fireEvent.press(optionButton('Berlin'));
    });

    expect(onAnswered).not.toHaveBeenCalled();
  });

  it('ignores a second submit and calls onAnswered exactly once', async () => {
    const onAnswered = jest.fn();
    await render(<MultipleChoice slide={slide} onAnswered={onAnswered} />);

    await selectOption('Berlin');
    await pressSubmit();

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(gradedAnswer('opt-b', false));
    expect(screen.queryByRole('button', { name: I18N.submit })).toBeNull();
  });

  it('shows the unavailable notice and nothing selectable when there are no options', async () => {
    const emptySlide: MultipleChoiceSlide = { ...slide, options: [] };
    await render(<MultipleChoice slide={emptySlide} />);

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByText(slide.content)).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByText(I18N.correct)).toBeNull();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  it('shows the unavailable notice when correctOptionId is not among the options', async () => {
    const malformedSlide: MultipleChoiceSlide = {
      ...slide,
      correctOptionId: 'opt-does-not-exist',
    };
    await render(<MultipleChoice slide={malformedSlide} />);

    expect(screen.getByText(I18N.unavailable)).toBeTruthy();
    expect(screen.queryByText(slide.content)).toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  it('exposes a button role and an accessible label for every option', async () => {
    await render(<MultipleChoice slide={slide} />);

    expect(optionButton('Paris')).toHaveAccessibleName('A Paris');
    expect(optionButton('Berlin')).toHaveAccessibleName('B Berlin');
  });

  it('conveys correctness through the accessible name, not the icon ligature, once answered', async () => {
    await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-b', false)} />);

    expect(optionButton('Paris')).toHaveAccessibleName(`A Paris, ${I18N.correct}`);
    expect(optionButton('Berlin')).toHaveAccessibleName(`B Berlin, ${I18N.incorrect}`);
    expect(optionButton('Paris')).not.toHaveAccessibleName(/check_circle|cancel/);
    expect(optionButton('Berlin')).not.toHaveAccessibleName(/check_circle|cancel/);
  });

  it('announces a correct result via a polite live region and AccessibilityInfo, without an alert role', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />);

    const banner = screen.getByText(I18N.correct);
    expect(banner.props.accessibilityLiveRegion).toBe('polite');
    expect(banner.parent?.props.accessibilityRole).toBeUndefined();
    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.correct));

    announceSpy.mockRestore();
  });

  it('announces an incorrect result via an alert role and an assertive live region', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-b', false)} />);

    const banner = screen.getByText(I18N.incorrect);
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    expect(banner.parent?.props.accessibilityRole).toBe('alert');
    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.incorrect));

    announceSpy.mockRestore();
  });

  it('does not announce anything to assistive technology while unanswered', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<MultipleChoice slide={slide} />);

    expect(announceSpy).not.toHaveBeenCalled();

    announceSpy.mockRestore();
  });

  it('announces the result when transitioning from unanswered to answered via Submit', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<MultipleChoice slide={slide} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await selectOption('Paris');
    await pressSubmit();

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.correct));
    expect(announceSpy).toHaveBeenCalledTimes(1);

    announceSpy.mockRestore();
  });

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

      await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />);

      expect(announceSpy).not.toHaveBeenCalled();

      announceSpy.mockRestore();
    });

    it.each([
      'ios',
      'web',
    ] as const)('still calls announceForAccessibility on %s once answered', async (os) => {
      Platform.OS = os;
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await render(<MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />);

      await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.correct));

      announceSpy.mockRestore();
    });
  });
});
