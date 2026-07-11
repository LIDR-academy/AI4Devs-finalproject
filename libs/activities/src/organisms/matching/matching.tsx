import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button, Card, Icon } from '@helsoft/components';

export type MatchingItemView = { id: string; label: string };
/** A learner-formed pair before submit. */
export type MatchingPairSelection = { leftId: string; rightId: string };
/** A graded pair, supplied post-submit to drive the result display. */
export type MatchingResultPair = { leftId: string; rightId: string; isCorrect: boolean };

export type MatchingResult = {
  pairs: MatchingResultPair[];
  isCorrect: boolean;
  summary: string;
};

export type MatchingLabels = {
  submit: string;
  correct: string;
  incorrect: string;
  correctPair: string;
  incorrectPair: string;
  explanationHeading: string;
  unavailable: string;
};

export type MatchingProps = {
  prompt: string;
  leftItems: MatchingItemView[];
  rightItems: MatchingItemView[];
  /** Forces the unavailable (Error) state — set by the wrapper when the slide's correctPairs are malformed. */
  unavailable?: boolean;
  /** Optional seed for Storybook / demos — paints formed pairs before any taps. */
  initialPairs?: MatchingPairSelection[];
  /** Set once graded → locks the activity and drives the per-pair result display. */
  result?: MatchingResult | null;
  explanation?: string;
  labels: MatchingLabels;
  onSubmit: (pairs: MatchingPairSelection[]) => void;
};

type PendingSelection = { column: 'left' | 'right'; id: string } | null;

/** Visual state for a column item. `undefined` = unpaired default (avoids a dead 'default' string). */
type ItemVisualState = 'pending' | 'paired' | 'correct' | 'incorrect' | undefined;

const findPairForItem = (
  pairs: MatchingPairSelection[],
  itemId: string,
): MatchingPairSelection | undefined =>
  pairs.find((pair) => pair.leftId === itemId || pair.rightId === itemId);

/**
 * Matching — presentational organism for a matching activity slide.
 * Owns ephemeral tap-to-pair interaction while unsubmitted; locks from `result` once graded.
 */
