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

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push: jest.fn() });
  });

  // @s2 — submitting the form calls useAuth().signIn with the entered credentials.
  it('calls signIn with the entered email and password on submit', async () => {
    const signIn = jest.fn();
    mockUseAuth.mockReturnValue(authValue({ signIn }));
    mockUseLocalization.mockReturnValue(localizationValue());

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

  // Content state (spec.md UI states table) — the sign-up link navigates to /sign-up.
  it('navigates to /sign-up when the sign-up prompt is pressed', async () => {
    const push = jest.fn();
    mockUseAuth.mockReturnValue(authValue());
    mockUseLocalization.mockReturnValue(localizationValue());
    mockUseRouter.mockReturnValue({ push });

    await render(<SignInForm />);
    fireEvent.press(screen.getByRole('button', { name: 'auth.toSignUp' }));

    expect(push).toHaveBeenCalledWith('/sign-up');
  });

  // @s3 — useAuth().isSubmitting drives the LoginForm Loading state.
  it('disables the submit control while useAuth().isSubmitting is true', async () => {
    mockUseAuth.mockReturnValue(authValue({ isSubmitting: true }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignInForm />);

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });
});
