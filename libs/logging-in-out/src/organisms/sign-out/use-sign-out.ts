import { useLocalization } from '@helsoft/localization';
import { useState } from 'react';

type UseSignOutProps = {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
};

/**
 * Local confirm-dialog open state + localization for SignOut.
 * Auth stays on the parent — injected via onSignOut prop.
 */
export const useSignOut = ({ open, onOpenChange }: UseSignOutProps = {}) => {
  const { t } = useLocalization();
  const [uncontrolledConfirmOpen, setUncontrolledConfirmOpen] = useState(false);
  const controlled = open !== undefined;
  const confirmOpen = controlled ? open : uncontrolledConfirmOpen;
  const setConfirmOpen = controlled
    ? (onOpenChange ?? (() => undefined))
    : setUncontrolledConfirmOpen;

  return { t, confirmOpen, setConfirmOpen };
};
