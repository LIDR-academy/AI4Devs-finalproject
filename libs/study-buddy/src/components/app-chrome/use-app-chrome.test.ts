jest.mock('@helsoft/hooks', () => ({
  ...jest.requireActual('@helsoft/hooks'),
  useSession: jest.fn(),
}));
jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { useSession } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { act, renderHook } from '@testing-library/react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { useAppChrome } from './use-app-chrome';

const mockUseLocalization = useLocalization as jest.Mock;
const mockUseSession = useSession as jest.Mock;

describe('useAppChrome', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue(localizationValue());
    mockUseSession.mockReturnValue({
      isLoading: false,
      session: {
        user: {
          email: 'ada@example.com',
          user_metadata: { full_name: 'Ada Lovelace' },
        },
      },
    });
  });

  it('derives identity, navigation, and controlled sign-out state', async () => {
    const { result } = await renderHook(() => useAppChrome('/upload'));

    expect(result.current.identity).toMatchObject({
      email: 'ada@example.com',
      label: 'Ada Lovelace',
    });
    expect(result.current.home).toEqual({ active: false, label: 'nav.myLessons' });
    expect(result.current.newLesson).toEqual({ active: true, label: 'nav.newLesson' });
    expect(result.current.mobileTitleKey).toBe('nav.newLesson');
    expect(result.current.signOutOpen).toBe(false);

    await act(async () => {
      result.current.setSignOutOpen(true);
    });

    expect(result.current.signOutOpen).toBe(true);
  });

  it('marks Home active only at the root pathname', async () => {
    const { result, rerender } = await renderHook(({ pathname }) => useAppChrome(pathname), {
      initialProps: { pathname: '/' },
    });

    expect(result.current.home).toEqual({ active: true, label: 'nav.myLessons' });

    await rerender({ pathname: '/lesson/123' });

    expect(result.current.home).toEqual({ active: false, label: 'nav.myLessons' });
    expect(result.current.newLesson).toEqual({ active: false, label: 'nav.newLesson' });
  });
});
