import type { StyleProp, ViewStyle } from 'react-native';

/** Style-only props for the study-buddy wired SignOut shell (auth comes from useAuth). */
export type SignOutProps = {
  open?: boolean;
  onOpenChange?: (next: boolean) => void;
  style?: StyleProp<ViewStyle>;
};
