jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useLocalization } from '@helsoft/localization';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useResultsSummary } from './use-results-summary';

const mockUseLocalization = useLocalization as jest.Mock;

const t = (key: string, options?: Record<string, unknown>) => {
  if (key === 'results.score') return `${options?.correct} / ${options?.total}`;
  if (key === 'results.scorePercent') return `${options?.percent}%`;
  if (key === 'results.scoreAnnouncement') return `${options?.score}, ${options?.percent}`;
  if (key === 'results.saveFailed') return 'save failed';
  if (key === 'results.completeHeadline') return 'complete';
  return key;
};

type HookProps = {
  variant: 'score' | 'completion';
  loading?: boolean;
  saveFailed?: boolean;
  correct?: number;
  total?: number;
};

const renderSummaryHook = (initialProps: HookProps) =>
  renderHook((props: HookProps) => useResultsSummary(props), { initialProps });

describe('useResultsSummary', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue({ t });
  });

  it('showSaveFailure is true only for score + saveFailed', async () => {
    const { result, rerender } = await renderSummaryHook({
      variant: 'score',
      saveFailed: true,
    });
    expect(result.current?.showSaveFailure).toBe(true);

    await act(async () => {
      await rerender({ variant: 'completion', saveFailed: true });
    });
    expect(result.current?.showSaveFailure).toBe(false);
  });

  it('announces saveFailed when showSaveFailure becomes true', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await renderSummaryHook({
      variant: 'score',
      saveFailed: false,
    });
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      await rerender({ variant: 'score', saveFailed: true });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('save failed'));
    announceSpy.mockRestore();
  });

  it('announces the derived score content when loading resolves without save failure', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await renderSummaryHook({
      variant: 'score',
      loading: true,
      correct: 3,
      total: 3,
    });

    await act(async () => {
      await rerender({
        variant: 'score',
        loading: false,
        correct: 3,
        total: 3,
      });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('3 / 3, 100%'));
    announceSpy.mockRestore();
  });

  it('skips content announcement when loading resolves into save failure', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await renderSummaryHook({
      variant: 'score',
      loading: true,
      saveFailed: false,
      correct: 3,
      total: 3,
    });

    await act(async () => {
      await rerender({
        variant: 'score',
        loading: false,
        saveFailed: true,
        correct: 3,
        total: 3,
      });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('save failed'));
    expect(announceSpy).not.toHaveBeenCalledWith('3 / 3, 100%');
    announceSpy.mockRestore();
  });
});
