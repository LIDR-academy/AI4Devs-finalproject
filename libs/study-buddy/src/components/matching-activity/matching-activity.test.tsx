jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

jest.mock('@helsoft/activities', () => {
  const actual = jest.requireActual('@helsoft/activities');
  return { ...actual, Matching: jest.fn(actual.Matching) };
});

import type { MatchingSlide } from '@helsoft/types';
import { Matching, MatchingProps } from '@helsoft/activities';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Pressable, Text } from 'react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { MatchingActivity } from './matching-activity';

const mockUseLocalization = useLocalization as jest.Mock;
const mockMatching = Matching as jest.Mock;
const actualMatching = jest.requireActual('@helsoft/activities').Matching;

/** Fake Matching that never locks — isolates the wrapper's re-submit guard. */
const AlwaysEnabledMatching = ({
  leftItems,
  rightItems,
  onSubmit,
  unavailable,
  labels,
}: MatchingProps) => {
  if (unavailable) {
    return <Text>{labels.unavailable}</Text>;
  }
  return (
    <>
      {leftItems.map((item) => (
        <Pressable key={item.id} accessibilityRole="button" onPress={() => {}}>
          <Text>{item.label}</Text>
        </Pressable>
      ))}
      {rightItems.map((item) => (
        <Pressable key={item.id} accessibilityRole="button" onPress={() => {}}>
          <Text>{item.label}</Text>
        </Pressable>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={labels.submit}
        onPress={() =>
          onSubmit([
            { leftId: 'l1', rightId: 'r1' },
            { leftId: 'l2', rightId: 'r2' },
            { leftId: 'l3', rightId: 'r3' },
          ])
        }
      >
        <Text>{labels.submit}</Text>
      </Pressable>
    </>
  );
};

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

const pairAll = async () => {
  const press = async (name: string) => {
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name }));
    });
  };
  await press('France');
  await press('Paris');
  await press('Germany');
  await press('Berlin');
  await press('Italy');
  await press('Rome');
};

describe('MatchingActivity', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue(localizationValue());
    mockMatching.mockImplementation(actualMatching);
    mockMatching.mockClear();
  });

  // @s8 — submit grades + locks.
  it('locks the activity after submit', async () => {
    await render(<MatchingActivity slide={slide} />);

    await pairAll();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.matching.submit' }));
    });

    for (const label of ['France', 'Germany', 'Italy', 'Paris', 'Berlin', 'Rome']) {
      const btn = screen.getByRole('button', { name: new RegExp(`^${label}`) });
      expect(btn.props.accessibilityState.disabled).toBe(true);
    }
  });

  // @s12 — answered state emitted once with partial counts; lock ignores re-submit.
  it('emits answered state once with correct partial counts and ignores re-submit', async () => {
    mockMatching.mockImplementation(AlwaysEnabledMatching);
    const onAnswered = jest.fn();
    await render(<MatchingActivity slide={slide} onAnswered={onAnswered} />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.matching.submit' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.matching.submit' }));
    });

    expect(onAnswered).toHaveBeenCalledTimes(1);
    expect(onAnswered).toHaveBeenCalledWith({
      slideId: 'slide-1',
      activityType: 'matching',
      pairs: [
        { leftId: 'l1', rightId: 'r1', isCorrect: true },
        { leftId: 'l2', rightId: 'r2', isCorrect: true },
        { leftId: 'l3', rightId: 'r3', isCorrect: true },
      ],
      correctPairCount: 3,
      totalPairCount: 3,
      isCorrect: true,
    });
  });

  // @s8,@s12 — slice integration: real grader + real organism.
  it('exposes graded answered state and renders feedback end to end', async () => {
    const onAnswered = jest.fn();
    await render(<MatchingActivity slide={slide} onAnswered={onAnswered} />);

    await pairAll();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.matching.submit' }));
    });

    expect(onAnswered).toHaveBeenCalledWith(
      expect.objectContaining({
        slideId: 'slide-1',
        activityType: 'matching',
        correctPairCount: 3,
        totalPairCount: 3,
        isCorrect: true,
      }),
    );
    expect(screen.getAllByText('check_circle')).toHaveLength(6);
    expect(screen.getByText('activity.matching.correct')).toBeTruthy();
  });

  // @s11 — explanation forwarded.
  it('forwards the slide explanation after submit', async () => {
    await render(<MatchingActivity slide={slide} />);

    await pairAll();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.matching.submit' }));
    });

    expect(screen.getByText('activity.matching.explanationHeading')).toBeTruthy();
    expect(screen.getByText('Capitals match their countries.')).toBeTruthy();
  });

  // @s15 — invalid slide ⇒ unavailable, grader never called.
  it('passes unavailable and never grades when the slide is invalid', async () => {
    const onAnswered = jest.fn();
    const invalid: MatchingSlide = {
      ...slide,
      correctPairs: [{ leftId: 'nope', rightId: 'r1' }],
    };

    await render(<MatchingActivity slide={invalid} onAnswered={onAnswered} />);

    expect(screen.getByText('activity.matching.unavailable')).toBeTruthy();
    expect(screen.queryByText('France')).toBeNull();
    expect(onAnswered).not.toHaveBeenCalled();
    expect(mockMatching.mock.calls.length).toBeGreaterThan(0);
    expect(mockMatching.mock.calls[0][0]).toEqual(expect.objectContaining({ unavailable: true }));
  });

  // Labels from t() (@s16) — chrome keys resolve via useLocalization.
  // Mutation: incorrect / correctPair / incorrectPair key strings must be asserted (not only submit).
  it('injects chrome labels from useLocalization', async () => {
    await render(<MatchingActivity slide={slide} />);

    expect(screen.getByText('activity.matching.submit')).toBeTruthy();
    expect(mockMatching.mock.calls[0][0].labels).toEqual(
      expect.objectContaining({
        submit: 'activity.matching.submit',
        correct: 'activity.matching.correct',
        incorrect: 'activity.matching.incorrect',
        correctPair: 'activity.matching.correctPair',
        incorrectPair: 'activity.matching.incorrectPair',
        explanationHeading: 'activity.matching.explanationHeading',
        unavailable: 'activity.matching.unavailable',
      }),
    );
  });

  // @s16 — summary interpolates {{correct}}/{{total}} from the graded answer.
  it('interpolates the summary string with correct and total pair counts', async () => {
    mockUseLocalization.mockReturnValue(
      localizationValue({
        t: (key: string, values?: Record<string, unknown>) => {
          if (key === 'activity.matching.summary' && values) {
            return `${values.correct} of ${values.total} correct`;
          }
          return key;
        },
      }),
    );
    await render(<MatchingActivity slide={slide} />);

    await pairAll();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'activity.matching.submit' }));
    });

    expect(screen.getByText('3 of 3 correct')).toBeTruthy();
  });
});
