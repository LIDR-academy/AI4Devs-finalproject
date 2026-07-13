jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useAuth: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, renderHook } from '@testing-library/react-native';

import { authValue, localizationValue } from '../../test-utils/auth-test-factories';
import { useSignOut } from './use-sign-out';

const mockUseAuth = useAuth as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;

describe('useSignOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(authValue());
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  it('exposes signOut and t from their hooks', async () => {
    const signOut = jest.fn();
    mockUseAuth.mockReturnValue(authValue({ signOut }));

    const { result } = await renderHook(() => useSignOut());

    expect(result.current.signOut).toBe(signOut);
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
