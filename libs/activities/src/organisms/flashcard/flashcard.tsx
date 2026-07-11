import { Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button, Card, Icon } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';

import { buildFlashcardAnswer } from './flashcard.helpers';
import type { FlashcardProps } from './flashcard.types';
import { useFlashcard } from './use-flashcard';

export type { FlashcardProps } from './flashcard.types';

/**
 * Flashcard — activity organism. Owns reveal (one-way) + self-mark (one-time lock);
 * self-marked only — no grading, reports via `onAnswered` once on self-mark.
 */
export const Flashcard = ({
  slide,
  onAnswered,
  initialAnswer = null,
  initialRevealed = false,
}: FlashcardProps) => {
  const { theme } = useUnistyles();
  const { t } = useLocalization();

  const labels = {
    reveal: t('activity.flashcard.reveal'),
    recalled: t('activity.flashcard.recalled'),
    notRecalled: t('activity.flashcard.notRecalled'),
    recalledConfirmed: t('activity.flashcard.recalledConfirmed'),
    notRecalledConfirmed: t('activity.flashcard.notRecalledConfirmed'),
    answerHeading: t('activity.flashcard.answerHeading'),
    explanationHeading: t('activity.flashcard.explanationHeading'),
    unavailable: t('activity.flashcard.unavailable'),
  };

  const { answer, setAnswer, isRevealed, isUnavailable, locked, setRevealed } = useFlashcard({
    slide,
    initialAnswer,
    initialRevealed,
    labels,
  });

  if (isUnavailable) {
    return (
      <Card testID="flashcard-root" style={styles.root}>
        <Text style={styles.prompt}>{labels.unavailable}</Text>
      </Card>
    );
  }

  const handleReveal = () => {
    if (isRevealed || isUnavailable) return;
    setRevealed(true);
  };

  const handleSelfMark = (recalled: boolean) => {
    if (locked || !isRevealed || isUnavailable) return;
    const built = buildFlashcardAnswer(slide, recalled);
    setAnswer(built);
    onAnswered?.(built);
  };

  const renderMarkButton = (recalled: boolean) => {
    const isChosen = answer ? answer.recalled === recalled : false;
    const idleLabel = recalled ? labels.recalled : labels.notRecalled;
    const confirmedLabel = recalled ? labels.recalledConfirmed : labels.notRecalledConfirmed;
    const label = isChosen ? confirmedLabel : idleLabel;
    const iconName = isChosen ? (recalled ? 'check_circle' : 'cancel') : null;
    const iconColor = recalled ? theme.colors.tertiary : theme.colors.error;

    return (
      <Pressable
        key={recalled ? 'recalled' : 'not-recalled'}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled: locked, selected: isChosen }}
        onPress={locked ? undefined : () => handleSelfMark(recalled)}
        style={[styles.markButton, isChosen && styles.markButtonChosen]}
      >
        <Text style={styles.markButtonLabel(isChosen)}>{label}</Text>
        {iconName ? <Icon name={iconName} size={20} fill color={iconColor} /> : null}
      </Pressable>
    );
  };

  return (
    <Card testID="flashcard-root" style={styles.root}>
      <Text style={styles.prompt}>{slide.content}</Text>
      {!isRevealed ? (
        <Button fullWidth onPress={handleReveal}>
          {labels.reveal}
        </Button>
      ) : (
        <>
          <View testID="flashcard-answer" style={styles.answer}>
            <Text style={styles.answerHeading}>{labels.answerHeading}</Text>
            <Text style={styles.answerBody}>{slide.back}</Text>
          </View>
          {slide.explanation ? (
            <View testID="flashcard-explanation" style={styles.explanation}>
              <Text style={styles.explanationHeading}>{labels.explanationHeading}</Text>
              <Text style={styles.explanationBody}>{slide.explanation}</Text>
            </View>
          ) : null}
          <View testID="flashcard-self-mark" style={styles.selfMark}>
            {renderMarkButton(true)}
            {renderMarkButton(false)}
          </View>
        </>
      )}
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s4,
  },
  prompt: {
    ...theme.typography.titleLarge,
    color: theme.colors.onSurface,
  },
  answer: {
    gap: theme.spacing.s1,
  },
  answerHeading: {
    ...theme.typography.titleSmall,
    color: theme.colors.onSurfaceVariant,
  },
  answerBody: {
    ...theme.typography.bodyLarge,
    color: theme.colors.onSurface,
  },
  explanation: {
    gap: theme.spacing.s1,
  },
  explanationHeading: {
    ...theme.typography.titleSmall,
    color: theme.colors.onSurfaceVariant,
  },
  explanationBody: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurface,
  },
  selfMark: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
  },
  markButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s2,
    paddingVertical: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s3,
    borderRadius: theme.shape.md,
    minHeight: theme.layout.touchTarget,
    borderWidth: 1,
    borderColor: theme.colors.outline,
  },
  markButtonChosen: {
    backgroundColor: theme.colors.secondaryContainer,
    borderColor: theme.colors.tertiary,
  },
  markButtonLabel: (isChosen: boolean) => ({
    ...theme.typography.labelLarge,
    color: isChosen ? theme.colors.onSecondaryContainer : theme.colors.onSurface,
  }),
}));
