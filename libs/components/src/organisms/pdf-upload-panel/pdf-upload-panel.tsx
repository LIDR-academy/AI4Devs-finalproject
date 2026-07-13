import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { Card } from '../../atoms/card/card';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';

import type { PdfUploadPanelProps } from './pdf-upload-panel.types';
import { usePdfUploadPanel } from './use-pdf-upload-panel';

export const PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID = 'pdf-upload-panel-loading-indicator';

/**
 * PdfUploadPanel — presentational organism, all 4 UI states (Empty/Loading/Content/Error).
 * Stateless UI: driven by props + `useLocalization` for chrome copy (`upload.*` keys).
 * Error / image-count announcement strings stay injected by the wiring layer.
 */
export const PdfUploadPanel = ({
  state,
  maxMb = 10,
  maxPages = 20,
  onChooseFile,
  filename,
  pageCount,
  imageCount,
  imageCountAnnouncement,
  onContinue,
  errorMessage,
  onRetry,
  canRetry = true,
}: PdfUploadPanelProps) => {
  const { t, isLoading } = usePdfUploadPanel({ state, errorMessage });

  return (
    <Card>
      <View style={styles.root}>
        <Button disabled={isLoading} onPress={onChooseFile}>
          {t('upload.chooseFile')}
        </Button>

        {state === 'idle' ? (
          <Text style={styles.hintText}>
            {t('upload.constraintsHint', {
              maxMb,
              maxPages,
            })}
          </Text>
        ) : null}

        {isLoading ? (
          <View testID={PDF_UPLOAD_PANEL_LOADING_INDICATOR_TEST_ID} style={styles.row}>
            <ProgressIndicator variant="circular" />
            <Text style={styles.loadingText} accessibilityLiveRegion="polite">
              {t('upload.loading')}
            </Text>
          </View>
        ) : null}

        {state === 'content' ? (
          <View style={styles.summary}>
            <View
              style={styles.summaryRow}
              accessible
              accessibilityLabel={`${t('upload.filenameLabel')}: ${filename}`}
            >
              <Text style={styles.summaryLabel}>{t('upload.filenameLabel')}</Text>
              <Text style={styles.summaryValue}>{filename}</Text>
            </View>
            <View
              style={styles.summaryRow}
              accessible
              accessibilityLabel={`${t('upload.pageCountLabel')}: ${pageCount}`}
            >
              <Text style={styles.summaryLabel}>{t('upload.pageCountLabel')}</Text>
              <Text style={styles.summaryValue}>{pageCount}</Text>
            </View>
            <View
              style={styles.summaryRow}
              accessible
              accessibilityLabel={
                imageCountAnnouncement ?? `${t('upload.imageCountLabel')}: ${imageCount}`
              }
            >
              <Text style={styles.summaryLabel}>{t('upload.imageCountLabel')}</Text>
              <Text style={styles.summaryValue}>{imageCount}</Text>
            </View>
            <Button onPress={onContinue}>{t('upload.continue')}</Button>
          </View>
        ) : null}

        {state === 'error' ? (
          <View style={styles.errorBanner} accessibilityRole="alert">
            <Text style={styles.errorBannerText} accessibilityLiveRegion="assertive">
              {errorMessage}
            </Text>
            {canRetry ? <Button onPress={onRetry}>{t('upload.retryAction')}</Button> : null}
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
