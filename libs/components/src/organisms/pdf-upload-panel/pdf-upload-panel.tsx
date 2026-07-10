import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { Card } from '../../atoms/card/card';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';

/** 'idle' is the Empty/pristine state (AC7, @s7) — no file chosen yet. 'error' (Slice 2, task-11)
 * covers every `PdfExtractionErrorCode` (@s8-@s13); the wiring layer supplies the per-code
 * message. */
export type PdfUploadPanelState = 'idle' | 'loading' | 'content' | 'error';

export type PdfUploadPanelLabels = {
  /** Progress copy shown while the loading state is active, e.g. "Extracting…". */
  loading: string;
  /** The persistent choose-file control's label, e.g. "Choose a PDF". */
  chooseFile: string;
  filenameLabel: string;
  pageCountLabel: string;
  imageCountLabel: string;
  continueLabel: string;
  /** Empty-state hint listing the max size/page constraints (@s7). Already-interpolated by the
   * wiring layer — this component just renders it. */
  constraintsHint: string;
  /** The Error-state retry affordance's label (@s8-@s13), e.g. "Try again". */
  retry: string;
};

export type PdfUploadPanelProps = {
  state: PdfUploadPanelState;
  labels: PdfUploadPanelLabels;
  /** Picks a (new) file — disabled while `state` is 'loading' (@s5); stays enabled in every other
   * state, including 'error', so the panel is always "usable again". */
  onChooseFile: () => void;
  /** Content-state summary fields (@s6). */
  filename?: string;
  pageCount?: number;
  imageCount?: number;
  /** Content-state continue affordance (@s6) — the generation hand-off is out of scope here. */
  onContinue?: () => void;
  /** Error-state message for the current `PdfExtractionErrorCode` (@s8-@s13) — already localized
   * by the wiring layer. */
  errorMessage?: string;
  /** Error-state retry affordance (@s8-@s13) — re-attempts the last extraction. */
  onRetry?: () => void;
  /** Whether the Error-state retry affordance should render at all. Defaults to `true`. The
   * wiring layer sets this to `false` for the 6 non-transient `PdfExtractionErrorCode`s
   * (spec.md's Error contract table) — where `retry()` would deterministically reproduce the
   * same failure — since the persistent choose-file control is already the real recovery action
   * for those. */
  canRetry?: boolean;
};

export const PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID = 'pdf-upload-panel-loading-indicator';

/**
 * PdfUploadPanel — presentational organism, all 4 UI states (Empty/Loading/Content/Error).
 * Stateless: driven entirely by props, composed from existing atoms (Card/Button/
 * ProgressIndicator) — no ad-hoc UI, no hooks, no services.
 */
export const PdfUploadPanel = ({
  state,
  labels,
  onChooseFile,
  filename,
  pageCount,
  imageCount,
  onContinue,
  errorMessage,
  onRetry,
  canRetry = true,
}: PdfUploadPanelProps) => {
  const isLoading = state === 'loading';

  // @s16 (WCAG 4.1.3) — accessibilityLiveRegion (below, on the visible text nodes) only reaches
  // Android/Web assistive tech; iOS VoiceOver needs the imperative, cross-platform
  // AccessibilityInfo call fired directly on the transition, mirroring `login-form.tsx`'s
  // established pattern for its own loading/error announcements.
  useEffect(() => {
    if (isLoading) AccessibilityInfo.announceForAccessibility(labels.loading);
  }, [isLoading, labels.loading]);

  useEffect(() => {
    if (errorMessage) AccessibilityInfo.announceForAccessibility(errorMessage);
  }, [errorMessage]);

  return (
    <Card>
      <View style={styles.root}>
        <Button disabled={isLoading} onPress={onChooseFile}>
          {labels.chooseFile}
        </Button>

        {state === 'idle' ? <Text style={styles.hintText}>{labels.constraintsHint}</Text> : null}

        {isLoading ? (
          <View testID={PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID} style={styles.row}>
            <ProgressIndicator variant="circular" />
            <Text style={styles.loadingText} accessibilityLiveRegion="polite">
              {labels.loading}
            </Text>
          </View>
        ) : null}

        {state === 'content' ? (
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{labels.filenameLabel}</Text>
              <Text style={styles.summaryValue}>{filename}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{labels.pageCountLabel}</Text>
              <Text style={styles.summaryValue}>{pageCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{labels.imageCountLabel}</Text>
              <Text style={styles.summaryValue}>{imageCount}</Text>
            </View>
            <Button onPress={onContinue}>{labels.continueLabel}</Button>
          </View>
        ) : null}

        {state === 'error' ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorBannerText} accessibilityLiveRegion="assertive">
              {errorMessage}
            </Text>
            {canRetry ? <Button onPress={onRetry}>{labels.retry}</Button> : null}
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  loadingText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
  summary: {
    gap: theme.spacing.s3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
  summaryValue: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurface,
  },
  hintText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
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
