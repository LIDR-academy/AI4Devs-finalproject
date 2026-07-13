jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { SignOut } from './sign-out';

const mockUseLocalization = useLocalization as jest.Mock;

const renderSignOut = (onSignOut = jest.fn().mockResolvedValue(undefined)) =>
  render(<SignOut onSignOut={onSignOut} />);

describe('SignOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  // @s4/@s11 — the trigger button is rendered, labelled from localized copy.
  it('renders a Log Out trigger', async () => {
    await renderSignOut();

    expect(screen.getByRole('button', { name: 'auth.logOut' })).toBeTruthy();
  });

  // @s4/@s10/@s11 — the confirmation dialog is not shown before the trigger is pressed.
  it('does not show the confirmation dialog before the trigger is pressed', async () => {
    await renderSignOut();

    expect(screen.queryByText('auth.logOutConfirmBody')).toBeNull();
  });

  // @s4/@s10/@s11 — pressing the trigger shows a confirmation dialog before signing out.
  it('shows a confirmation dialog when the trigger is pressed', async () => {
    await renderSignOut();
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });

    expect(screen.getByText('auth.logOutConfirmBody')).toBeTruthy();
    expect(screen.getByText('auth.logOutConfirmHeadline')).toBeTruthy();
  });

  // @s4/@s11 — confirming in the dialog signs the user out.
  it('calls onSignOut when the confirmation is accepted', async () => {
    const onSignOut = jest.fn().mockResolvedValue(undefined);
    await renderSignOut(onSignOut);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });

    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  // @s4/@s11 — confirming closes the dialog.
  it('closes the confirmation dialog after confirming', async () => {
    const onSignOut = jest.fn().mockResolvedValue(undefined);
    await renderSignOut(onSignOut);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });

    expect(screen.queryByText('auth.logOutConfirmBody')).toBeNull();
  });

  // The dialog closes optimistically, so a failed sign-out must reach the parent through
  // onSignOutError — the component's only error surface.
  it('reports a rejected onSignOut to onSignOutError', async () => {
    const cause = new Error('network down');
    const onSignOut = jest.fn().mockRejectedValue(cause);
    const onSignOutError = jest.fn();
    await render(<SignOut onSignOut={onSignOut} onSignOutError={onSignOutError} />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });

    expect(onSignOutError).toHaveBeenCalledWith(cause);
  });

  // A failed onSignOut must not become a silent unhandled promise rejection.
  it('does not leave a rejected onSignOut promise unhandled', async () => {
    const unhandledRejectionSpy = jest.fn();
    process.on('unhandledRejection', unhandledRejectionSpy);

    const onSignOut = jest.fn().mockRejectedValue(new Error('network down'));
    await renderSignOut(onSignOut);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });
    await act(async () => {
      await new Promise<void>((resolve) => setImmediate(() => resolve()));
    });

    process.off('unhandledRejection', unhandledRejectionSpy);
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(unhandledRejectionSpy).not.toHaveBeenCalled();
  });

  // @s10 — dismissing the dialog keeps the session active: onSignOut is never called.
  it('does not call onSignOut when the confirmation is dismissed', async () => {
    const onSignOut = jest.fn();
    await renderSignOut(onSignOut);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutCancelAction' }));
    });

    expect(onSignOut).not.toHaveBeenCalled();
    expect(screen.queryByText('auth.logOutConfirmBody')).toBeNull();
  });
});
