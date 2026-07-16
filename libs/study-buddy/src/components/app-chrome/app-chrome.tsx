import { AccountMenu, DesktopBar, InitialsAvatar, MobileBar } from '@helsoft/components';
import { useBreakpoint } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { usePathname, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SignOut } from '../sign-out/sign-out';
import type { AppChromeProps } from './app-chrome.types';
import { useAppChrome } from './use-app-chrome';

export const AppChrome = (_props: AppChromeProps) => {
  const { t } = useLocalization();
  const breakpoint = useBreakpoint();
  const { bottom: safeAreaInsetBottom } = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const { home, identity, mobileTitleKey, newLesson, setSignOutOpen, signOutOpen } =
    useAppChrome(pathname);
  const navigateHome = useCallback(() => router.navigate('/'), [router]);
  const navigateNewLesson = useCallback(() => router.navigate('/upload'), [router]);
  const homeProps = useMemo(() => ({ ...home, onPress: navigateHome }), [home, navigateHome]);
  const newLessonProps = useMemo(
    () => ({ ...newLesson, onPress: navigateNewLesson }),
    [navigateNewLesson, newLesson],
  );
  const accountMenu = identity ? (
    <AccountMenu
      email={identity.email}
      identityLabel={identity.label}
      initials={identity.initials}
      onSettings={() => router.navigate('/settings')}
      onSignOut={() => setSignOutOpen(true)}
      renderTrigger={({ expanded, onPress }) => (
        <InitialsAvatar
          accessibilityLabel={t('nav.openAccountMenu', { label: identity.label })}
          accessibilityState={{ expanded }}
          initials={identity.initials}
          onPress={onPress}
        />
      )}
      settingsLabel={t('nav.settings')}
      signOutLabel={t('auth.logOut')}
    />
  ) : null;

  return (
    <>
      {breakpoint === 'desktop' ? (
        <DesktopBar
          avatar={accountMenu}
          brandLabel={t('brand.name')}
          home={homeProps}
          newLesson={newLessonProps}
        />
      ) : (
        <MobileBar
          avatar={accountMenu}
          home={homeProps}
          newLesson={newLessonProps}
          safeAreaInsetBottom={safeAreaInsetBottom}
          title={<Text>{t(mobileTitleKey)}</Text>}
        />
      )}
      <SignOut open={signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  );
};
