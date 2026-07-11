import { useEffect } from 'react';
import { AccessibilityInfo, Platform, Text, TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Button, Card, Icon } from '@helsoft/components';

const BLANK_MARKER = '____';

export type FillInTheBlankResult = {
  isCorrect: boolean;
  /** Shown when incorrect (acceptedAnswers[0]). Omitted/unused when correct. */
  acceptedAnswerShown?: string;
};

export type FillInTheBlankLabels = {
  submit: string;
  correct: string;
  incorrect: string;
  explanationHeading: string;
  unavailable: string;
  /** Accessible name for the blank TextInput. */
  blankInput: string;
};

export type FillInTheBlankProps = {
  /** Prompt containing exactly one `____` (organism splits around it). */
  content: string;
  value: string;
  maxLength: number;
  unavailable?: boolean;
  result?: FillInTheBlankResult | null;
  explanation?: string;
  labels: FillInTheBlankLabels;
  onChangeValue: (value: string) => void;
  onSubmit: () => void;
};

const splitAroundBlank = (content: string): { before: string; after: string } | null => {
  const idx = content.indexOf(BLANK_MARKER);
  if (idx === -1) return null;
  const next = content.indexOf(BLANK_MARKER, idx + BLANK_MARKER.length);
  if (next !== -1) return null;
  return {
    before: content.slice(0, idx),
    after: content.slice(idx + BLANK_MARKER.length),
  };
};

/**
 * FillInTheBlank — presentational organism for a fill-in-the-blank activity slide.
 * Controlled: value/result from parent; reports change/submit up. Locks from `result`.
 */
export const FillInTheBlank = ({
  content,
  value,
  maxLength,
  unavailable = false,
  result,
  explanation,
  labels,
  onChangeValue,
  onSubmit,
}: FillInTheBlankProps) => {
  const { theme } = useUnistyles();
  const parts = splitAroundBlank(content);
  const locked = !!result;
  const isUnavailable = unavailable || !parts;
  const resultLabel = result ? (result.isCorrect ? labels.correct : labels.incorrect) : null;

  useEffect(() => {
    // Matching/MCQ: accessibilityLiveRegion is Android-only (TalkBack). Imperative
    // announceForAccessibility covers iOS/web; skip on Android to avoid duplicate announce.
    if (!result || Platform.OS === 'android') return;
    AccessibilityInfo.announceForAccessibility(
      result.isCorrect ? labels.correct : labels.incorrect,
    );
  }, [result, labels.correct, labels.incorrect]);

  if (isUnavailable) {
    return (
      <Card style={styles.root}>
        <Text style={styles.prompt}>{labels.unavailable}</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.root}>
      <View style={styles.promptRow}>
        {parts.before.length > 0 ? <Text style={styles.prompt}>{parts.before}</Text> : null}
        <TextInput
          accessibilityLabel={labels.blankInput}
          accessibilityState={{ disabled: locked }}
          value={value}
          maxLength={maxLength}
          editable={!locked}
          onChangeText={locked ? undefined : onChangeValue}
          onSubmitEditing={locked ? undefined : onSubmit}
          returnKeyType="done"
          style={styles.blank}
        />
        {parts.after.length > 0 ? <Text style={styles.prompt}>{parts.after}</Text> : null}
      </View>
      <Button
        disabled={locked}
        fullWidth
        onPress={locked ? undefined : onSubmit}
      >
        {labels.submit}
      </Button>
      {result ? (
        <View
          style={[styles.banner, result.isCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}
        >
          <View
            accessibilityRole={result.isCorrect ? undefined : 'alert'}
            style={styles.bannerRow}
          >
            <View
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              <Icon
                name={result.isCorrect ? 'check_circle' : 'cancel'}
                size={22}
                fill
                color={result.isCorrect ? theme.colors.tertiary : theme.colors.error}
              />
            </View>
            <Text
              style={styles.bannerText(result.isCorrect)}
              accessibilityLiveRegion={result.isCorrect ? 'polite' : 'assertive'}
            >
              {resultLabel}
            </Text>
          </View>
          {!result.isCorrect && result.acceptedAnswerShown ? (
            <Text style={styles.bannerText(false)}>{result.acceptedAnswerShown}</Text>
          ) : null}
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
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  prompt: {
    ...theme.typography.titleLarge,
    color: theme.colors.onSurface,
  },
  blank: {
    ...theme.typography.titleLarge,
    color: theme.colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    minWidth: theme.spacing.s16,
    minHeight: theme.layout.touchTarget,
    paddingVertical: theme.spacing.s1,
  },
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
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  bannerText: (isCorrect: boolean) => ({
    ...theme.typography.bodyMedium,
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
