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

describe('SignOut (study-buddy wiring)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  it('wires useAuth().signOut into the prop-driven confirm dialog', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ signOut }));

    await render(<SignOut />);
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });

    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
