jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useAuth: jest.fn(),
  useBreakpoint: jest.fn(),
  useSession: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));
jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}));

import { useAuth, useBreakpoint, useSession } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';

import { authValue, localizationValue } from '../../test-utils/auth-test-factories';
import { AppChrome } from './app-chrome';

const mockUseAuth = useAuth as jest.Mock;
const mockUseBreakpoint = useBreakpoint as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSession = useSession as jest.Mock;

const navigate = jest.fn();

const sessionValue = {
  isLoading: false,
  session: {
    user: {
      email: 'ada@example.com',
      user_metadata: { full_name: 'Ada Lovelace' },
    },
  },
};

describe('AppChrome', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue(authValue());
    mockUseBreakpoint.mockReturnValue('desktop');
    mockUseLocalization.mockReturnValue(localizationValue());
    mockUsePathname.mockReturnValue('/');
    mockUseRouter.mockReturnValue({ navigate });
    mockUseSession.mockReturnValue(sessionValue);
  });

  it('navigates to primary desktop destinations', async () => {
    await render(<AppChrome />);

    expect(screen.getByText('AI Study Buddy')).toBeOnTheScreen();
    expect(screen.queryByTestId('mobile-top-bar')).toBeNull();
    await act(async () => {
      fireEvent.press(screen.getByRole('link', { name: 'nav.myLessons' }));
      fireEvent.press(screen.getByRole('link', { name: 'nav.newLesson' }));
    });

    expect(navigate).toHaveBeenNthCalledWith(1, '/');
    expect(navigate).toHaveBeenNthCalledWith(2, '/upload');
  });

  it('wires mobile primary destinations to their exact routes', async () => {
    mockUseBreakpoint.mockReturnValue('mobile');
    await render(<AppChrome />);

    await act(async () => {
      fireEvent.press(screen.getByRole('link', { name: 'nav.myLessons' }));
      fireEvent.press(screen.getByRole('link', { name: 'nav.newLesson' }));
    });

    expect(navigate).toHaveBeenNthCalledWith(1, '/');
    expect(navigate).toHaveBeenNthCalledWith(2, '/upload');
  });

  it('uses session identity for account actions and the controlled sign-out dialog', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ signOut }));
    await render(<AppChrome />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Ada Lovelace' }));
    });

    expect(screen.getByText('Ada Lovelace')).toBeTruthy();
    expect(screen.getByText('ada@example.com')).toBeTruthy();

    await act(async () => {
      fireEvent.press(screen.getByRole('menuitem', { name: 'auth.logOut' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'auth.logOutConfirmAction' }));
    });

    expect(signOut).toHaveBeenCalledTimes(1);
  });

  it('navigates to settings from the account menu without marking a primary item active', async () => {
    mockUsePathname.mockReturnValue('/settings');
    await render(<AppChrome />);

    expect(screen.getByRole('link', { name: 'nav.myLessons' }).props.accessibilityState).toEqual({
      selected: false,
    });
    expect(screen.getByRole('link', { name: 'nav.newLesson' }).props.accessibilityState).toEqual({
      selected: false,
    });

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'Ada Lovelace' }));
    });
    await act(async () => {
      fireEvent.press(screen.getByRole('menuitem', { name: 'nav.settings' }));
    });

    expect(navigate).toHaveBeenCalledWith('/settings');
  });

  it('renders the mobile top and bottom bars', async () => {
    mockUseBreakpoint.mockReturnValue('mobile');
    await render(<AppChrome />);

    expect(screen.getByTestId('mobile-top-bar')).toBeTruthy();
    expect(screen.getByTestId('mobile-bottom-bar')).toBeTruthy();
  });

  it('does not invent an identity while session loading', async () => {
    mockUseSession.mockReturnValue({ isLoading: true, session: null });
    await render(<AppChrome />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
