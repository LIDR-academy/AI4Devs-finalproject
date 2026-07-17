jest.mock('react-native', () => ({
  Platform: { OS: 'web' },
  useWindowDimensions: jest.fn(),
}));

import { renderHook } from '@testing-library/react';
import { Platform, useWindowDimensions } from 'react-native';

import { useBreakpoint } from './use-breakpoint';

const mockUseWindowDimensions = useWindowDimensions as jest.Mock;

describe('useBreakpoint', () => {
  beforeEach(() => {
    Platform.OS = 'web';
    mockUseWindowDimensions.mockReturnValue({ width: 768 });
  });

  it.each([
    ['web', 768, 'desktop'],
    ['web', 767, 'mobile'],
    ['ios', 1024, 'mobile'],
    ['android', 1024, 'mobile'],
  ] as const)('returns %s %s as %s', (platform, width, expected) => {
    Platform.OS = platform;
    mockUseWindowDimensions.mockReturnValue({ width });

    const { result } = renderHook(() => useBreakpoint());

    expect(result.current).toBe(expected);
  });
});
