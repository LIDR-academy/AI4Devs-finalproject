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
import { AuthService } from '@helsoft/supabase-services';
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
    const signIn = jest.fn().mockResolvedValue(undefined);
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

  // @s3 — the exact `auth.signingIn` i18n key (not a placeholder/empty string) is wired into
  // LoginForm's Loading affordance.
  it('passes the auth.signingIn i18n key into the Loading affordance', async () => {
    mockUseAuth.mockReturnValue(authValue({ isSubmitting: true }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignInForm />);

    expect(screen.getByText('auth.signingIn')).toBeTruthy();
  });

  // @s9 — a malformed email is caught by AuthService.isValidEmail before ever calling signIn;
  // the inline auth.error.email message renders and the login form is not submitted.
  it('shows an inline email error and does not call signIn when the email is malformed', async () => {
    const signIn = jest.fn();
    mockUseAuth.mockReturnValue(authValue({ signIn }));
    mockUseLocalization.mockReturnValue(localizationValue());

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

  // @s9 fix (Slice 2, Round 2) — a malformed-email attempt used to permanently deadlock the
  // form: once emailError was set, the submit button that would re-trigger validation was
  // itself disabled by that same error, so there was no way left to clear it. Correcting the
  // email must re-enable the submit control and allow a real resubmit.
  it('re-enables submit and calls signIn after correcting a malformed email post-error', async () => {
    const signIn = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ signIn }));
    mockUseLocalization.mockReturnValue(localizationValue());

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

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });

    expect(screen.queryByText('auth.error.email')).toBeNull();
    expect(screen.getByRole('button', { name: 'auth.submit', disabled: false })).toBeTruthy();

    fireEvent.press(screen.getByRole('button', { name: 'auth.submit' }));

    expect(signIn).toHaveBeenCalledWith('user@example.com', 'secret1');
  });

  // @s9 (empty-password half) — LoginForm's own Empty-state gating (@s8) keeps submit disabled
  // whenever the password is blank, so SignInForm never even gets a chance to call signIn with
  // one; no separate wiring is needed for this half of @s9 (see sign-in-form.tsx's own note).
  it('keeps submit disabled (never calling signIn) when the password is cleared back to blank', async () => {
    const signIn = jest.fn();
    mockUseAuth.mockReturnValue(authValue({ signIn }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignInForm />);

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
    expect(signIn).not.toHaveBeenCalled();
  });

  // @s5 — a normalized invalid_credentials error renders as the auth.error.invalidCredentials
  // banner.
  it('renders the invalidCredentials banner when useAuth().error is invalid_credentials', async () => {
    mockUseAuth.mockReturnValue(authValue({ error: 'invalid_credentials' }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignInForm />);

    expect(screen.getByText('auth.error.invalidCredentials')).toBeTruthy();
  });

  // @s6 — a normalized network_error renders as a distinct auth.error.network banner, and the
  // form stays interactive (submit control isn't disabled by the banner itself).
  it('renders the network banner when useAuth().error is network_error, form stays interactive', async () => {
    mockUseAuth.mockReturnValue(authValue({ error: 'network_error' }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignInForm />);

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

  // Full-review Round 1, Major 2 — every prior test mocks useAuth() wholesale, so useAuth's real
  // rejecting signIn (which sets error state then `throw`s the cause) is never exercised through
  // this component. Uses the *real* useAuth implementation (only AuthService.signIn is mocked,
  // one layer below) so handleSubmit's `void signIn(...)` genuinely faces a rejecting promise.
  it('does not leave a rejected signIn promise unhandled on a real signIn failure', async () => {
    const unhandledRejectionSpy = jest.fn();
    process.on('unhandledRejection', unhandledRejectionSpy);

    mockUseAuth.mockImplementation(jest.requireActual('@helsoft/hooks').useAuth);
    mockUseLocalization.mockReturnValue(localizationValue());
    jest.spyOn(AuthService, 'signIn').mockRejectedValue({ code: 'network_error' });

    await render(<SignInForm />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.submit' }));
    });
    // Flush the microtask queue so Node has a chance to flag an unhandled rejection.
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    process.off('unhandledRejection', unhandledRejectionSpy);
    expect(unhandledRejectionSpy).not.toHaveBeenCalled();

    jest.restoreAllMocks();
  });

  // No error at all (Content/Empty states) — no banner renders.
  it('renders no error banner when useAuth().error is null', async () => {
    mockUseAuth.mockReturnValue(authValue());
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignInForm />);

    expect(screen.queryByText('auth.error.invalidCredentials')).toBeNull();
    expect(screen.queryByText('auth.error.network')).toBeNull();
  });
});
