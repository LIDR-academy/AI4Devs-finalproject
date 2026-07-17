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
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: jest.fn(),
}));

import { useAuth, useBreakpoint, useSession } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authValue, localizationValue } from '../../test-utils/auth-test-factories';
import { AppChrome } from './app-chrome';

const mockUseAuth = useAuth as jest.Mock;
const mockUseBreakpoint = useBreakpoint as jest.Mock;
const mockUseLocalization = useLocalization as jest.Mock;
const mockUsePathname = usePathname as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSafeAreaInsets = useSafeAreaInsets as jest.Mock;
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
    mockUseSafeAreaInsets.mockReturnValue({ bottom: 0, left: 0, right: 0, top: 0 });
    mockUseSession.mockReturnValue(sessionValue);
  });

  it('navigates to primary desktop destinations', async () => {
    await render(<AppChrome />);

    expect(screen.getByText('brand.name')).toBeOnTheScreen();
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

  it('uses the latest router for primary navigation after a rerender', async () => {
    const initialNavigate = jest.fn();
    const updatedNavigate = jest.fn();
    mockUseRouter.mockReturnValue({ navigate: initialNavigate });
    const { rerender } = await render(<AppChrome />);

    mockUseRouter.mockReturnValue({ navigate: updatedNavigate });
    await rerender(<AppChrome />);
    await act(async () => {
      fireEvent.press(screen.getByRole('link', { name: 'nav.myLessons' }));
      fireEvent.press(screen.getByRole('link', { name: 'nav.newLesson' }));
    });

    expect(initialNavigate).not.toHaveBeenCalled();
    expect(updatedNavigate).toHaveBeenNthCalledWith(1, '/');
    expect(updatedNavigate).toHaveBeenNthCalledWith(2, '/upload');
  });

  it('uses session identity for account actions and the controlled sign-out dialog', async () => {
    const signOut = jest.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue(authValue({ signOut }));
    await render(<AppChrome />);

    await act(async () => {
      fireEvent.press(screen.getByRole('button', { name: 'nav.openAccountMenu' }));
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

  it('exposes the account-menu trigger name and expanded state', async () => {
    const t = jest.fn((key: string) => key);
    mockUseLocalization.mockReturnValue(localizationValue({ t }));
    await render(<AppChrome />);

    expect(t).toHaveBeenCalledWith('nav.openAccountMenu', { label: 'Ada Lovelace' });

    const trigger = screen.getByRole('button', { name: 'nav.openAccountMenu' });
    expect(trigger.props.accessibilityState).toEqual({ expanded: false });

    await act(async () => {
      fireEvent.press(trigger);
    });

    expect(
      screen.getByRole('button', { name: 'nav.openAccountMenu' }).props.accessibilityState,
    ).toEqual({ expanded: true });
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
      fireEvent.press(screen.getByRole('button', { name: 'nav.openAccountMenu' }));
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

  it('forwards the safe-area bottom inset to the mobile bottom bar', async () => {
    mockUseBreakpoint.mockReturnValue('mobile');
    mockUseSafeAreaInsets.mockReturnValue({ bottom: 24, left: 0, right: 0, top: 0 });
    await render(<AppChrome />);

    // MobileBar paddingBottom = theme.spacing.s2 (8) + inset
    expect(screen.getByTestId('mobile-bottom-bar').props.style).toMatchObject({
      paddingBottom: 32,
    });
  });

  it('does not invent an identity while session loading', async () => {
    mockUseSession.mockReturnValue({ isLoading: true, session: null });
    await render(<AppChrome />);

    expect(screen.queryByRole('button')).toBeNull();
  });
});
