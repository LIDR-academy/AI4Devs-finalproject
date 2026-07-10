import { useState } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';
import { TextField } from '../../molecules/text-field/text-field';

export type LoginFormLabels = {
  email: string;
  password: string;
  submit: string;
  signUpPrompt: string;
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
/** testID for the Loading-state affordance (@s3) — a11y label lands with the Slice 3 a11y pass. */
export const LOADING_INDICATOR_TEST_ID = 'login-form-loading-indicator';

/**
 * LoginForm — presentational organism (Content + Loading states). Pure/controlled:
 * owns only the local field values, reports submissions up via `onSubmit`. All copy
 * comes in through `labels` so the component stays locale-agnostic.
 */
export const LoginForm = ({ onSubmit, isSubmitting = false, onNavigateToSignUp, labels }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.form}>
      <TextField
        label={labels.email}
        accessibilityLabel={labels.email}
        value={email}
        onChangeText={setEmail}
        editable={!isSubmitting}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextField
        label={labels.password}
        accessibilityLabel={labels.password}
        value={password}
        onChangeText={setPassword}
        editable={!isSubmitting}
        secureTextEntry
      />
      <View style={styles.submitRow}>
        <Button disabled={isSubmitting} onPress={() => onSubmit({ email, password })}>
          {labels.submit}
        </Button>
        {isSubmitting ? (
          <View testID={LOADING_INDICATOR_TEST_ID}>
            <ProgressIndicator variant="circular" size={SUBMIT_SPINNER_SIZE} thickness={SUBMIT_SPINNER_THICKNESS} />
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
}));
