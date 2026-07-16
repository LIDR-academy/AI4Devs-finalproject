import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Badge } from '../../atoms/badge/badge';
import { Icon } from '../../atoms/icon/icon';
import { NavItem } from '../../molecules/nav-item/nav-item';
import type { DesktopBarProps } from './desktop-bar.types';

export const DesktopBar = ({
  brandLabel,
  avatar,
  home,
  newLesson,
  indicatorVariant,
  alertsBadgeCount,
}: DesktopBarProps) => (
  <View style={styles.root}>
    <View style={styles.brand}>
      <Icon name="auto_awesome" />
      <Text style={styles.wordmark}>{brandLabel}</Text>
    </View>
    <View style={styles.navigation}>
      <NavItem {...home} indicatorVariant={indicatorVariant} />
      <NavItem {...newLesson} indicatorVariant={indicatorVariant} />
    </View>
    <View style={styles.actions}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID="desktop-alerts"
      >
        <Badge count={alertsBadgeCount}>
          <Icon name="notifications" />
        </Badge>
      </View>
      {avatar}
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  root: {
    minHeight: theme.layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.layout.gutter,
    gap: theme.spacing.s4,
    backgroundColor: theme.colors.surface,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  wordmark: {
    ...theme.typography.titleMedium,
    color: theme.colors.onSurface,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s1,
  },
  actions: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
}));
