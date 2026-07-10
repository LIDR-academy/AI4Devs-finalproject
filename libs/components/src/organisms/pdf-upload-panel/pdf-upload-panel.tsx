import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { Card } from '../../atoms/card/card';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';

/** 'idle' is the minimal pre-pick render the wiring layer (task-8) needs — just the persistent
 * choose-file control, nothing else; it is not the fuller Empty state (constraints hint, AC7),
 * which task-11 adds behind its own failing tests. Loading and Content are this slice's real
 * states; task-11 adds 'error' to this union without reshaping the component (kept an open
 * discriminator on purpose). */
export type PdfUploadPanelState = 'idle' | 'loading' | 'content';

export type PdfUploadPanelLabels = {
  /** Progress copy shown while the loading state is active, e.g. "Extracting…". */
  loading: string;
  /** The persistent choose-file control's label, e.g. "Choose a PDF". */
  chooseFile: string;
  filenameLabel: string;
  pageCountLabel: string;
  imageCountLabel: string;
  continueLabel: string;
};

export type PdfUploadPanelProps = {
  state: PdfUploadPanelState;
  labels: PdfUploadPanelLabels;
  /** Picks a (new) file — disabled while `state` is 'loading' (@s5). */
  onChooseFile: () => void;
  /** Content-state summary fields (@s6). */
  filename?: string;
  pageCount?: number;
  imageCount?: number;
  /** Content-state continue affordance (@s6) — the generation hand-off is out of scope here. */
  onContinue?: () => void;
};

export const PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID = 'pdf-upload-panel-loading-indicator';

/**
 * PdfUploadPanel — presentational organism (Loading + Content states this slice; Empty + Error
 * land in task-11). Stateless: driven entirely by props, composed from existing atoms
 * (Card/Button/ProgressIndicator) — no ad-hoc UI, no hooks, no services.
 */
export const PdfUploadPanel = ({
  state,
  labels,
  onChooseFile,
  filename,
  pageCount,
  imageCount,
  onContinue,
}: PdfUploadPanelProps) => {
  const isLoading = state === 'loading';

  return (
    <Card>
      <View style={styles.root}>
        <Button disabled={isLoading} onPress={onChooseFile}>
          {labels.chooseFile}
        </Button>

        {isLoading ? (
          <View testID={PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID} style={styles.row}>
            <ProgressIndicator variant="circular" />
            <Text style={styles.loadingText}>{labels.loading}</Text>
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
}));
