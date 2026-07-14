import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { Icon } from '../../atoms/icon/icon';

import { getStepStatus } from './generation-progress.helpers';
import type {
  GenerationProgressProps,
  GenerationProgressStepStatus,
} from './generation-progress.types';

export const GENERATION_PROGRESS_ANNOUNCEMENT_TEST_ID = 'generation-progress-announcement';

/**
 * GenerationProgress — presentational molecule for the multi-step generation progress the
 * human chose (spec.md decision #4): an ordered list of labeled steps, each marked
 * upcoming/current/done. Stateless — driven entirely by props; both `step.label` and the
 * per-status accessibility suffix (`statusLabels`) are injected by the wiring layer (no i18n
 * inside this component, mirrors `PdfUploadPanel`'s split — review.md round-1 finding #1).
 */
export const GenerationProgress = ({
  steps,
  currentIndex,
  statusLabels,
}: GenerationProgressProps) => {
  const { theme } = useUnistyles();
  const currentLabel = steps[currentIndex]?.label;

  return (
    <View accessibilityRole="list" style={styles.root}>
      {steps.map((step, index) => {
        const status = getStepStatus(index, currentIndex);
        return (
          <View
            key={step.label}
            accessible
            accessibilityLabel={`${step.label}, ${statusLabels[status]}`}
            style={styles.step}
          >
            <View style={styles.indicator(status)}>
              {status === 'done' ? (
                <Icon name="check" size={theme.spacing.s4} color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.indicatorText(status)}>{index + 1}</Text>
              )}
            </View>
            <Text style={styles.label(status)}>{step.label}</Text>
          </View>
        );
      })}
      <Text
        testID={GENERATION_PROGRESS_ANNOUNCEMENT_TEST_ID}
        style={styles.srOnly}
        accessibilityLiveRegion="polite"
      >
        {currentLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s3,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  indicator: (status: GenerationProgressStepStatus) => ({
    width: theme.spacing.s6,
    height: theme.spacing.s6,
    borderRadius: theme.shape.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      status === 'upcoming' ? theme.colors.surfaceContainerHighest : theme.colors.primary,
  }),
  indicatorText: (status: GenerationProgressStepStatus) => ({
    ...theme.typography.labelMedium,
    color: status === 'upcoming' ? theme.colors.onSurfaceVariant : theme.colors.onPrimary,
  }),
  label: (status: GenerationProgressStepStatus) => ({
    ...theme.typography.bodyMedium,
    color: status === 'upcoming' ? theme.colors.onSurfaceVariant : theme.colors.onSurface,
  }),
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
}));
