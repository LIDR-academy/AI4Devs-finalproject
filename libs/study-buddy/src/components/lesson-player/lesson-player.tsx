import { Button, LessonProgressIndicator } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { LessonResults } from '../lesson-results/lesson-results';
import { SlideView } from '../slide-view/slide-view';
import type { LessonPlayerProps } from './lesson-player.types';
import { useLessonPlayer } from './use-lesson-player';

export const LESSON_PLAYER_TEST_ID = 'lesson-player';

/**
 * LessonPlayer — one step at a time: content slides via SlideView, terminal results via
 * LessonResults. Deck state is a useReducer (currentIndex + answers + attemptSaved).
 */
export const LessonPlayer = ({ lesson, onBackToLessons }: LessonPlayerProps) => {
  const { t } = useLocalization();
  const player = useLessonPlayer(lesson);

  const stepLabel = t('player.slideOf', {
    current: player.currentIndex + 1,
    total: player.totalSteps,
  });

  return (
    <View style={styles.root} testID={LESSON_PLAYER_TEST_ID}>
      <LessonProgressIndicator
        current={player.currentIndex + 1}
        total={player.totalSteps}
        label={stepLabel}
      />
      <View style={styles.body}>
        {player.isResultsSlide ? (
          <LessonResults
            lesson={lesson}
            answers={player.gradedAnswers}
            onRetake={player.reset}
            onBackToLessons={onBackToLessons}
            persistOnMount={player.persistOnMount}
          />
        ) : player.currentSlide ? (
          <SlideView slide={player.currentSlide} onAnswered={player.onAnswered} />
        ) : null}
      </View>
      <View style={styles.nav}>
        {player.canGoBack ? (
          <Button variant="outlined" accessibilityLabel={t('player.back')} onPress={player.goBack}>
            {t('player.back')}
          </Button>
        ) : null}
        {player.canGoNext ? (
          <Button variant="filled" accessibilityLabel={t('player.next')} onPress={player.goNext}>
            {t('player.next')}
          </Button>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    gap: theme.spacing.s4,
  },
  body: {
    flex: 1,
  },
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.s3,
  },
}));
