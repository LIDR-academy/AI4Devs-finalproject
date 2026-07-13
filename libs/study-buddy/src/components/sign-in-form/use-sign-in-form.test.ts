jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useAuth: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, renderHook } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { authValue, localizationValue } from '../../test-utils/auth-test-factories';
import { useSignInForm } from './use-sign-in-form';

const mockUseAuth = useAuth as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('useSignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() });
    mockUseAuth.mockReturnValue(authValue());
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  it('exposes auth, localization, and router values from their hooks', async () => {
    const signIn = jest.fn();
    const push = jest.fn();
    mockUseAuth.mockReturnValue(authValue({ signIn, isSubmitting: true, error: 'network_error' }));
    mockUseRouter.mockReturnValue({ push });

    const { result } = await renderHook(() => useSignInForm());

    expect(result.current.signIn).toBe(signIn);
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.error).toBe('network_error');
    expect(result.current.router.push).toBe(push);
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
