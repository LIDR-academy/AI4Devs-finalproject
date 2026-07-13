jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { isValidEmail, localizationValue, type SignInFormTestProps } from '../../test-utils/auth-test-factories';
import { SignInForm } from './sign-in-form';

const mockUseLocalization = useLocalization as jest.Mock;

const renderSignInForm = ({
  onSignIn = jest.fn().mockResolvedValue(undefined),
  isSubmitting = false,
  error = null,
  onNavigateToSignUp = jest.fn(),
}: SignInFormTestProps = {}) =>
  render(
    <SignInForm
      onSignIn={onSignIn}
      isSubmitting={isSubmitting}
      error={error}
      onNavigateToSignUp={onNavigateToSignUp}
      isValidEmail={isValidEmail}
    />,
  );

describe('SignInForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  // @s2 — submitting the form calls onSignIn with the entered credentials.
  it('calls onSignIn with the entered email and password on submit', async () => {
    const onSignIn = jest.fn().mockResolvedValue(undefined);
    await renderSignInForm({ onSignIn });

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });
    fireEvent.press(screen.getByRole('button', { name: 'auth.submit' }));

    expect(onSignIn).toHaveBeenCalledWith('user@example.com', 'secret1');
  });

  // Content state — the sign-up link calls onNavigateToSignUp.
  it('calls onNavigateToSignUp when the sign-up prompt is pressed', async () => {
    const onNavigateToSignUp = jest.fn();
    await renderSignInForm({ onNavigateToSignUp });
    fireEvent.press(screen.getByRole('button', { name: 'auth.toSignUp' }));

    expect(onNavigateToSignUp).toHaveBeenCalledTimes(1);
  });

  // @s3 — isSubmitting drives the LoginForm Loading state.
  it('disables the submit control while isSubmitting is true', async () => {
    await renderSignInForm({ isSubmitting: true });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });

  // @s3 — the exact `auth.signingIn` i18n key is wired into LoginForm's Loading affordance.
  it('passes the auth.signingIn i18n key into the Loading affordance', async () => {
    await renderSignInForm({ isSubmitting: true });

    expect(screen.getByText('auth.signingIn')).toBeTruthy();
  });

  // @s9 — a malformed email is caught by isValidEmail before ever calling onSignIn.
  it('shows an inline email error and does not call onSignIn when the email is malformed', async () => {
    const onSignIn = jest.fn();
    await renderSignInForm({ onSignIn });

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
    expect(onSignIn).not.toHaveBeenCalled();
  });

  // @s9 fix — correcting the email re-enables submit and allows a real resubmit.
  it('re-enables submit and calls onSignIn after correcting a malformed email post-error', async () => {
    const onSignIn = jest.fn().mockResolvedValue(undefined);
    await renderSignInForm({ onSignIn });

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
    expect(onSignIn).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });

    expect(screen.queryByText('auth.error.email')).toBeNull();
    expect(screen.getByRole('button', { name: 'auth.submit', disabled: false })).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'auth.submit' }));

    expect(onSignIn).toHaveBeenCalledWith('user@example.com', 'secret1');
  });

  // @s9 (empty-password half) — LoginForm Empty-state gating keeps submit disabled.
  it('keeps submit disabled (never calling onSignIn) when the password is cleared back to blank', async () => {
    const onSignIn = jest.fn();
    await renderSignInForm({ onSignIn });

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'x');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), '');
    });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
    expect(onSignIn).not.toHaveBeenCalled();
  });

  // @s5 — invalid_credentials error renders as the auth.error.invalidCredentials banner.
  it('renders the invalidCredentials banner when error is invalid_credentials', async () => {
    await renderSignInForm({ error: 'invalid_credentials' });

    expect(screen.getByText('auth.error.invalidCredentials')).toBeTruthy();
  });

  // @s6 — network_error renders a distinct banner; form stays interactive.
  it('renders the network banner when error is network_error, form stays interactive', async () => {
    await renderSignInForm({ error: 'network_error' });

    expect(screen.getByText('auth.error.network')).toBeTruthy();
    expect(screen.queryByText('auth.error.invalidCredentials')).toBeNull();

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: false })).toBeTruthy();
  });

  // Rejecting onSignIn must not become an unhandled promise rejection.
  it('does not leave a rejected onSignIn promise unhandled', async () => {
    const unhandledRejectionSpy = jest.fn();
    process.on('unhandledRejection', unhandledRejectionSpy);

    const onSignIn = jest.fn().mockRejectedValue({ code: 'network_error' });
    await renderSignInForm({ onSignIn });

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.submit' }));
    });
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    process.off('unhandledRejection', unhandledRejectionSpy);
    expect(unhandledRejectionSpy).not.toHaveBeenCalled();
  });

  // No error at all — no banner renders.
  it('renders no error banner when error is null', async () => {
    await renderSignInForm({ error: null });

    expect(screen.queryByText('auth.error.invalidCredentials')).toBeNull();
    expect(screen.queryByText('auth.error.network')).toBeNull();
  });
});
