import type { ReactNode } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';

export type ScreenContainerProps = ViewProps & {
  children: ReactNode;
};

export const ScreenContainer = ({ children, style, ...rest }: ScreenContainerProps) => (
  <View style={[styles.container, style]} {...rest}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
