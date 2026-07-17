import { Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import type { NavIndicatorVariant, NavItemProps } from './nav-item.types';

export const NavItem = ({
  label,
  active = false,
  indicatorVariant = 'pill',
  onPress,
}: NavItemProps) => (
  <Pressable
    accessibilityRole="link"
    accessibilityState={{ selected: active }}
    accessibilityLabel={label}
    onPress={onPress}
    style={styles.root(active, indicatorVariant)}
  >
    <Text style={styles.label(active)}>{label}</Text>
    {active ? (
      <View
        testID={`nav-item-indicator-${indicatorVariant}`}
        style={styles.indicator(indicatorVariant)}
      />
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create((theme) => ({
  root: (active: boolean, indicatorVariant: NavIndicatorVariant) => ({
    position: 'relative',
    minHeight: theme.layout.touchTarget,
    minWidth: theme.layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s3,
    gap: theme.spacing.s1,
    borderRadius: theme.shape.full,
    backgroundColor:
      active && indicatorVariant === 'pill' ? theme.colors.secondaryContainer : 'transparent',
  }),
  label: (active: boolean) => ({
    ...theme.typography.labelLarge,
    color: active ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant,
  }),
  indicator: (indicatorVariant: NavIndicatorVariant) => {
    if (indicatorVariant === 'pill') {
      return {
        position: 'absolute',
        top: theme.spacing.s0,
        right: theme.spacing.s0,
        bottom: theme.spacing.s0,
        left: theme.spacing.s0,
        borderRadius: theme.shape.full,
      };
    }

    if (indicatorVariant === 'underline') {
      return {
        position: 'relative',
        alignSelf: 'stretch',
        height: theme.spacing.s1,
        borderRadius: theme.shape.full,
        backgroundColor: theme.colors.primary,
      };
    }

    return {
      position: 'relative',
      width: theme.spacing.s2,
      height: theme.spacing.s2,
      borderRadius: theme.shape.full,
      backgroundColor: theme.colors.primary,
    };
  },
}));
