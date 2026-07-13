import type { StyleProp, ViewStyle } from 'react-native';

export type SignOutProps = {
  /** Called on confirm; parent owns auth (e.g. useAuth().signOut). */
  onSignOut: () => Promise<void>;
  /**
   * Called when onSignOut rejects. The dialog closes optimistically on confirm and this
   * component has no error UI of its own, so without this the parent gets no signal that the
   * sign-out failed and the session is still active.
   */
  onSignOutError?: (cause: unknown) => void;
  style?: StyleProp<ViewStyle>;
};
