import { useAuth } from '@helsoft/hooks';
import { SignOut as SignOutView } from '@helsoft/logging-in-out';

import type { SignOutProps } from './sign-out.types';

/**
 * App wiring: useAuth().signOut → prop-driven SignOutView.
 * No navigation on confirm — root Stack.Protected reacts to the session change.
 */
export const SignOut = ({ style }: SignOutProps) => {
  const { signOut } = useAuth();

  return <SignOutView onSignOut={signOut} style={style} />;
};
