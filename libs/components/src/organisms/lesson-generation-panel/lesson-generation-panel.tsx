import { useLocalization } from '@helsoft/localization';
import type { LessonComposition } from '@helsoft/types';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { Card } from '../../atoms/card/card';
import { GenerationProgress } from '../../molecules/generation-progress/generation-progress';
import type { GenerationProgressStepStatus } from '../../molecules/generation-progress/generation-progress.types';
import { RadioGroup } from '../../molecules/radio-group/radio-group';

import { COMPOSITION_OPTION_VALUES, stepToIndex } from './lesson-generation-panel.helpers';
import type { LessonGenerationPanelProps } from './lesson-generation-panel.types';

const COMPOSITION_LABEL_KEYS: Record<LessonComposition, string> = {
  'instructional-only': 'generation.composition.instructionalOnly',
  'activity-only': 'generation.composition.activityOnly',
  both: 'generation.composition.both',
};

const STEP_LABEL_KEYS = [
  'generation.step.reading',
  'generation.step.generating',
  'generation.step.attaching',
];

/** review.md round-1 finding #1 (blocker) — `GenerationProgress`'s per-status accessibility
 * suffix must come from `t()`, not a literal baked into the presentational molecule. This
 * organism owns the `generation.*` keys already (see the doc comment below), so the status
 * words are built here too. */
const STATUS_LABEL_KEYS: Record<GenerationProgressStepStatus, string> = {
  done: 'generation.step.status.done',
  current: 'generation.step.status.current',
  upcoming: 'generation.step.status.upcoming',
};

/**
 * LessonGenerationPanel — presentational organism configuring + triggering generation
 * (spec.md UI states table), all 4 UI states: Empty / Loading / Content / Error (task-13).
 * Stateless — driven by props + `useLocalization` for its own chrome copy; the
 * `GenerationProgress` molecule's step labels are built here too (this organism owns the
 * `generation.*` i18n keys so the molecule itself stays i18n-free, per task-8).
 */
export const LessonGenerationPanel = ({
  state,
  composition,
  onCompositionChange,
  canGenerate,
  onGenerate,
  currentStep,
  slideCount = 0,
  onOpenInPlayer,
  errorMessage,
  errorActionLabel,
  onErrorAction,
}: LessonGenerationPanelProps) => {
  const { t } = useLocalization();
  const disabled = state === 'loading';

  // review.md round-1 finding #7 (minor) — stabilizes these derived arrays/objects across
  // re-renders instead of rebuilding them on every render (fixed 3-item lists; a perf-only
  // refactor, no behavior change).
  const options = useMemo(
    () =>
      COMPOSITION_OPTION_VALUES.map((value) => ({
        value,
        label: t(COMPOSITION_LABEL_KEYS[value]),
      })),
    [t],
  );
  const steps = useMemo(() => STEP_LABEL_KEYS.map((key) => ({ label: t(key) })), [t]);
  const statusLabels = useMemo<Record<GenerationProgressStepStatus, string>>(
    () => ({
      done: t(STATUS_LABEL_KEYS.done),
      current: t(STATUS_LABEL_KEYS.current),
      upcoming: t(STATUS_LABEL_KEYS.upcoming),
    }),
    [t],
  );

  return (
    <Card>
      <View style={styles.root}>
        <View style={styles.section}>
          <Text style={styles.heading}>{t('generation.composition.heading')}</Text>
          <RadioGroup
            options={options}
            value={composition}
            onChange={onCompositionChange}
            disabled={disabled}
            accessibilityLabel={t('generation.composition.heading')}
          />
        </View>

        <Button disabled={disabled || !canGenerate} onPress={onGenerate}>
          {t('generation.generate')}
        </Button>

        {state === 'loading' ? (
          <GenerationProgress
            steps={steps}
            currentIndex={stepToIndex(currentStep)}
            statusLabels={statusLabels}
          />
        ) : null}

        {state === 'content' ? (
          <View style={styles.section}>
            <Text style={styles.summary}>
              {t('generation.ready.slideCount', { count: slideCount })}
            </Text>
            <Text style={styles.summary}>
              {t('generation.ready.composition', {
                composition: t(COMPOSITION_LABEL_KEYS[composition]),
              })}
            </Text>
            <Button onPress={onOpenInPlayer}>{t('generation.ready.openInPlayer')}</Button>
          </View>
        ) : null}

        {state === 'error' ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorBannerText} accessibilityLiveRegion="assertive">
              {errorMessage}
            </Text>
            {errorActionLabel ? <Button onPress={onErrorAction}>{errorActionLabel}</Button> : null}
          </View>
        ) : null}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s4,
  },
  section: {
    gap: theme.spacing.s3,
  },
  heading: {
    ...theme.typography.titleSmall,
    color: theme.colors.onSurfaceVariant,
  },
  summary: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurface,
  },
  errorBanner: {
    gap: theme.spacing.s3,
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.shape.card,
    padding: theme.spacing.s3,
  },
  errorBannerText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onErrorContainer,
  },
}));
