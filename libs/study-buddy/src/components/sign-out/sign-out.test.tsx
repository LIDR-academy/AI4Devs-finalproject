jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useAuth: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { authValue, localizationValue } from '../../test-utils/auth-test-factories';
import { SignOut } from './sign-out';

const mockUseAuth = useAuth as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;

describe('SignOut', () => {
  beforeEach(() => jest.clearAllMocks());

  // @s4/@s11 — the trigger button is rendered, labelled from localized copy.
  it('renders a Log Out trigger', async () => {
    mockUseAuth.mockReturnValue(authValue());
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignOut />);

    expect(screen.getByRole('button', { name: 'auth.logOut' })).toBeTruthy();
  });

  // @s4/@s10/@s11 — the confirmation dialog is not shown before the trigger is pressed
  // (confirmOpen starts false, not true).
  it('does not show the confirmation dialog before the trigger is pressed', async () => {
    mockUseAuth.mockReturnValue(authValue());
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignOut />);

    expect(screen.queryByText('auth.logOutConfirmBody')).toBeNull();
  });

  // @s4/@s10/@s11 — pressing the trigger shows a confirmation dialog before signing out.
  it('shows a confirmation dialog when the trigger is pressed', async () => {
    mockUseAuth.mockReturnValue(authValue());
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignOut />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });

    expect(screen.getByText('auth.logOutConfirmBody')).toBeTruthy();
    expect(screen.getByText('auth.logOutConfirmHeadline')).toBeTruthy();
  });

  // @s4/@s11 — confirming in the dialog signs the user out.
  it('calls signOut when the confirmation is accepted', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ signOut }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignOut />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  // @s4/@s11 — confirming closes the dialog (confirmOpen resets to false), not just triggers
  // signOut alongside a dialog left open.
  it('closes the confirmation dialog after confirming', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ signOut }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignOut />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });

    expect(screen.queryByText('auth.logOutConfirmBody')).toBeNull();
  });

  // Full-review Round 1, Major 1 — a failed signOut must not become a silent unhandled promise
  // rejection: the dialog optimistically closes and fires signOut without awaiting it, so the
  // rejection must be caught rather than left to reject unobserved.
  it('does not leave a rejected signOut promise unhandled', async () => {
    const unhandledRejectionSpy = jest.fn();
    process.on('unhandledRejection', unhandledRejectionSpy);

    const signOut = jest.fn().mockRejectedValue(new Error('network down'));
    mockUseAuth.mockReturnValue(authValue({ signOut }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignOut />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });
    // Flush the microtask queue so Node has a chance to flag an unhandled rejection.
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    process.off('unhandledRejection', unhandledRejectionSpy);
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(unhandledRejectionSpy).not.toHaveBeenCalled();
  });

  // @s10 — dismissing the dialog (cancel) keeps the session active: signOut is never called.
  it('does not call signOut when the confirmation is dismissed', async () => {
    const signOut = jest.fn();
    mockUseAuth.mockReturnValue(authValue({ signOut }));
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignOut />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutCancelAction' }));
    });

    expect(signOut).not.toHaveBeenCalled();
    expect(screen.queryByText('auth.logOutConfirmBody')).toBeNull();
  });
});
