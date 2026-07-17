jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useLocalization } from '@helsoft/localization';
import { act, renderHook } from '@testing-library/react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { useSignInForm } from './use-sign-in-form';

const mockUseLocalization = useLocalization as jest.Mock;

describe('useSignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  it('exposes localization t from useLocalization', async () => {
    const { result } = await renderHook(() => useSignInForm());

    expect(result.current.t('auth.submit')).toBe('auth.submit');
  });

  it('starts with emailError undefined and updates via setEmailError', async () => {
    const { result } = await renderHook(() => useSignInForm());

    expect(result.current.emailError).toBeUndefined();

    await act(async () => {
      result.current.setEmailError('auth.error.email');
    });
    expect(result.current.emailError).toBe('auth.error.email');

    await act(async () => {
      result.current.setEmailError(undefined);
    });
    expect(result.current.emailError).toBeUndefined();
  });
});
