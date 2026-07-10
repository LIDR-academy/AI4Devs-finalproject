import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { disabledOpacity } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { LOADING_INDICATOR_TEST_ID, LoginForm } from './login-form';

const labels = {
  email: 'Email',
  password: 'Password',
  submit: 'Log in',
  signUpPrompt: 'No account? Sign up',
  signingIn: 'Signing in…',
};

describe('LoginForm', () => {
  // @s2 — renders both fields and the submit control, labelled from the injected copy.
  it('renders the email field, password field, and submit control', async () => {
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);

    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeTruthy();
  });

  // @s2 — the form is pristine on mount: no leftover/injected text in either field.
  it('starts with empty email and password field values', async () => {
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);

    expect(screen.getByLabelText('Email').props.value).toBe('');
    expect(screen.getByLabelText('Password').props.value).toBe('');
  });

  // @s3 — pins the literal testID so the constant can't silently become an empty string
  // while every query in this file (which imports the same constant) still resolves.
  it('exposes the documented literal testID for the loading indicator', () => {
    expect(LOADING_INDICATOR_TEST_ID).toBe('login-form-loading-indicator');
  });

  // @s2 — typing credentials then submitting reports the exact entered values up.
  it('calls onSubmit with the entered email and password', async () => {
    const onSubmit = jest.fn();
    await render(<LoginForm onSubmit={onSubmit} labels={labels} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('Email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('Password'), 'secret1');
    });
    fireEvent.press(screen.getByRole('button', { name: 'Log in' }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret1' });
  });

  // @s3 — while isSubmitting, the submit control is disabled and shows a loading affordance.
  it('disables the submit control and shows a loading affordance while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting labels={labels} />);

    expect(screen.getByRole('button', { name: 'Log in', disabled: true })).toBeTruthy();
    expect(screen.getByTestId(LOADING_INDICATOR_TEST_ID)).toBeTruthy();
  });

  // @s3 — fields are also disabled while isSubmitting, via TextField's own `disabled` prop
  // (not the raw `editable` attribute) so the Loading state also dims the field per spec.md's
  // UI-states table ("Loading … fields disabled").
  it('disables and dims both fields while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting labels={labels} />);

    const emailField = screen.getByLabelText('Email');
    const passwordField = screen.getByLabelText('Password');

    expect(emailField.props.editable).toBe(false);
    expect(passwordField.props.editable).toBe(false);
    expect(emailField.parent).toHaveStyle({ opacity: disabledOpacity });
    expect(passwordField.parent).toHaveStyle({ opacity: disabledOpacity });
  });

  // @s3 — screen readers get a programmatic disabled signal on both fields while isSubmitting
  // (WCAG 4.1.2): RN's TextInput does not derive accessibilityState from `editable`.
  it('exposes accessibilityState.disabled on both fields while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting labels={labels} />);

    expect(screen.getByLabelText('Email').props.accessibilityState).toEqual({ disabled: true });
    expect(screen.getByLabelText('Password').props.accessibilityState).toEqual({ disabled: true });
  });

  // @s3 — a visually-hidden, polite live-region announces authentication is in progress to
  // assistive tech (WCAG 4.1.3) — the bare spinner alone is not exposed to screen readers.
  it('announces a polite live-region while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting labels={labels} />);

    expect(screen.getByText(labels.signingIn).props.accessibilityLiveRegion).toBe('polite');
  });

  // @s3 — RN's accessibilityLiveRegion is Android/Web-only (@platform android), so iOS
  // VoiceOver needs the imperative, cross-platform AccessibilityInfo API fired directly when
  // isSubmitting transitions to true (WCAG 4.1.3).
  it('announces "Signing in…" via AccessibilityInfo when isSubmitting becomes true', async () => {
    // react-native's jest preset already auto-mocks this module-level function, so its call
    // history persists across tests in this file — clear it before asserting on it here.
    const announceSpy = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(<LoginForm onSubmit={jest.fn()} isSubmitting labels={labels} />);
    });

    expect(announceSpy).toHaveBeenCalledWith(labels.signingIn);

    announceSpy.mockRestore();
  });

  // @s3 — the loading affordance and disabled state are exclusive to isSubmitting; the
  // Content state (isSubmitting omitted) shows neither.
  it('does not show the loading affordance or disable controls outside of isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);

    expect(screen.queryByTestId(LOADING_INDICATOR_TEST_ID)).toBeNull();
    expect(screen.getByRole('button', { name: 'Log in', disabled: false })).toBeTruthy();
    expect(screen.getByLabelText('Email').props.editable).not.toBe(false);
    expect(screen.queryByText(labels.signingIn)).toBeNull();
  });

  // Content state (UI states table, spec.md) — a "Sign up" link is visible and wired.
  it('renders the sign-up prompt and calls onNavigateToSignUp when pressed', async () => {
    const onNavigateToSignUp = jest.fn();
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} onNavigateToSignUp={onNavigateToSignUp} />);

    fireEvent.press(screen.getByRole('button', { name: 'No account? Sign up' }));

    expect(onNavigateToSignUp).toHaveBeenCalledTimes(1);
  });

  it('does not render the sign-up prompt when onNavigateToSignUp is not provided', async () => {
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);

    expect(screen.queryByText('No account? Sign up')).toBeNull();
  });

  // Layout — the submit row lays the button and loading affordance out side-by-side,
  // vertically centered, with the standard inline gap (spec.md UI-states table).
  it('lays out the submit row as a horizontally centered row with the standard gap', async () => {
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);

    const submitRow = screen.getByRole('button', { name: 'Log in' }).parent;

    expect(submitRow).toHaveStyle({ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 });
  });

  // Layout — the form stacks its fields/submit row with the standard vertical gap.
  it('stacks the form contents with the standard vertical gap', async () => {
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);

    const form = screen.getByRole('button', { name: 'Log in' }).parent?.parent;

    expect(form).toHaveStyle({ gap: spacing.s4 });
  });

  // Layout/a11y — the live-region text stays mounted (so assistive tech can read it) but is
  // clipped out of the visual layout via absolute positioning + a 1x1 hidden box.
  it('keeps the live-region text visually hidden but mounted (absolute, 1x1, clipped)', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting labels={labels} />);

    expect(screen.getByText(labels.signingIn)).toHaveStyle({
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
    });
  });
});
