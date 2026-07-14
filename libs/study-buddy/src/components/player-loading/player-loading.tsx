import { ProgressIndicator } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const PLAYER_LOADING_TEST_ID = 'player-loading-indicator';

/**
 * Full-screen lesson load chrome (@s17). Single progressbar (inner indicator owns the role).
 */
export const PlayerLoading = () => {
  const { t } = useLocalization();

  return (
    <View testID={PLAYER_LOADING_TEST_ID} style={styles.loading}>
      <ProgressIndicator variant="circular" accessibilityLabel={t('player.loading')} />
      <Text style={styles.loadingLabel} accessible={false}>
        {t('player.loading')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s3,
  },
  loadingLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
}));
