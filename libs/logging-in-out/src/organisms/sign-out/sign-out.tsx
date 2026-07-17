import { Button, Dialog } from '@helsoft/components';

import type { SignOutProps } from './sign-out.types';
import { useSignOut } from './use-sign-out';

/**
 * SignOut — prop-driven confirm dialog around logout. No useAuth: parent injects onSignOut.
 * No navigation on confirm: session-guard reacts to the session change.
 */
export const SignOut = ({ onSignOut, onSignOutError, open, onOpenChange, style }: SignOutProps) => {
  const { t, confirmOpen, setConfirmOpen } = useSignOut({ open, onOpenChange });

  return (
    <>
      {open === undefined ? (
        <Button variant="outlined" onPress={() => setConfirmOpen(true)} style={style}>
          {t('auth.logOut')}
        </Button>
      ) : null}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        headline={t('auth.logOutConfirmHeadline')}
        confirmLabel={t('auth.logOutConfirmAction')}
        cancelLabel={t('auth.logOutCancelAction')}
        onConfirm={() => {
          setConfirmOpen(false);
          // Dialog closes optimistically; a failure is surfaced to the parent via
          // onSignOutError (this component has no error UI), never an unhandled rejection.
          void onSignOut().catch((cause) => onSignOutError?.(cause));
        }}
      >
        {t('auth.logOutConfirmBody')}
      </Dialog>
    </>
  );
};
