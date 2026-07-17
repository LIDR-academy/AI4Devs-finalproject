import type { ReactNode } from 'react';
import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type BadgeColor = 'error' | 'primary' | 'tertiary';

export type BadgeProps = {
  count?: number;
  /** Plain marker without a number. */
  dot?: boolean;
  max?: number;
  color?: BadgeColor;
  /** When provided, the badge anchors to the top-right of the children. */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * Badge — MD3 small status/count indicator.
 */
export const Badge = ({
  count,
  dot = false,
  max = 99,
  color = 'error',
  children,
  style,
}: BadgeProps) => {
  styles.useVariants({ color });
  const showBadge = dot || (count != null && count > 0);
  const display =
    !dot && count != null && count > 0 ? (count > max ? `${max}+` : String(count)) : '';

  const badge = showBadge ? (
    <View style={[styles.badge(dot, count), children ? undefined : style]}>
      {!dot && display ? <Text style={styles.count}>{display}</Text> : null}
    </View>
  ) : null;

  if (!children) return badge;

  return (
    <View style={[styles.anchor, style]}>
      {children}
      {badge ? <View style={styles.anchorBadge(dot)}>{badge}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  badge: (dot: boolean, count = 0) => ({
    width: dot ? 6 : count > 9 ? 24 : 16,
    height: dot ? 6 : count > 9 ? 24 : 16,
    paddingHorizontal: dot ? 0 : 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.full,
    variants: {
      color: {
        error: { backgroundColor: theme.colors.error },
        primary: { backgroundColor: theme.colors.primary },
        tertiary: { backgroundColor: theme.colors.tertiary },
      },
    },
  }),
  count: {
    fontFamily: theme.fontFamily.body,
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 12,
    variants: {
      color: {
        error: { color: theme.colors.onError },
        primary: { color: theme.colors.onPrimary },
        tertiary: { color: theme.colors.onTertiary },
      },
    },
  },
  anchor: {
    alignSelf: 'flex-start',
  },
  anchorBadge: (dot: boolean) => ({
    position: 'absolute',
    top: dot ? 2 : -2,
    right: dot ? 2 : -2,
  }),
}));
