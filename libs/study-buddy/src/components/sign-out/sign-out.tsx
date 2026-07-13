import { Button, Dialog } from '@helsoft/components';

import { useSignOut } from './use-sign-out';
import { StyleProp, ViewStyle } from 'react-native';

/**
 * SignOut — feature component wiring useAuth().signOut behind a confirmation dialog
 * (session termination is irreversible without re-authenticating). No navigation on
 * confirm: the root Stack.Protected guard reacts to the session change.
 */
export const SignOut = ({style}: {style?: StyleProp<ViewStyle> }) => {
  const { signOut, t, confirmOpen, setConfirmOpen } = useSignOut();

  return (
    <>
      <Button variant="outlined" onPress={() => setConfirmOpen(true)} style={style}>
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
          // The dialog closes optimistically; a failed signOut must not become a silently
          // unhandled promise rejection (Full-review Round 1, Major 1). No banner is required
          // here — AuthService.signOut is now normalized (Major 1) and the stale session is
          // still surfaced by useSession() elsewhere; catching keeps the rejection observed.
          void signOut().catch(() => {});
        }}
      >
        {t('auth.logOutConfirmBody')}
      </Dialog>
    </>
  );
};
