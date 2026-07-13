import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type DialogProps = {
  open: boolean;
  onClose?: () => void;
  /** Optional hero Material Symbols icon, centered above the headline. */
  icon?: string;
  headline?: string;
  children?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  /** Custom action row; replaces the default cancel/confirm buttons. */
  actions?: ReactNode;
  style?: StyleProp<ViewStyle>;
};
