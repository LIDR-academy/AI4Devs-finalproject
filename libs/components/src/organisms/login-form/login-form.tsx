import { useEffect, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useLocalization } from '@helsoft/localization';
import { Button } from '../../atoms/button/button';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';
import { TextField } from '../../molecules/text-field/text-field';

export type LoginFormProps = {
  onSubmit: (credentials: { email: string; password: string }) => void;
  /** True while AuthService.signIn is in flight — drives the Loading state (@s3). */
  isSubmitting?: boolean;
  onNavigateToSignUp?: () => void;
  /**
   * Auth-level failure banner (invalid_credentials / network_error, @s5/@s6). The form stays
   * editable and submit stays enabled once fields are non-empty — retry is just re-submitting.
   */
  errorMessage?: string;
  /** Inline validation message for the email field (@s9, e.g. malformed email). Blocks submit. */
  emailError?: string;
  /** Inline validation message for the password field (@s9, e.g. empty password). Blocks submit. */
  passwordError?: string;
  /**
   * Called with the email field's next value on every change. Lets the wiring layer
   * (SignInForm) re-validate/clear `emailError` reactively as the user edits — without this,
   * once `emailError` is set the submit control that would re-trigger validation is itself
   * disabled by that same error, permanently deadlocking the form (@s9 fix).
   */
  onEmailChange?: (email: string) => void;
};

const SUBMIT_SPINNER_SIZE = 18;
const SUBMIT_SPINNER_THICKNESS = 2;
/** testID for the Loading-state affordance (@s3) — the a11y announcement lives on the live-region Text node and the AccessibilityInfo call below. */
export const LOADING_INDICATOR_TEST_ID = 'login-form-loading-indicator';

/**
 * LoginForm — presentational organism (Content + Loading states). Pure/controlled:
 * owns only the local field values, reports submissions up via `onSubmit`.
 * Chrome copy comes from `useLocalization` (`auth.*` keys); error/field messages stay injected.
 */
export const LoginForm = ({
  onSubmit,
  isSubmitting = false,
  onNavigateToSignUp,
  errorMessage,
  emailError,
  passwordError,
  onEmailChange,
}: LoginFormProps) => {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Empty state (@s8): a pristine form (either field still blank) keeps submit disabled.
  const isPristine = !email.trim() || !password.trim();
  // Inline validation (@s9): a field-level error blocks submit even once fields are non-empty.
  const hasFieldError = !!emailError || !!passwordError;

  const handleEmailChange = (value: string) => {
    setEmail(value);
    onEmailChange?.(value);
  };

  // accessibilityLiveRegion (below) is Android/Web-only (@platform android) — iOS VoiceOver
  // needs this imperative call fired directly on the isSubmitting transition (WCAG 4.1.3).
  useEffect(() => {
    if (isSubmitting) {
      AccessibilityInfo.announceForAccessibility(t('auth.signingIn'));
    }
  }, [isSubmitting, t]);

  // Same iOS-parity need for the auth-error banner (@s12, WCAG 4.1.3): the banner's own
  // accessibilityLiveRegion covers Android/Web only.
  useEffect(() => {
    if (errorMessage) {
      AccessibilityInfo.announceForAccessibility(errorMessage);
    }
  }, [errorMessage]);

  return (
    <View style={styles.form}>
      {errorMessage ? (
        <View style={styles.errorBanner} accessibilityRole="alert">
          <Text style={styles.errorBannerText} accessibilityLiveRegion="assertive">
            {errorMessage}
          </Text>
        </View>
      ) : null}
      <TextField
        label={t('auth.email')}
        accessibilityLabel={t('auth.email')}
        value={email}
        onChangeText={handleEmailChange}
        disabled={isSubmitting}
        accessibilityState={{ disabled: isSubmitting }}
        autoCapitalize="none"
        keyboardType="email-address"
        error={!!emailError}
        supportingText={emailError}
        accessibilityHint={emailError}
      />
      <TextField
        label={t('auth.password')}
        accessibilityLabel={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        disabled={isSubmitting}
        accessibilityState={{ disabled: isSubmitting }}
        secureTextEntry
        error={!!passwordError}
        supportingText={passwordError}
        accessibilityHint={passwordError}
      />
      <View style={styles.submitRow}>
        <Button
          disabled={isSubmitting || isPristine || hasFieldError}
          onPress={() => onSubmit({ email, password })}
        >
          {t('auth.submit')}
        </Button>
        {isSubmitting ? (
          <View testID={LOADING_INDICATOR_TEST_ID}>
            <ProgressIndicator variant="circular" size={SUBMIT_SPINNER_SIZE} thickness={SUBMIT_SPINNER_THICKNESS} />
            <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
              {t('auth.signingIn')}
            </Text>
          </View>
        ) : null}
      </View>
      {onNavigateToSignUp ? (
        <Button variant="text" onPress={onNavigateToSignUp}>
          {t('auth.toSignUp')}
        </Button>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  form: {
    gap: theme.spacing.s4,
  },
  submitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
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
  /** Off-screen but still mounted, so screen readers pick up the live-region announcement. */
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
}));
