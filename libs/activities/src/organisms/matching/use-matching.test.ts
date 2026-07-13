import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';
import type {
  MatchingItemView,
  MatchingLabels,
  MatchingResult,
  UseMatchingProps,
} from './matching.types';
import { useMatching } from './use-matching';

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

const defaultProps: UseMatchingProps = {
  leftItems,
  rightItems,
  labels,
};

describe('useMatching', () => {
  it('starts unsubmitted with null pending, unlocked, and no result label', async () => {
    const { result } = await renderHook(() => useMatching(defaultProps));

    expect(result.current.pending).toBeNull();
    expect(result.current.formedPairs).toEqual([]);
    expect(result.current.locked).toBe(false);
    expect(result.current.allPaired).toBe(false);
    expect(result.current.resultLabel).toBeNull();
    expect(result.current.isUnavailable).toBe(false);
  });

  it('seeds formedPairs from initialPairs and reports allPaired when lengths match', async () => {
    const initialPairs = [
      { leftId: 'l1', rightId: 'r1' },
      { leftId: 'l2', rightId: 'r2' },
      { leftId: 'l3', rightId: 'r3' },
    ];
    const { result } = await renderHook(() => useMatching({ ...defaultProps, initialPairs }));

    expect(result.current.formedPairs).toEqual(initialPairs);
    expect(result.current.allPaired).toBe(true);
  });

  it('locks and surfaces the correct result label when result.isCorrect', async () => {
    const { result } = await renderHook(() =>
      useMatching({ ...defaultProps, result: allCorrectResult }),
    );

    expect(result.current.locked).toBe(true);
    expect(result.current.resultLabel).toBe(labels.correct);
  });

  it('surfaces the incorrect result label when result.isCorrect is false', async () => {
    const { result } = await renderHook(() =>
      useMatching({ ...defaultProps, result: mixedResult }),
    );

    expect(result.current.locked).toBe(true);
    expect(result.current.resultLabel).toBe(labels.incorrect);
  });

  it('marks unavailable when unavailable prop is true', async () => {
    const { result } = await renderHook(() => useMatching({ ...defaultProps, unavailable: true }));

    expect(result.current.isUnavailable).toBe(true);
  });

  it('marks unavailable when left column is empty', async () => {
    const { result } = await renderHook(() =>
      useMatching({ ...defaultProps, leftItems: [], rightItems }),
    );

    expect(result.current.isUnavailable).toBe(true);
  });

  it('marks unavailable when both columns are empty', async () => {
    const { result } = await renderHook(() =>
      useMatching({ ...defaultProps, leftItems: [], rightItems: [] }),
    );

    expect(result.current.isUnavailable).toBe(true);
  });

  it('marks unavailable when column lengths differ', async () => {
    const { result } = await renderHook(() =>
      useMatching({
        ...defaultProps,
        rightItems: [{ id: 'r1', label: 'Paris' }],
      }),
    );

    expect(result.current.isUnavailable).toBe(true);
  });

  describe('itemState', () => {
    it('returns pending for the pending selection only', async () => {
      const { result } = await renderHook(() => useMatching(defaultProps));

      await act(() => {
        result.current.setPending({ column: 'left', id: 'l1' });
      });

      expect(result.current.itemState('left', 'l1')).toBe('pending');
      expect(result.current.itemState('left', 'l2')).toBeUndefined();
      expect(result.current.itemState('right', 'l1')).toBeUndefined();
    });

    it('returns paired for items in formedPairs while unsubmitted', async () => {
      const { result } = await renderHook(() => useMatching(defaultProps));

      await act(() => {
        result.current.setFormedPairs([{ leftId: 'l1', rightId: 'r1' }]);
      });

      expect(result.current.itemState('left', 'l1')).toBe('paired');
      expect(result.current.itemState('right', 'r1')).toBe('paired');
      expect(result.current.itemState('left', 'l2')).toBeUndefined();
      expect(result.current.allPaired).toBe(false);
    });

    it('returns correct/incorrect from graded pairs and ignores pending/formedPairs', async () => {
      const { result } = await renderHook(() =>
        useMatching({
          ...defaultProps,
          initialPairs: [{ leftId: 'l1', rightId: 'r1' }],
          result: mixedResult,
        }),
      );

      await act(() => {
        result.current.setPending({ column: 'left', id: 'l2' });
      });

      expect(result.current.itemState('left', 'l1')).toBe('correct');
      expect(result.current.itemState('right', 'r1')).toBe('correct');
      expect(result.current.itemState('left', 'l2')).toBe('incorrect');
      expect(result.current.itemState('right', 'r3')).toBe('incorrect');
      // pending must not win once graded
      expect(result.current.itemState('left', 'l2')).not.toBe('pending');
    });

    it('returns undefined for items absent from result.pairs', async () => {
      const partialResult: MatchingResult = {
        pairs: [{ leftId: 'l1', rightId: 'r1', isCorrect: true }],
        isCorrect: false,
        summary: '1 of 3 correct',
      };
      const { result } = await renderHook(() =>
        useMatching({ ...defaultProps, result: partialResult }),
      );

      expect(result.current.itemState('left', 'l2')).toBeUndefined();
      expect(result.current.itemState('right', 'r2')).toBeUndefined();
    });
  });

  describe('AccessibilityInfo announcement', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      Platform.OS = originalOS;
    });

    it('does not announce while unsubmitted', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useMatching(defaultProps));

      expect(announceSpy).not.toHaveBeenCalled();
      announceSpy.mockRestore();
    });

    it('announces the correct label when result is correct', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useMatching({ ...defaultProps, result: allCorrectResult }));

      expect(announceSpy).toHaveBeenCalledWith(labels.correct);
      announceSpy.mockRestore();
    });

    it('announces the incorrect label when result is incorrect', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useMatching({ ...defaultProps, result: mixedResult }));

      expect(announceSpy).toHaveBeenCalledWith(labels.incorrect);
      announceSpy.mockRestore();
    });

    it('announces once when transitioning from unsubmitted to submitted', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      const { rerender } = await renderHook((props: UseMatchingProps) => useMatching(props), {
        initialProps: defaultProps,
      });

      expect(announceSpy).not.toHaveBeenCalled();

      await act(async () => {
        await rerender({ ...defaultProps, result: allCorrectResult });
      });

      await waitFor(() => expect(announceSpy).toHaveBeenCalledWith(labels.correct));
      expect(announceSpy).toHaveBeenCalledTimes(1);
      announceSpy.mockRestore();
    });

    it('does not announce on Android', async () => {
      Platform.OS = 'android';
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useMatching({ ...defaultProps, result: allCorrectResult }));

      expect(announceSpy).not.toHaveBeenCalled();
      announceSpy.mockRestore();
    });

    it.each(['ios', 'web'] as const)('still announces on %s', async (os) => {
      Platform.OS = os;
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useMatching({ ...defaultProps, result: allCorrectResult }));

      expect(announceSpy).toHaveBeenCalledWith(labels.correct);
      announceSpy.mockRestore();
    });
  });
});
