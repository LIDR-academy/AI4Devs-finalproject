import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Icon } from '../../atoms/icon/icon';
import { NavItem } from '../../molecules/nav-item/nav-item';
import type { MobileBarProps } from './mobile-bar.types';

export const MobileBar = ({
  avatar,
  title,
  home,
  newLesson,
  indicatorVariant,
  safeAreaInsetBottom = 0,
}: MobileBarProps) => (
  <View>
    <View testID="mobile-top-bar" style={styles.topBar}>
      <Icon name="auto_awesome" />
      <View style={styles.title}>{title}</View>
      {avatar}
    </View>
    <View testID="mobile-bottom-bar" style={styles.bottomBar(safeAreaInsetBottom)}>
      <NavItem {...home} indicatorVariant={indicatorVariant} />
      <NavItem {...newLesson} indicatorVariant={indicatorVariant} />
    </View>
  </View>
);

const styles = StyleSheet.create((theme) => ({
  topBar: {
    minHeight: theme.layout.touchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.layout.gutter,
    gap: theme.spacing.s3,
    backgroundColor: theme.colors.surface,
  },
  title: {
    flex: 1,
  },
  bottomBar: (safeAreaInsetBottom: number) => ({
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.layout.gutter,
    paddingTop: theme.spacing.s2,
    paddingBottom: theme.spacing.s2 + safeAreaInsetBottom,
    backgroundColor: theme.colors.surfaceContainer,
  }),
}));
