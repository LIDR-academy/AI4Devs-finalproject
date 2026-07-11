jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import { AccessibilityInfo, Platform } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';

import { MultipleChoice } from './multiple-choice';

const I18N = {
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

describe('MultipleChoice', () => {
  it('renders the question and every option as visible and enabled, with no result banner', async () => {
    await render(<MultipleChoice slide={slide} />);

    expect(screen.getByText(slide.content)).toBeTruthy();
    expect(screen.getByText('Paris')).toBeTruthy();
    expect(screen.getByText('Berlin')).toBeTruthy();

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    buttons.forEach((button) => expect(button.props.accessibilityState.disabled).toBe(false));

    expect(screen.queryByText(I18N.correct)).toBeNull();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  it('calls onAnswered with the graded answer once when an option is tapped', async () => {
    const onAnswered = jest.fn();
    await render(<MultipleChoice slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[1]);
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(gradedAnswer('opt-b', false));
  });

  it('locks every option once answered via tap', async () => {
    await render(<MultipleChoice slide={slide} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[1]);
    });

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => expect(button.props.accessibilityState.disabled).toBe(true));
  });

  it('locks every option when initialAnswer is provided', async () => {
    await render(
      <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-b', false)} />,
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => expect(button.props.accessibilityState.disabled).toBe(true));
  });

  it('marks the selected tile correct and shows the correct banner when tapped correctly', async () => {
    await render(<MultipleChoice slide={slide} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[0]);
    });

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText(I18N.correct)).toBeTruthy();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  it('marks the selected tile correct and shows the correct banner from initialAnswer', async () => {
    await render(
      <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />,
    );

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText(I18N.correct)).toBeTruthy();
    expect(screen.queryByText(I18N.incorrect)).toBeNull();
  });

  it('marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner when tapped incorrectly', async () => {
    await render(<MultipleChoice slide={slide} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[1]);
    });

    expect(screen.getAllByText('check_circle')).toHaveLength(1);
    expect(screen.getAllByText('cancel')).toHaveLength(1);
    expect(screen.getByText(I18N.incorrect)).toBeTruthy();
    expect(screen.queryByText(I18N.correct)).toBeNull();
  });

  it('marks the selected tile incorrect, reveals the correct tile, and shows the incorrect banner from initialAnswer', async () => {
    await render(
      <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-b', false)} />,
    );

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
    await render(
      <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />,
    );

    expect(screen.queryByText(I18N.explanation)).toBeNull();
  });

  it('does not call onAnswered when a locked option is tapped', async () => {
    const onAnswered = jest.fn();
    await render(
      <MultipleChoice slide={slide} onAnswered={onAnswered} initialAnswer={gradedAnswer('opt-a', true)} />,
    );

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[1]);
    });

    expect(onAnswered).not.toHaveBeenCalled();
  });

  it('ignores a second tap and calls onAnswered exactly once', async () => {
    const onAnswered = jest.fn();
    await render(<MultipleChoice slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[1]);
    });
    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[0]);
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(gradedAnswer('opt-b', false));
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

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName('A Paris');
    expect(buttons[1]).toHaveAccessibleName('B Berlin');
  });

  it('conveys correctness through the accessible name, not the icon ligature, once answered', async () => {
    await render(
      <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-b', false)} />,
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toHaveAccessibleName(`A Paris, ${I18N.correct}`);
    expect(buttons[1]).toHaveAccessibleName(`B Berlin, ${I18N.incorrect}`);
    buttons.forEach((button) => {
      expect(button).not.toHaveAccessibleName(/check_circle|cancel/);
    });
  });

  it('announces a correct result via a polite live region and AccessibilityInfo, without an alert role', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />,
    );

    const banner = screen.getByText(I18N.correct);
    expect(banner.props.accessibilityLiveRegion).toBe('polite');
    expect(banner.parent?.props.accessibilityRole).toBeUndefined();
    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.correct));

    announceSpy.mockRestore();
  });

  it('announces an incorrect result via an alert role and an assertive live region', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(
      <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-b', false)} />,
    );

    const banner = screen.getByText(I18N.incorrect);
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    expect(banner.parent?.props.accessibilityRole).toBe('alert');
    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.incorrect));

    announceSpy.mockRestore();
  });

  it('does not announce anything to assistive technology while unanswered', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<MultipleChoice slide={slide} />);

    expect(announceSpy).not.toHaveBeenCalled();

    announceSpy.mockRestore();
  });

  it('announces the result when transitioning from unanswered to answered via tap', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<MultipleChoice slide={slide} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.press(screen.getAllByRole('button')[0]);
    });

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
      const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
      announceSpy.mockClear();

      await render(
        <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />,
      );

      expect(announceSpy).not.toHaveBeenCalled();

      announceSpy.mockRestore();
    });

    it.each(['ios', 'web'] as const)('still calls announceForAccessibility on %s once answered', async (os) => {
      Platform.OS = os;
      const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
      announceSpy.mockClear();

      await render(
        <MultipleChoice slide={slide} initialAnswer={gradedAnswer('opt-a', true)} />,
      );

      await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(I18N.correct));

      announceSpy.mockRestore();
    });
  });
});
