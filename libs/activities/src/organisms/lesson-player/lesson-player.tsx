import { Button } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { ScrollView, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { LessonResults } from '../lesson-results/lesson-results';
import { SlideView } from '../slide-view/slide-view';
import type { LessonPlayerProps } from './lesson-player.types';
import { LessonPlayerNavigator } from './lesson-player-navigator/lesson-player-navigator';
import { useLessonPlayer } from './use-lesson-player';

export const LESSON_PLAYER_TEST_ID = 'lesson-player';
export const LESSON_PLAYER_EMPTY_TEST_ID = 'lesson-player-empty';
export const LESSON_PLAYER_ERROR_TEST_ID = 'lesson-player-error';

/**
 * LessonPlayer — one step at a time: content slides via SlideView, terminal results via
 * LessonResults. Deck state is a useReducer (currentIndex + answers + attemptSaved).
 * Empty (0 slides) and Error (load failure) short-circuit before the deck.
 */
export const LessonPlayer = ({
  lesson,
  error = null,
  onRetry,
  onBackToLessons,
}: LessonPlayerProps) => {
  // @s16 — load failure → Error + Retry + Back (no deck).
  if (error) {
    return <LessonPlayerError onRetry={onRetry} onBackToLessons={onBackToLessons} />;
  }

  // @s15 — slideless lesson → Empty + Back only (never a 1-step results deck).
  if (!lesson || lesson.slides.length === 0) {
    return <LessonPlayerEmpty onBackToLessons={onBackToLessons} />;
  }

  return <LessonPlayerDeck lesson={lesson} onBackToLessons={onBackToLessons} />;
};

type EmptyProps = { onBackToLessons: () => void };

const LessonPlayerEmpty = ({ onBackToLessons }: EmptyProps) => {
  const { t } = useLocalization();

  return (
    <View style={styles.root} testID={LESSON_PLAYER_TEST_ID}>
      <View
        style={styles.state}
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        testID={LESSON_PLAYER_EMPTY_TEST_ID}
      >
        <Text style={styles.stateMessage}>{t('player.empty.message')}</Text>
        <Button variant="outlined" accessibilityLabel={t('player.back')} onPress={onBackToLessons}>
          {t('player.back')}
        </Button>
      </View>
    </View>
  );
};

type ErrorProps = {
  onRetry?: () => void;
  onBackToLessons: () => void;
};

const LessonPlayerError = ({ onRetry, onBackToLessons }: ErrorProps) => {
  const { t } = useLocalization();

  return (
    <View style={styles.root} testID={LESSON_PLAYER_TEST_ID}>
      <View
        style={styles.errorBanner}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        testID={LESSON_PLAYER_ERROR_TEST_ID}
      >
        <Text style={styles.errorMessage}>{t('player.error.message')}</Text>
        <View style={styles.stateActions}>
          {onRetry ? (
            <Button variant="filled" accessibilityLabel={t('player.error.retry')} onPress={onRetry}>
              {t('player.error.retry')}
            </Button>
          ) : null}
          <Button
            variant="outlined"
            accessibilityLabel={t('player.back')}
            onPress={onBackToLessons}
          >
            {t('player.back')}
          </Button>
        </View>
      </View>
    </View>
  );
};

type DeckProps = {
  lesson: NonNullable<LessonPlayerProps['lesson']>;
  onBackToLessons: () => void;
};

const LessonPlayerDeck = ({ lesson, onBackToLessons }: DeckProps) => {
  const { t } = useLocalization();
  const player = useLessonPlayer(lesson);

  const stepLabel = t('player.slideOf', {
    current: player.currentIndex + 1,
    total: player.totalSteps,
  });

  const progressSlides = lesson.slides.map((slide) => ({
    type: slide.kind === 'activity' ? ('activity' as const) : ('lesson' as const),
  }));

  return (
    <View style={styles.root} testID={LESSON_PLAYER_TEST_ID}>
      <LessonPlayerNavigator
        slides={progressSlides}
        current={player.currentIndex}
        label={stepLabel}
        canGoBack={player.canGoBack}
        canGoNext={player.canGoNext}
        onBack={player.goBack}
        onNext={player.goNext}
      />
      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
        {player.isResultsSlide ? (
          <LessonResults
            lesson={lesson}
            answers={player.gradedAnswers}
            onRetake={player.reset}
            onBackToLessons={onBackToLessons}
            persistOnMount={player.persistOnMount}
          />
        ) : player.currentSlide ? (
          <SlideView
            key={player.currentSlide.id}
            slide={player.currentSlide}
            onAnswered={player.onAnswered}
            initialAnswer={player.answers[player.currentSlide.id]}
          />
        ) : null}
      </ScrollView>
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
  bodyContent: {
    flexGrow: 1,
  },
  state: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.s4,
    padding: theme.spacing.s4,
  },
  stateMessage: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
  errorBanner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.s4,
    padding: theme.spacing.s4,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.shape.card,
  },
  errorMessage: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onErrorContainer,
    textAlign: 'center',
  },
  stateActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.s3,
  },
}));
