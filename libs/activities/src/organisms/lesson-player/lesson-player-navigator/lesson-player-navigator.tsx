import { IconButton, LessonProgressIndicator } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { LessonPlayerNavigatorProps } from './lesson-player-navigator.types';

const NAV_ICON_SIZE = 40;

/**
 * LessonPlayerNavigator — back / progress / next chrome for the lesson deck.
 * Presentational: caller owns step state; a11y labels come from i18n.
 */
export const LessonPlayerNavigator = ({
  slides,
  current,
  label,
  canGoBack,
  canGoNext,
  onBack,
  onNext,
}: LessonPlayerNavigatorProps) => {
  const { t } = useLocalization();

  return (
    <View style={styles.header}>
      {canGoBack ? (
        <IconButton
          icon="arrow_back"
          variant="outlined"
          size={NAV_ICON_SIZE}
          accessibilityLabel={t('player.back')}
          onPress={onBack}
        />
      ) : (
        <View style={styles.navSlot} />
      )}
      <View style={styles.progress}>
        <LessonProgressIndicator slides={slides} current={current} label={label} />
      </View>
      {canGoNext ? (
        <IconButton
          icon="arrow_forward"
          variant="filled"
          size={NAV_ICON_SIZE}
          accessibilityLabel={t('player.next')}
          onPress={onNext}
        />
      ) : (
        <View style={styles.navSlot} />
      )}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  progress: {
    flex: 1,
    minWidth: 0,
  },
  navSlot: {
    width: NAV_ICON_SIZE,
    height: NAV_ICON_SIZE,
  },
}));
