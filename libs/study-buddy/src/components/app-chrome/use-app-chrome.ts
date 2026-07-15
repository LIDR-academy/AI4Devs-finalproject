import { useSession } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { useState } from 'react';

import { getSessionIdentity } from '../../helpers/session-identity.helpers';
import { getMobileTitleKey } from './app-chrome.helpers';

export const useAppChrome = (pathname: string) => {
  const { t } = useLocalization();
  const { session } = useSession();
  const [signOutOpen, setSignOutOpen] = useState(false);

  return {
    home: {
      active: pathname === '/',
      label: t('nav.myLessons'),
    },
    identity: getSessionIdentity(session?.user),
    mobileTitleKey: getMobileTitleKey(pathname),
    newLesson: {
      active: pathname === '/upload',
      label: t('nav.newLesson'),
    },
    setSignOutOpen,
    signOutOpen,
  };
};
