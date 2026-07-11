import { useEffect, useRef, useState } from 'react';
import type { ApiKeyStatus } from '@helsoft/types';
import { AccessibilityInfo, Linking, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';
import { TextField } from '../../molecules/text-field/text-field';
import { Dialog } from '../dialog/dialog';

export type ApiKeyFormLabels = {
  inputLabel: string;
  save: string;
  /** Progress label shown (and announced) while a save is in flight (@s2). */
  saving: string;
  /** Announced to assistive tech while the initial status fetch is in flight (WCAG 4.1.3) —
   * not shown visually (mirrors LoginForm's `signingIn`). */
  loadingStatus: string;
  replace: string;
  remove: string;
  /** Fully-formatted masked status text (provider + last-updated) — the wiring layer builds
   * this via `t()` so ApiKeyForm stays free of i18n/date-formatting concerns. */
  keySavedStatus: string;
  /** Empty-state "where to get a key" guidance link text (@s5). */
  guidance: string;
  /** Remove-confirmation Dialog copy (@s8, reuses the SignOut confirm pattern). */
  removeConfirmHeadline: string;
  removeConfirmBody: string;
  removeConfirmAction: string;
  removeConfirmCancelAction: string;
};

export type ApiKeyFormProps = {
  status: ApiKeyStatus;
  /** True while the initial status fetch is in flight (task-7 Loading state). */
  isLoadingStatus?: boolean;
  /** True while a save is in flight (@s2). */
  isSubmitting?: boolean;
  onSave: (rawKey: string) => void;
  onRemove?: () => void;
  /** Where the Empty state's guidance link sends the user (@s5). Injected by the wiring layer
   * (mirrors ApiKeyGate's `onNavigateToAccount`, LoginForm's `onNavigateToSignUp`) rather than
   * hardcoded here, so ApiKeyForm stays free of any provider-specific destination. */
  guidanceUrl: string;
  /**
   * Save/remove failure banner (invalid_key/network_error, @s6/@s7/@s9). Rendered alongside
   * whichever state is showing (input or masked saved) — the input stays editable and the
   * masked state stays visible; retry is just resubmitting/re-confirming.
   */
  errorMessage?: string;
  labels: ApiKeyFormLabels;
};

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
  const [apiKey, setApiKey] = useState('');
  const [isReplacing, setIsReplacing] = useState(false);
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);
  const wasSubmitting = useRef(isSubmitting);

  // @s4 — once a replace-save resolves successfully (isSubmitting flips back to false while
  // the status still reports a saved key), the form reverts to the masked state instead of
  // leaving the input open.
  useEffect(() => {
    if (wasSubmitting.current && !isSubmitting && status.hasKey) {
      setIsReplacing(false);
      setApiKey('');
    }
    wasSubmitting.current = isSubmitting;
  }, [isSubmitting, status.hasKey]);

  // @s6/@s9 — announces a save/remove failure to assistive tech (iOS VoiceOver parity;
  // Android/Web get the banner's own accessibilityLiveRegion below).
  useEffect(() => {
    if (errorMessage) {
      AccessibilityInfo.announceForAccessibility(errorMessage);
    }
  }, [errorMessage]);

  // Full-review Round 1, Major 4 (WCAG 4.1.3) — accessibilityLiveRegion (the companion Text
  // below) has no effect on iOS VoiceOver, so the status-loading transition also needs this
  // imperative, cross-platform announcement (mirrors LoginForm's isSubmitting effect).
  useEffect(() => {
    if (isLoadingStatus) {
      AccessibilityInfo.announceForAccessibility(labels.loadingStatus);
    }
  }, [isLoadingStatus, labels.loadingStatus]);

  // Same iOS-parity need for the isSubmitting progress label (WCAG 4.1.3) — its own
  // accessibilityLiveRegion below is Android/Web-only.
  useEffect(() => {
    if (isSubmitting) {
      AccessibilityInfo.announceForAccessibility(labels.saving);
    }
  }, [isSubmitting, labels.saving]);

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

  const showInput = !status.hasKey || isReplacing;
  // @s5 — a blank/whitespace-only key is never submittable (AC7).
  const isSaveDisabled = isSubmitting || !apiKey.trim();
  // spec.md:76 — the same progress label surfaces for either in-flight mutation (save or
  // remove), whichever branch (input or masked) is currently showing. accessibilityLiveRegion
  // covers Android/Web (WCAG 4.1.3) — the isSubmitting effect above covers iOS VoiceOver.
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
