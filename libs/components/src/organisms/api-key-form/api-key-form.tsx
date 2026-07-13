import { Linking, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';
import { TextField } from '../../molecules/text-field/text-field';
import { Dialog } from '../dialog/dialog';

import type { ApiKeyFormProps } from './api-key-form.types';
import { useApiKeyForm } from './use-api-key-form';

export const LOADING_STATUS_TEST_ID = 'api-key-form-loading-status';

/**
 * ApiKeyForm — presentational organism covering all 4 UI states (Empty/Content/Loading/Error,
 * spec.md's UI-states table). Pure/controlled: owns the local key field value, the Replace
 * toggle, and the remove-confirmation Dialog's open state; reports submissions/removals up via
 * `onSave`/`onRemove`. Never renders the raw key once a saved status is shown (AC1/AC8).
 */
export const ApiKeyForm = ({
  status,
  isLoadingStatus = false,
  isSubmitting = false,
  onSave,
  onRemove,
  guidanceUrl,
  errorMessage,
  labels,
}: ApiKeyFormProps) => {
  const {
    apiKey,
    setApiKey,
    setIsReplacing,
    isConfirmingRemove,
    setIsConfirmingRemove,
    showInput,
    isSaveDisabled,
  } = useApiKeyForm({
    status,
    isLoadingStatus,
    isSubmitting,
    errorMessage,
    loadingStatusLabel: labels.loadingStatus,
    savingLabel: labels.saving,
  });

  if (isLoadingStatus) {
    return (
      <View testID={LOADING_STATUS_TEST_ID}>
        <ProgressIndicator variant="circular" />
        <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
          {labels.loadingStatus}
        </Text>
      </View>
    );
  }

  // spec.md:76 — the same progress label surfaces for either in-flight mutation (save or
  // remove), whichever branch (input or masked) is currently showing. accessibilityLiveRegion
  // covers Android/Web (WCAG 4.1.3) — the isSubmitting effect in the hook covers iOS VoiceOver.
  const progressLabel = isSubmitting ? (
    <Text accessibilityLiveRegion="polite">{labels.saving}</Text>
  ) : null;

  return (
    <View style={styles.form}>
      {errorMessage ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorBannerText} accessibilityLiveRegion="assertive">
            {errorMessage}
          </Text>
        </View>
      ) : null}
      {showInput ? (
        <>
          {/* Empty state only (@s5) — guidance is not shown while replacing an existing key.
              Full-review Round 1, Minor 13 (WCAG 1.3.2) — rendered before the input it explains,
              so a first-time user discovers where to get a key before reaching the (disabled)
              Save control. */}
          {!status.hasKey ? (
            <Button
              variant="text"
              onPress={() => {
                // A rejection here (no app can open the URL, offline, etc.) must never surface
                // as an unhandled promise rejection (mirrors SignOut's own signOut guard).
                void Linking.openURL(guidanceUrl).catch(() => {});
              }}
            >
              {labels.guidance}
            </Button>
          ) : null}
          <TextField
            label={labels.inputLabel}
            accessibilityLabel={labels.inputLabel}
            value={apiKey}
            onChangeText={setApiKey}
            disabled={isSubmitting}
            accessibilityState={{ disabled: isSubmitting }}
            secureTextEntry
            autoCapitalize="none"
          />
          <View style={styles.actionsRow}>
            <Button disabled={isSaveDisabled} onPress={() => onSave(apiKey)}>
              {labels.save}
            </Button>
            {progressLabel}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.status}>{labels.keySavedStatus}</Text>
          <View style={styles.actionsRow}>
            <Button disabled={isSubmitting} variant="outlined" onPress={() => setIsReplacing(true)}>
              {labels.replace}
            </Button>
            <Button disabled={isSubmitting} variant="text" onPress={() => setIsConfirmingRemove(true)}>
              {labels.remove}
            </Button>
            {progressLabel}
          </View>
        </>
      )}
      <Dialog
        open={isConfirmingRemove}
        onClose={() => setIsConfirmingRemove(false)}
        headline={labels.removeConfirmHeadline}
        confirmLabel={labels.removeConfirmAction}
        cancelLabel={labels.removeConfirmCancelAction}
        onConfirm={() => {
          setIsConfirmingRemove(false);
          onRemove?.();
        }}
      >
        {labels.removeConfirmBody}
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  form: {
    gap: theme.spacing.s4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  status: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
  errorBanner: {
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.shape.card,
    padding: theme.spacing.s3,
  },
  errorBannerText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onErrorContainer,
  },
  /** Off-screen but still mounted, so screen readers pick up the live-region announcement
   * (mirrors LoginForm's own visuallyHidden style). */
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
}));
