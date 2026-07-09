import type { ReactNode } from 'react';
import { View, ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type ScreenContainerProps = ViewProps & {
  children: ReactNode;
};

export const ScreenContainer = ({ children, style, ...rest }: ScreenContainerProps) => (
  <View style={[styles.container, style]} {...rest}>
    {children}
  </View>
);

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.s4,
    backgroundColor: theme.colors.background,
  },
}));
