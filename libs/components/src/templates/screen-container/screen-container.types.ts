import type { ReactNode } from 'react';
import type { ViewProps } from 'react-native';

export type ScreenContainerProps = ViewProps & {
  children: ReactNode;
};
