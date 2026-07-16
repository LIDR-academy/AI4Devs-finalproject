import type { ReactNode } from 'react';

export type AccountMenuTriggerProps = {
  expanded: boolean;
  onPress: () => void;
};

export type AccountMenuProps = {
  email: string;
  identityLabel: string;
  initials: string;
  onSettings: () => void;
  onSignOut: () => void;
  renderTrigger: (props: AccountMenuTriggerProps) => ReactNode;
  settingsLabel: string;
  signOutLabel: string;
};
