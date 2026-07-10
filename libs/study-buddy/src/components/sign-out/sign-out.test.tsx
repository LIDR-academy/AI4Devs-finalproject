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

  // @s4/@s10/@s11 — pressing the trigger shows a confirmation dialog before signing out.
  it('shows a confirmation dialog when the trigger is pressed', async () => {
    mockUseAuth.mockReturnValue(authValue());
    mockUseLocalization.mockReturnValue(localizationValue());

    await render(<SignOut />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });

    expect(screen.getByText('auth.logOutConfirmBody')).toBeTruthy();
  });

  // @s4/@s11 — confirming in the dialog signs the user out.
  it('calls signOut when the confirmation is accepted', async () => {
    const signOut = jest.fn();
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
