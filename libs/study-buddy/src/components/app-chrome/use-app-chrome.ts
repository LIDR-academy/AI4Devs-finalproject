import { useSession } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useMemo, useState } from 'react';

import { getSessionIdentity } from '../../helpers/session-identity.helpers';
import { getMobileTitleKey } from './app-chrome.helpers';

export const useAppChrome = (pathname: string) => {
  const { t } = useLocalization();
  const { session } = useSession();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const home = useMemo(
    () => ({
      active: pathname === '/',
      label: t('nav.myLessons'),
    }),
    [pathname, t],
  );
  const newLesson = useMemo(
    () => ({
      active: pathname === '/upload',
      label: t('nav.newLesson'),
    }),
    [pathname, t],
  );

  return {
    home,
    identity: getSessionIdentity(session?.user),
    mobileTitleKey: getMobileTitleKey(pathname),
    newLesson,
    setSignOutOpen,
    signOutOpen,
  };
};
