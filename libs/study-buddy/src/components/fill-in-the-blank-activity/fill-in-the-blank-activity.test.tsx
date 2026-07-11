jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

jest.mock('@helsoft/activities', () => {
  const actual = jest.requireActual('@helsoft/activities');
  return { ...actual, FillInTheBlank: jest.fn(actual.FillInTheBlank) };
});

import type { FillInTheBlankSlide } from '@helsoft/types';
import { FillInTheBlank, FillInTheBlankProps } from '@helsoft/activities';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text, TextInput } from 'react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { FillInTheBlankActivity } from './fill-in-the-blank-activity';

const mockUseLocalization = useLocalization as jest.Mock;
const mockFillInTheBlank = FillInTheBlank as jest.Mock;
const actualFillInTheBlank = jest.requireActual('@helsoft/activities').FillInTheBlank;

/** Fake organism that never locks — isolates the wrapper's re-submit guard. */
const AlwaysEnabledFillIn = ({
  value,
  onChangeValue,
  onSubmit,
  unavailable,
  labels,
}: FillInTheBlankProps) => {
  if (unavailable) {
    return <Text>{labels.unavailable}</Text>;
  }
  return (
    <>
      <TextInput
        accessibilityLabel={labels.blankInput}
        value={value}
        onChangeText={onChangeValue}
      />
      <Pressable accessibilityRole="button" accessibilityLabel={labels.submit} onPress={onSubmit}>
        <Text>{labels.submit}</Text>
      </Pressable>
    </>
  );
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
  explanation: 'Paris is the capital of France.',
};

const blank = () => screen.getByLabelText('activity.fillInTheBlank.blankInput');
const submit = () => screen.getByRole('button', { name: 'activity.fillInTheBlank.submit' });

const typeAndSubmit = async (raw: string) => {
  await act(async () => {
    fireEvent.changeText(blank(), raw);
  });
  await act(async () => {
    fireEvent.press(submit());
  });
};

