jest.mock('@helsoft/localization', () => ({
  useLocalization: () => ({
    t: (key: string) => key,
  }),
}));

import { act, renderHook, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo, Platform } from 'react-native';

import { useOpenEnded } from './use-open-ended';

describe('useOpenEnded', () => {
  it('starts with empty draft, unlocked, and available', async () => {
    const { result } = await renderHook(() => useOpenEnded({}));

    expect(result.current.draft).toBe('');
    expect(result.current.submitted).toBe(false);
    expect(result.current.locked).toBe(false);
    expect(result.current.isUnavailable).toBe(false);
  });

  it('seeds draft and locks from initialSubmittedAnswer', async () => {
    const { result } = await renderHook(() => useOpenEnded({ initialSubmittedAnswer: 'my essay' }));

    expect(result.current.draft).toBe('my essay');
    expect(result.current.submitted).toBe(true);
    expect(result.current.locked).toBe(true);
  });

  it('locks empty-string rehydrate as submitted', async () => {
    const { result } = await renderHook(() => useOpenEnded({ initialSubmittedAnswer: '' }));

    expect(result.current.draft).toBe('');
    expect(result.current.submitted).toBe(true);
    expect(result.current.locked).toBe(true);
  });

  it('marks unavailable when unavailable prop is true', async () => {
    const { result } = await renderHook(() => useOpenEnded({ unavailable: true }));

    expect(result.current.isUnavailable).toBe(true);
    expect(result.current.locked).toBe(true);
  });

  it('updates draft via setDraft while unlocked', async () => {
    const { result } = await renderHook(() => useOpenEnded({}));

    await act(() => {
      result.current.setDraft('hello');
    });

    expect(result.current.draft).toBe('hello');
  });

  it('setSubmitted locks the interaction', async () => {
    const { result } = await renderHook(() => useOpenEnded({}));

    await act(() => {
      result.current.setDraft('hello');
      result.current.setSubmitted(true);
    });

    expect(result.current.submitted).toBe(true);
    expect(result.current.locked).toBe(true);
  });

  describe('AccessibilityInfo announcement', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
      Platform.OS = originalOS;
    });

    it('does not announce while unanswered', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useOpenEnded({}));

      expect(announceSpy).not.toHaveBeenCalled();
      announceSpy.mockRestore();
    });

    it('announces model-answer reveal when seeded submitted', async () => {
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useOpenEnded({ initialSubmittedAnswer: 'seed' }));

      await waitFor(() =>
        expect(announceSpy).toHaveBeenCalledWith('activity.openEnded.modelAnswer'),
      );
      announceSpy.mockRestore();
    });

    it('does not announce on Android', async () => {
      Platform.OS = 'android';
      const announceSpy = jest
        .spyOn(AccessibilityInfo, 'announceForAccessibility')
        .mockImplementation(() => {});
      announceSpy.mockClear();

      await renderHook(() => useOpenEnded({ initialSubmittedAnswer: 'seed' }));

      expect(announceSpy).not.toHaveBeenCalled();
      announceSpy.mockRestore();
    });
  });
});