export const Matching = ({
  prompt,
  leftItems,
  rightItems,
  unavailable = false,
  initialPairs = [],
  result,
  explanation,
  labels,
  onSubmit,
}: MatchingProps) => {
  const { theme } = useUnistyles();
  const [pending, setPending] = useState<PendingSelection>(null);
  const [formedPairs, setFormedPairs] = useState<MatchingPairSelection[]>(initialPairs);

  const locked = !!result;
  // Empty columns return early below — once past that guard, length > 0 is implied.
  const allPaired = formedPairs.length === leftItems.length;
  // null (not '') while unsubmitted — empty string is never rendered and is mutation-blind.
  const resultLabel = result ? (result.isCorrect ? labels.correct : labels.incorrect) : null;
  // One-column empty is also unequal; both-empty is 0===0 so needs an explicit empty guard.
  const isEmpty = leftItems.length === 0;
  const isUnequal = leftItems.length !== rightItems.length;
  const isUnavailable = unavailable || isEmpty || isUnequal;

  useEffect(() => {
    if (!result || Platform.OS === 'android') return;
    // Announce from result directly — resultLabel is non-null whenever result is set.
    AccessibilityInfo.announceForAccessibility(
      result.isCorrect ? labels.correct : labels.incorrect,
    );
  }, [result, labels.correct, labels.incorrect]);

  // Empty / unequal lengths (self-detect) or wrapper-forced unavailable → graceful degradation.
  if (isUnavailable) {
    return (
      <Card style={styles.root}>
        <Text style={styles.prompt}>{labels.unavailable}</Text>
      </Card>
    );
  }

  const releasePair = (itemId: string) => {
    setFormedPairs((prev) => prev.filter((pair) => pair.leftId !== itemId && pair.rightId !== itemId));
    setPending(null);
  };

  const handleItemPress = (column: 'left' | 'right', id: string) => {
    const existing = findPairForItem(formedPairs, id);
    if (existing) {
      releasePair(id);
      return;
    }

    if (!pending) {
      setPending({ column, id });
      return;
    }

    if (pending.column === column && pending.id === id) {
      setPending(null);
      return;
    }

    if (pending.column === column) {
      setPending({ column, id });
      return;
    }

    const leftId = column === 'left' ? id : pending.id;
    const rightId = column === 'right' ? id : pending.id;
    setFormedPairs((prev) => [...prev, { leftId, rightId }]);
    setPending(null);
  };

  const itemState = (column: 'left' | 'right', id: string): ItemVisualState => {
    if (result) {
      const graded = result.pairs.find((pair) =>
        column === 'left' ? pair.leftId === id : pair.rightId === id,
      );
      if (graded) return graded.isCorrect ? 'correct' : 'incorrect';
      return undefined;
    }
    if (pending?.column === column && pending.id === id) return 'pending';
    if (findPairForItem(formedPairs, id)) return 'paired';
    return undefined;
  };

  const itemAccessibilityLabel = (item: MatchingItemView, state: ItemVisualState): string => {
    if (state === 'correct') return `${item.label}, ${labels.correctPair}`;
    if (state === 'incorrect') return `${item.label}, ${labels.incorrectPair}`;
    return item.label;
  };

  const renderItem = (column: 'left' | 'right', item: MatchingItemView) => {
    const state = itemState(column, item.id);
    const feedbackIcon = state === 'correct' ? 'check_circle' : state === 'incorrect' ? 'cancel' : null;
    const feedbackColor = state === 'correct' ? theme.colors.tertiary : theme.colors.error;

    return (
      <Pressable
        key={item.id}
        accessibilityRole="button"
        accessibilityLabel={itemAccessibilityLabel(item, state)}
        accessibilityState={{
          disabled: locked,
          selected: state === 'pending' || state === 'paired',
        }}
        // Lock via omitting onPress (not an early-return) so mutation tests observe the guard.
        onPress={locked ? undefined : () => handleItemPress(column, item.id)}
        style={[styles.item, styles.itemState(state)]}
      >
        <Text style={styles.itemLabel(state)}>{item.label}</Text>
        {feedbackIcon ? <Icon name={feedbackIcon} size={22} fill color={feedbackColor} /> : null}
      </Pressable>
    );
  };

  return (
    <Card style={styles.root}>
      <Text style={styles.prompt}>{prompt}</Text>
      <View style={styles.columns}>
        <View style={styles.column}>{leftItems.map((item) => renderItem('left', item))}</View>
        <View style={styles.column}>{rightItems.map((item) => renderItem('right', item))}</View>
      </View>
      {!locked ? (
        <Button disabled={!allPaired} fullWidth onPress={() => onSubmit(formedPairs)}>
          {labels.submit}
        </Button>
      ) : null}
      {result ? (
        <View
          accessibilityRole={result.isCorrect ? undefined : 'alert'}
          style={[styles.banner, result.isCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}
        >
          <Text
            style={styles.bannerText(result.isCorrect)}
            accessibilityLiveRegion={result.isCorrect ? 'polite' : 'assertive'}
          >
            {resultLabel}
          </Text>
          <Text style={styles.summary(result.isCorrect)}>{result.summary}</Text>
        </View>
      ) : null}
      {result && explanation ? (
        <View style={styles.explanation}>
          <Text style={styles.explanationHeading}>{labels.explanationHeading}</Text>
          <Text style={styles.explanationBody}>{explanation}</Text>
        </View>
      ) : null}
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
  columns: {
    flexDirection: 'row',
    gap: theme.spacing.s3,
  },
  column: {
    flex: 1,
    gap: theme.spacing.s3,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
    paddingVertical: theme.spacing.s3,
    paddingHorizontal: theme.spacing.s3,
    borderRadius: theme.shape.md,
    minHeight: theme.layout.touchTarget,
  },
  itemState: (state: ItemVisualState) => {
    switch (state) {
      case 'pending':
        return {
          backgroundColor: theme.colors.primaryContainer,
          borderWidth: 2,
          borderColor: theme.colors.primary,
        };
      case 'paired':
        return {
          backgroundColor: theme.colors.secondaryContainer,
          borderWidth: 1,
          borderColor: theme.colors.outline,
        };
      case 'correct':
        return {
          backgroundColor: theme.utils.mixHex(theme.colors.tertiaryContainer, theme.colors.surface, 0.55),
          borderWidth: 2,
          borderColor: theme.colors.tertiary,
        };
      case 'incorrect':
        return {
          backgroundColor: theme.colors.errorContainer,
          borderWidth: 2,
          borderColor: theme.colors.error,
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.outlineVariant,
        };
    }
  },
  itemLabel: (state: ItemVisualState) => ({
    ...theme.typography.bodyLarge,
    flex: 1,
    color:
      state === 'pending'
        ? theme.colors.onPrimaryContainer
        : state === 'paired'
          ? theme.colors.onSecondaryContainer
          : state === 'correct'
            ? theme.colors.onTertiary
            : state === 'incorrect'
              ? theme.colors.onErrorContainer
              : theme.colors.onSurface,
  }),
  banner: {
    borderRadius: theme.shape.card,
    padding: theme.spacing.s3,
    gap: theme.spacing.s1,
  },
  bannerCorrect: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
  bannerIncorrect: {
    backgroundColor: theme.colors.errorContainer,
  },
  bannerText: (isCorrect: boolean) => ({
    ...theme.typography.bodyMedium,
    color: isCorrect ? theme.colors.onTertiaryContainer : theme.colors.onErrorContainer,
  }),
  summary: (isCorrect: boolean) => ({
    ...theme.typography.bodySmall,
    color: isCorrect ? theme.colors.onTertiaryContainer : theme.colors.onErrorContainer,
  }),
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
}));
