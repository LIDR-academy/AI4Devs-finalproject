jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useLocalization } from '@helsoft/localization';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import type { PdfUploadPanelState } from './pdf-upload-panel.types';
import { usePdfUploadPanel } from './use-pdf-upload-panel';

const mockUseLocalization = useLocalization as jest.Mock;

type HookProps = {
  state: PdfUploadPanelState;
  errorMessage?: string;
};

describe('usePdfUploadPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue({ t: (key: string) => key });
  });

  it('derives isLoading only when state is loading', async () => {
    const { result, rerender } = await renderHook(
      ({ state }: HookProps) => usePdfUploadPanel({ state }),
      { initialProps: { state: 'idle' } },
    );

    expect(result.current?.isLoading).toBe(false);

    await act(async () => {
      await rerender({ state: 'loading' });
    });
    expect(result.current?.isLoading).toBe(true);

    await act(async () => {
      await rerender({ state: 'content' });
    });
    expect(result.current?.isLoading).toBe(false);
  });

  it('announces loading copy via AccessibilityInfo when isLoading becomes true', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await renderHook(
      ({ state }: HookProps) => usePdfUploadPanel({ state }),
      { initialProps: { state: 'idle' } },
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      await rerender({ state: 'loading' });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('upload.loading'));
    announceSpy.mockRestore();
  });

  it('announces errorMessage via AccessibilityInfo when set', async () => {
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await renderHook(
      ({ errorMessage }: HookProps) => usePdfUploadPanel({ state: 'error', errorMessage }),
      { initialProps: { state: 'error', errorMessage: undefined } },
    );
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      await rerender({ state: 'error', errorMessage: 'upload.error.network' });
    });

    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('upload.error.network'));
    announceSpy.mockRestore();
  });

  it('exposes t from useLocalization', async () => {
    const t = jest.fn((key: string) => `t:${key}`);
    mockUseLocalization.mockReturnValue({ t });

    const { result } = await renderHook(() => usePdfUploadPanel({ state: 'idle' }));

    expect(result.current?.t('upload.chooseFile')).toBe('t:upload.chooseFile');
  });
});
