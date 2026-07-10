import { useState } from 'react';
import { Button, Dialog } from '@helsoft/components';
import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';

/**
 * SignOut — feature component wiring useAuth().signOut behind a confirmation dialog
 * (session termination is irreversible without re-authenticating). No navigation on
 * confirm: the root Stack.Protected guard reacts to the session change.
 */
export const SignOut = () => {
  const { signOut } = useAuth();
  const { t } = useLocalization();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Button variant="outlined" onPress={() => setConfirmOpen(true)}>
        {t('auth.logOut')}
      </Button>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        headline={t('auth.logOutConfirmHeadline')}
        confirmLabel={t('auth.logOutConfirmAction')}
        cancelLabel={t('auth.logOutCancelAction')}
        onConfirm={() => {
          setConfirmOpen(false);
          void signOut();
        }}
      >
        {t('auth.logOutConfirmBody')}
      </Dialog>
    </>
  );
};
