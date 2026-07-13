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
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { authValue, localizationValue } from '../../test-utils/auth-test-factories';
import { SignInForm } from './sign-in-form';

const mockUseAuth = useAuth as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;

describe('SignInForm (study-buddy wiring)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue());
    mockUseRouter.mockReturnValue({ push: jest.fn() });
  });

  it('wires useAuth().signIn into the prop-driven form', async () => {
    const signIn = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ signIn }));

    await render(<SignInForm />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });
    fireEvent.press(screen.getByRole('button', { name: 'auth.submit' }));

    expect(signIn).toHaveBeenCalledWith('user@example.com', 'secret1');
  });

  it('wires router.push(/sign-up) into onNavigateToSignUp', async () => {
    const push = jest.fn();
    mockUseAuth.mockReturnValue(authValue());
    mockUseRouter.mockReturnValue({ push });

    await render(<SignInForm />);
    fireEvent.press(screen.getByRole('button', { name: 'auth.toSignUp' }));

    expect(push).toHaveBeenCalledWith('/sign-up');
  });

  // useAuth().isSubmitting reaches the rendered form: submit is disabled while in flight.
  it('wires useAuth().isSubmitting into the disabled submit control', async () => {
    mockUseAuth.mockReturnValue(authValue({ isSubmitting: true }));

    await render(<SignInForm />);

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });

  // useAuth().error reaches the rendered form as the mapped i18n banner.
  it('wires useAuth().error into the error banner', async () => {
    mockUseAuth.mockReturnValue(authValue({ error: 'invalid_credentials' }));

    await render(<SignInForm />);

    expect(screen.getByText('auth.error.invalidCredentials')).toBeTruthy();
  });

  // The REAL AuthService.isValidEmail (not a test copy) is wired in: this is the only test
  // that exercises the production email regex through the form, so an EMAIL_PATTERN change
  // that diverges from the test-utils mirror fails here instead of drifting silently.
  it('blocks a malformed email via the real AuthService.isValidEmail before calling signIn', async () => {
    const signIn = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ signIn }));

    await render(<SignInForm />);
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'not-an-email');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.submit' }));
    });

    expect(screen.getByText('auth.error.email')).toBeTruthy();
    expect(signIn).not.toHaveBeenCalled();
  });
});
