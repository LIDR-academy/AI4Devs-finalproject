import { useEffect, useState } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';
import { TextField } from '../../molecules/text-field/text-field';

export type LoginFormLabels = {
  email: string;
  password: string;
  submit: string;
  signUpPrompt: string;
  /** Announced to assistive tech while isSubmitting (@s3, WCAG 4.1.3) — not shown visually. */
  signingIn: string;
};

export type LoginFormProps = {
  onSubmit: (credentials: { email: string; password: string }) => void;
  /** True while AuthService.signIn is in flight — drives the Loading state (@s3). */
  isSubmitting?: boolean;
  onNavigateToSignUp?: () => void;
  labels: LoginFormLabels;
};

const SUBMIT_SPINNER_SIZE = 18;
const SUBMIT_SPINNER_THICKNESS = 2;
/** testID for the Loading-state affordance (@s3) — the a11y announcement lives on the live-region Text node and the AccessibilityInfo call below. */
export const LOADING_INDICATOR_TEST_ID = 'login-form-loading-indicator';

/**
 * LoginForm — presentational organism (Content + Loading states). Pure/controlled:
 * owns only the local field values, reports submissions up via `onSubmit`. All copy
 * comes in through `labels` so the component stays locale-agnostic.
 */
export const LoginForm = ({ onSubmit, isSubmitting = false, onNavigateToSignUp, labels }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // accessibilityLiveRegion (below) is Android/Web-only (@platform android) — iOS VoiceOver
  // needs this imperative call fired directly on the isSubmitting transition (WCAG 4.1.3).
  useEffect(() => {
    if (isSubmitting) {
      AccessibilityInfo.announceForAccessibility(labels.signingIn);
    }
  }, [isSubmitting, labels.signingIn]);

  return (
    <View style={styles.form}>
      <TextField
        label={labels.email}
        accessibilityLabel={labels.email}
        value={email}
        onChangeText={setEmail}
        disabled={isSubmitting}
        accessibilityState={{ disabled: isSubmitting }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextField
        label={labels.password}
        accessibilityLabel={labels.password}
        value={password}
        onChangeText={setPassword}
        disabled={isSubmitting}
        accessibilityState={{ disabled: isSubmitting }}
        secureTextEntry
      />
      <View style={styles.submitRow}>
        <Button disabled={isSubmitting} onPress={() => onSubmit({ email, password })}>
          {labels.submit}
        </Button>
        {isSubmitting ? (
          <View testID={LOADING_INDICATOR_TEST_ID}>
            <ProgressIndicator variant="circular" size={SUBMIT_SPINNER_SIZE} thickness={SUBMIT_SPINNER_THICKNESS} />
            <Text accessibilityLiveRegion="polite" style={styles.visuallyHidden}>
              {labels.signingIn}
            </Text>
          </View>
        ) : null}
      </View>
      {onNavigateToSignUp ? (
        <Button variant="text" onPress={onNavigateToSignUp}>
          {labels.signUpPrompt}
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
  /** Off-screen but still mounted, so screen readers pick up the live-region announcement. */
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
  },
}));
