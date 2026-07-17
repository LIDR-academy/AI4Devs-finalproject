import { Modal, Pressable, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { InitialsAvatar } from '../../atoms/initials-avatar/initials-avatar';
import type { AccountMenuProps } from './account-menu.types';
import { useAccountMenu } from './use-account-menu';

export const AccountMenu = ({
  email,
  identityLabel,
  initials,
  onSettings,
  onSignOut,
  renderTrigger,
  settingsLabel,
  signOutLabel,
}: AccountMenuProps) => {
  const { open, setOpen } = useAccountMenu();

  return (
    <View>
      {renderTrigger({ expanded: open, onPress: () => setOpen(true) })}
      {open ? (
        <Modal transparent visible onRequestClose={() => setOpen(false)}>
          <Pressable
            onPress={() => setOpen(false)}
            style={styles.scrim}
            testID="account-menu-scrim"
          >
            <Pressable
              accessibilityRole="menu"
              accessibilityViewIsModal
              onAccessibilityEscape={() => setOpen(false)}
              onPress={(event) => event.stopPropagation()}
              style={styles.menu}
              testID="account-menu"
            >
              <View style={styles.identity}>
                <InitialsAvatar initials={initials} />
                <View>
                  <Text style={styles.identityLabel}>{identityLabel}</Text>
                  <Text style={styles.email}>{email}</Text>
                </View>
              </View>
              <Pressable
                accessibilityRole="menuitem"
                onPress={() => {
                  setOpen(false);
                  onSettings();
                }}
                style={styles.item}
              >
                <Text style={styles.itemLabel}>{settingsLabel}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="menuitem"
                onPress={() => {
                  setOpen(false);
                  onSignOut();
                }}
                style={styles.item}
              >
                <Text style={styles.signOutLabel}>{signOutLabel}</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  scrim: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    padding: theme.spacing.s3,
  },
  menu: {
    gap: theme.spacing.s2,
    padding: theme.spacing.s3,
    borderRadius: theme.shape.card,
    backgroundColor: theme.colors.surfaceContainer,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  identityLabel: {
    ...theme.typography.titleSmall,
    color: theme.colors.onSurface,
  },
  email: {
    ...theme.typography.bodySmall,
    color: theme.colors.onSurfaceVariant,
  },
  item: {
    minHeight: theme.layout.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.s3,
  },
  itemLabel: {
    ...theme.typography.labelLarge,
    color: theme.colors.onSurface,
  },
  signOutLabel: {
    ...theme.typography.labelLarge,
    color: theme.colors.error,
  },
}));
