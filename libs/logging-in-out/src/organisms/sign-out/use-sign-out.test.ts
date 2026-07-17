jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useLocalization } from '@helsoft/localization';
import { act, renderHook } from '@testing-library/react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { useSignOut } from './use-sign-out';

const mockUseLocalization = useLocalization as jest.Mock;

describe('useSignOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  it('exposes t from useLocalization', async () => {
    const { result } = await renderHook(() => useSignOut());

    expect(result.current.t('auth.logOut')).toBe('auth.logOut');
  });

  it('starts with confirmOpen false and toggles via setConfirmOpen', async () => {
    const { result } = await renderHook(() => useSignOut());

    expect(result.current.confirmOpen).toBe(false);

    await act(async () => {
      result.current.setConfirmOpen(true);
    });
    expect(result.current.confirmOpen).toBe(true);

    await act(async () => {
      result.current.setConfirmOpen(false);
    });
    expect(result.current.confirmOpen).toBe(false);
  });
});
