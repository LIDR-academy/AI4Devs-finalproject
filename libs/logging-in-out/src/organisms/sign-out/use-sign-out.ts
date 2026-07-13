import { useState } from 'react';

import { useLocalization } from '@helsoft/localization';

/**
 * Local confirm-dialog open state + localization for SignOut.
 * Auth stays on the parent — injected via onSignOut prop.
 */
export const useSignOut = () => {
  const { t } = useLocalization();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return { t, confirmOpen, setConfirmOpen };
};
