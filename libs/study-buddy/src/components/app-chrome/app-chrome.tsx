import { AccountMenu, DesktopBar, InitialsAvatar, MobileBar } from '@helsoft/components';
import { useBreakpoint } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { usePathname, useRouter } from 'expo-router';
import { Text } from 'react-native';

import { SignOut } from '../sign-out/sign-out';
import type { AppChromeProps } from './app-chrome.types';
import { useAppChrome } from './use-app-chrome';

export const AppChrome = (_props: AppChromeProps) => {
  const { t } = useLocalization();
  const breakpoint = useBreakpoint();
  const pathname = usePathname();
  const router = useRouter();
  const { home, identity, mobileTitleKey, newLesson, setSignOutOpen, signOutOpen } =
    useAppChrome(pathname);
  const accountMenu = identity ? (
    <AccountMenu
      email={identity.email}
      identityLabel={identity.label}
      initials={identity.initials}
      onSettings={() => router.navigate('/settings')}
      onSignOut={() => setSignOutOpen(true)}
      renderTrigger={({ onPress }) => (
        <InitialsAvatar
          accessibilityLabel={identity.label}
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
          home={{ ...home, onPress: () => router.navigate('/') }}
          newLesson={{ ...newLesson, onPress: () => router.navigate('/upload') }}
        />
      ) : (
        <MobileBar
          avatar={accountMenu}
          home={{ ...home, onPress: () => router.navigate('/') }}
          newLesson={{ ...newLesson, onPress: () => router.navigate('/upload') }}
          title={<Text>{t(mobileTitleKey)}</Text>}
        />
      )}
      <SignOut open={signOutOpen} onOpenChange={setSignOutOpen} />
    </>
  );
};
