import { useState } from 'react';

import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';

/**
 * Local confirm-dialog open state + auth/localization wiring for SignOut.
 */
export const useSignOut = () => {
  const { signOut } = useAuth();
  const { t } = useLocalization();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return { signOut, t, confirmOpen, setConfirmOpen };
};
