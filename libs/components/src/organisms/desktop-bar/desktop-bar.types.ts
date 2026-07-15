import type { ReactNode } from 'react';
import type { NavIndicatorVariant, NavItemProps } from '../../molecules/nav-item/nav-item.types';

export type DesktopBarProps = {
  avatar: ReactNode;
  home: Omit<NavItemProps, 'indicatorVariant'>;
  newLesson: Omit<NavItemProps, 'indicatorVariant'>;
  indicatorVariant?: NavIndicatorVariant;
  alertsBadgeCount?: number;
};
