import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { useResultsSummary } from './use-results-summary';

type HookProps = {
  variant: 'score' | 'completion';
  loading?: boolean;
  saveFailed?: boolean;
  saveFailedLabel?: string;
  scoreAnnouncement?: string;
  completeHeadline?: string;
};

const renderSummaryHook = (initialProps: HookProps) =>
  renderHook(
    (props: HookProps) =>
      useResultsSummary({
        saveFailedLabel: 'save failed',
        scoreAnnouncement: 'score ready',
        completeHeadline: 'complete',
        ...props,
      }),
    { initialProps },
  );

describe('useResultsSummary', () => {
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
      saveFailedLabel: 'save failed',
    });
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      await rerender({ variant: 'score', saveFailed: true, saveFailedLabel: 'save failed' });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('save failed'));
    announceSpy.mockRestore();
  });

  it('announces score content when loading resolves without save failure', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await renderSummaryHook({
      variant: 'score',
      loading: true,
      scoreAnnouncement: 'score ready',
    });

    await act(async () => {
      await rerender({
        variant: 'score',
        loading: false,
        scoreAnnouncement: 'score ready',
      });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('score ready'));
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
      saveFailedLabel: 'save failed',
      scoreAnnouncement: 'score ready',
    });

    await act(async () => {
      await rerender({
        variant: 'score',
        loading: false,
        saveFailed: true,
        saveFailedLabel: 'save failed',
        scoreAnnouncement: 'score ready',
      });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('save failed'));
    expect(announceSpy).not.toHaveBeenCalledWith('score ready');
    announceSpy.mockRestore();
  });
});
