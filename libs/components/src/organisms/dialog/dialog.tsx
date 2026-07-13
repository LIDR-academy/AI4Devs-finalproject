import { Modal, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { Icon } from '../../atoms/icon/icon';

import type { DialogProps } from './dialog.types';

/**
 * Dialog — MD3 basic dialog. Renders a 32% scrim + centered surface.
 * Control visibility with `open`.
 */
export const Dialog = ({
  open,
  onClose,
  icon,
  headline,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  actions,
  style,
}: DialogProps) => {
  const { theme } = useUnistyles();

  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={styles.scrim}>
        <Pressable accessibilityViewIsModal onPress={(e) => e.stopPropagation()} style={[styles.surface, style]}>
          {icon ? (
            <View style={styles.iconWrap}>
              <Icon name={icon} size={24} color={theme.colors.secondary} />
            </View>
          ) : null}
          {headline ? <Text style={styles.headline(!!icon)}>{headline}</Text> : null}
          {typeof children === 'string' ? <Text style={styles.body}>{children}</Text> : children}
          <View style={styles.actions}>
            {actions ?? (
              <>
                <Button variant="text" onPress={onClose}>
                  {cancelLabel}
                </Button>
                <Button variant="filled" onPress={onConfirm}>
                  {confirmLabel}
                </Button>
              </>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create((theme) => ({
  scrim: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: theme.utils.hexWithOpacity(theme.colors.scrim, 0.32),
  },
  surface: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.shape.dialog,
    padding: theme.padding.dialog,
    cursor: 'auto',
    ...theme.elevation.level3,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headline: (centered: boolean) => ({
    ...theme.typography.headlineSmall,
    marginBottom: 16,
    textAlign: centered ? 'center' : 'left',
    color: theme.colors.onSurface,
  }),
  body: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 24,
  },
}));