describe('FillInTheBlankActivity', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue(localizationValue());
    mockFillInTheBlank.mockImplementation(actualFillInTheBlank);
    mockFillInTheBlank.mockClear();
  });

  // @s2 — correct submit grades + locks.
  it('locks the blank after a correct submit', async () => {
    await render(<FillInTheBlankActivity slide={slide} />);

    await typeAndSubmit('paris');

    expect(screen.getByText('activity.fillInTheBlank.correct')).toBeTruthy();
    expect(blank().props.editable).toBe(false);
  });

  // @s3 — incorrect reveals acceptedAnswers[0] + locks.
  it('shows incorrect feedback and reveals acceptedAnswers[0] after a wrong submit', async () => {
    await render(<FillInTheBlankActivity slide={slide} />);

    await typeAndSubmit('london');

    expect(screen.getByText('activity.fillInTheBlank.incorrect')).toBeTruthy();
    expect(screen.getByText('Paris')).toBeTruthy();
    expect(blank().props.editable).toBe(false);
  });

  // @s5/@s7/@s10 — onAnswered once; ignore re-submit.
  it('emits answered state once and ignores re-submit', async () => {
    mockFillInTheBlank.mockImplementation(AlwaysEnabledFillIn);
    const onAnswered = jest.fn();
    await render(<FillInTheBlankActivity slide={slide} onAnswered={onAnswered} />);

    await typeAndSubmit('paris');
    await act(async () => {
      fireEvent.press(submit());
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: 'paris',
      acceptedAnswerShown: 'Paris',
      isCorrect: true,
    });
  });

  // @s7 — Enter path uses the same onSubmit (organism → wrapper).
  it('grades once when submitting via Enter on the blank', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlankActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.changeText(blank(), 'paris');
    });
    await act(async () => {
      fireEvent(blank(), 'submitEditing');
    });
    await act(async () => {
      fireEvent(blank(), 'submitEditing');
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith(
      expect.objectContaining({
        submittedAnswer: 'paris',
        isCorrect: true,
      }),
    );
  });

  // @s10 — slice integration: real grader + organism; concrete acceptedAnswerShown rules.
  it('exposes graded answered state and renders feedback end to end', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlankActivity slide={slide} onAnswered={onAnswered} />);

    await typeAndSubmit('city of light');

    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: 'city of light',
      acceptedAnswerShown: 'City of Light',
      isCorrect: true,
    });
    expect(screen.getByText('activity.fillInTheBlank.correct')).toBeTruthy();
    expect(screen.getByText('check_circle', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('check_circle')).toBeNull();
    expect(screen.getByText('activity.fillInTheBlank.explanationHeading')).toBeTruthy();
    expect(screen.getByText('Paris is the capital of France.')).toBeTruthy();
  });

  // @s10 — incorrect payload uses acceptedAnswers[0].
  it('emits acceptedAnswers[0] as acceptedAnswerShown when incorrect', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlankActivity slide={slide} onAnswered={onAnswered} />);

    await typeAndSubmit('');

    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: '',
      acceptedAnswerShown: 'Paris',
      isCorrect: false,
    });
  });

  // @s6 — empty submit resolves incorrect + reveal + lock end to end.
  it('resolves an empty submit as incorrect with reveal and lock', async () => {
    const onAnswered = jest.fn();
    await render(<FillInTheBlankActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(submit());
    });

    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-1',
      activityType: 'fill-in-the-blank',
      submittedAnswer: '',
      acceptedAnswerShown: 'Paris',
      isCorrect: false,
    });
    expect(screen.getByText('activity.fillInTheBlank.incorrect')).toBeTruthy();
    expect(screen.getByText('cancel', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('cancel')).toBeNull();
    expect(screen.getByText('Paris')).toBeTruthy();
    expect(blank().props.editable).toBe(false);
    expect(submit().props.accessibilityState.disabled).toBe(true);
  });

  // @s11 — empty acceptedAnswers list ⇒ unavailable, no grading.
  it('passes unavailable and never grades when acceptedAnswers is empty', async () => {
    const onAnswered = jest.fn();
    const invalid: FillInTheBlankSlide = { ...slide, acceptedAnswers: [] };

    await render(<FillInTheBlankActivity slide={invalid} onAnswered={onAnswered} />);

    expect(screen.getByText('activity.fillInTheBlank.unavailable')).toBeTruthy();
    expect(screen.queryByLabelText('activity.fillInTheBlank.blankInput')).toBeNull();
    expect(onAnswered).not.toHaveBeenCalled();
    expect(mockFillInTheBlank.mock.calls[0][0]).toEqual(
      expect.objectContaining({ unavailable: true }),
    );
  });

  // @s11 — empty-string entry in acceptedAnswers ⇒ unavailable.
  it('passes unavailable and never grades when acceptedAnswers contains an empty string', async () => {
    const onAnswered = jest.fn();
    const invalid: FillInTheBlankSlide = {
      ...slide,
      acceptedAnswers: ['Paris', ''],
    };

    await render(<FillInTheBlankActivity slide={invalid} onAnswered={onAnswered} />);

    expect(screen.getByText('activity.fillInTheBlank.unavailable')).toBeTruthy();
    expect(screen.queryByLabelText('activity.fillInTheBlank.blankInput')).toBeNull();
    expect(onAnswered).not.toHaveBeenCalled();
    expect(mockFillInTheBlank.mock.calls[0][0]).toEqual(
      expect.objectContaining({ unavailable: true }),
    );
  });

  // @s12 — missing blank marker ⇒ unavailable.
  it('passes unavailable and never grades when content has no blank marker', async () => {
    const onAnswered = jest.fn();
    const invalid: FillInTheBlankSlide = {
      ...slide,
      content: 'The capital of France is Paris.',
    };

    await render(<FillInTheBlankActivity slide={invalid} onAnswered={onAnswered} />);

    expect(screen.getByText('activity.fillInTheBlank.unavailable')).toBeTruthy();
    expect(screen.queryByLabelText('activity.fillInTheBlank.blankInput')).toBeNull();
    expect(onAnswered).not.toHaveBeenCalled();
  });

  // @s12 — multiple blank markers ⇒ unavailable.
  it('passes unavailable and never grades when content has multiple blank markers', async () => {
    const onAnswered = jest.fn();
    const invalid: FillInTheBlankSlide = {
      ...slide,
      content: '____ is the capital of ____.',
    };

    await render(<FillInTheBlankActivity slide={invalid} onAnswered={onAnswered} />);

    expect(screen.getByText('activity.fillInTheBlank.unavailable')).toBeTruthy();
    expect(screen.queryByLabelText('activity.fillInTheBlank.blankInput')).toBeNull();
    expect(onAnswered).not.toHaveBeenCalled();
  });

  // Labels from t() — chrome keys via useLocalization.
  it('injects chrome labels from useLocalization', async () => {
    await render(<FillInTheBlankActivity slide={slide} />);

    expect(screen.getByText('activity.fillInTheBlank.submit')).toBeTruthy();
    expect(mockFillInTheBlank.mock.calls[0][0].labels).toEqual({
      submit: 'activity.fillInTheBlank.submit',
      correct: 'activity.fillInTheBlank.correct',
      incorrect: 'activity.fillInTheBlank.incorrect',
      explanationHeading: 'activity.fillInTheBlank.explanationHeading',
      unavailable: 'activity.fillInTheBlank.unavailable',
      blankInput: 'activity.fillInTheBlank.blankInput',
    });
  });

  // maxLength = ceil(acceptedAnswers[0].length * 1.25).
  it('passes maxLength as ceil of first accepted answer length times 1.25', async () => {
    await render(<FillInTheBlankActivity slide={slide} />);

    // "Paris".length = 5 → ceil(5 * 1.25) = 7
    expect(mockFillInTheBlank.mock.calls[0][0].maxLength).toBe(7);
  });
});
