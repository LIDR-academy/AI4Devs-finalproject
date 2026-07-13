jest.mock('@helsoft/localization', () => ({
  useLocalization: jest.fn(),
}));

import { disabledOpacity, lightColors, spacing } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';

import { localizationValue } from '../../test-utils/auth-test-factories';
import { LOADING_INDICATOR_TEST_ID, LoginForm } from './login-form';

const mockUseLocalization = useLocalization as jest.Mock;

describe('LoginForm', () => {
  beforeEach(() => {
    mockUseLocalization.mockReturnValue(localizationValue());
  });

  // @s2 — renders both fields and the submit control, labelled from localization keys.
  it('renders the email field, password field, and submit control', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('auth.email')).toBeTruthy();
    expect(screen.getByLabelText('auth.password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'auth.submit' })).toBeTruthy();
  });

  // @s2 — the form is pristine on mount: no leftover/injected text in either field.
  it('starts with empty email and password field values', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('auth.email').props.value).toBe('');
    expect(screen.getByLabelText('auth.password').props.value).toBe('');
  });

  // @s3 — pins the literal testID so the constant can't silently become an empty string
  // while every query in this file (which imports the same constant) still resolves.
  it('exposes the documented literal testID for the loading indicator', () => {
    expect(LOADING_INDICATOR_TEST_ID).toBe('login-form-loading-indicator');
  });

  // @s2 — typing credentials then submitting reports the exact entered values up.
  it('calls onSubmit with the entered email and password', async () => {
    const onSubmit = jest.fn();
    await render(<LoginForm onSubmit={onSubmit} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });
    fireEvent.press(screen.getByRole('button', { name: 'auth.submit' }));

    expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret1' });
  });

  // @s3 — while isSubmitting, the submit control is disabled and shows a loading affordance.
  it('disables the submit control and shows a loading affordance while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting />);

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
    expect(screen.getByTestId(LOADING_INDICATOR_TEST_ID)).toBeTruthy();
  });

  // @s3 — fields are also disabled while isSubmitting, via TextField's own `disabled` prop
  // (not the raw `editable` attribute) so the Loading state also dims the field per spec.md's
  // UI-states table ("Loading … fields disabled").
  it('disables and dims both fields while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting />);

    const emailField = screen.getByLabelText('auth.email');
    const passwordField = screen.getByLabelText('auth.password');

    expect(emailField.props.editable).toBe(false);
    expect(passwordField.props.editable).toBe(false);
    expect(emailField.parent).toHaveStyle({ opacity: disabledOpacity });
    expect(passwordField.parent).toHaveStyle({ opacity: disabledOpacity });
  });

  // @s3 — screen readers get a programmatic disabled signal on both fields while isSubmitting
  // (WCAG 4.1.2): RN's TextInput does not derive accessibilityState from `editable`.
  it('exposes accessibilityState.disabled on both fields while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting />);

    expect(screen.getByLabelText('auth.email').props.accessibilityState).toEqual({
      disabled: true,
    });
    expect(screen.getByLabelText('auth.password').props.accessibilityState).toEqual({
      disabled: true,
    });
  });

  // @s3 — a visually-hidden, polite live-region announces authentication is in progress to
  // assistive tech (WCAG 4.1.3) — the bare spinner alone is not exposed to screen readers.
  it('announces a polite live-region while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting />);

    expect(screen.getByText('auth.signingIn').props.accessibilityLiveRegion).toBe('polite');
  });

  // @s3 — RN's accessibilityLiveRegion is Android/Web-only (@platform android), so iOS
  // VoiceOver needs the imperative, cross-platform AccessibilityInfo API fired directly when
  // isSubmitting transitions to true (WCAG 4.1.3).
  it('announces "Signing in…" via AccessibilityInfo when isSubmitting becomes true', async () => {
    // react-native's jest preset already auto-mocks this module-level function, so its call
    // history persists across tests in this file — clear it before asserting on it here.
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(<LoginForm onSubmit={jest.fn()} />);
    expect(announceSpy).not.toHaveBeenCalled();

    await act(async () => {
      rerender(<LoginForm onSubmit={jest.fn()} isSubmitting />);
    });

    // Full-review Round 1, Minor 8 — a documented ~1-in-20 flake asserting immediately after
    // act(); waitFor tolerates the announcement landing a tick later instead of racing it.
    await waitFor(() => expect(announceSpy).toHaveBeenCalledWith('auth.signingIn'));

    announceSpy.mockRestore();
  });

  // @s12 — same iOS-parity gap as the Loading announcement: accessibilityLiveRegion has no
  // effect on iOS VoiceOver, so an auth-error banner also needs the imperative announcement.
  it('announces the error banner via AccessibilityInfo when errorMessage is set', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    await render(<LoginForm onSubmit={jest.fn()} errorMessage="Invalid email or password" />);

    expect(announceSpy).toHaveBeenCalledWith('Invalid email or password');

    announceSpy.mockRestore();
  });

  // Mutation-kill (Full-review Round 1, Major 5.2) — pins the errorMessage effect's dependency
  // array: a `[errorMessage]` → `[]` mutant only fires the announcement once, on mount, so a
  // second distinct error replacing the first (e.g. a retry that fails differently) would never
  // be re-announced.
  it('announces the error banner again when errorMessage changes to a different value', async () => {
    const announceSpy = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibility')
      .mockImplementation(() => {});
    announceSpy.mockClear();

    const { rerender } = await render(
      <LoginForm onSubmit={jest.fn()} errorMessage="Invalid email or password" />,
    );
    expect(announceSpy).toHaveBeenCalledWith('Invalid email or password');
    announceSpy.mockClear();

    await act(async () => {
      rerender(<LoginForm onSubmit={jest.fn()} errorMessage="upload.networkError" />);
    });

    expect(announceSpy).toHaveBeenCalledWith('upload.networkError');

    announceSpy.mockRestore();
  });

  // @s3 — the loading affordance and disabled state are exclusive to isSubmitting; the
  // Content state (isSubmitting omitted, both fields non-empty per @s8) shows neither.
  it('does not show the loading affordance or disable controls outside of isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });

    expect(screen.queryByTestId(LOADING_INDICATOR_TEST_ID)).toBeNull();
    expect(screen.getByRole('button', { name: 'auth.submit', disabled: false })).toBeTruthy();
    expect(screen.getByLabelText('auth.email').props.editable).not.toBe(false);
    expect(screen.queryByText('auth.signingIn')).toBeNull();
  });

  // @s5/@s6 — an auth-level failure (invalid_credentials / network_error) renders as an error
  // banner; the form stays editable so the user can retry (re-submit) — nothing here disables
  // the fields or the submit control.
  it('renders an error banner and keeps the form editable when errorMessage is given', async () => {
    await render(<LoginForm onSubmit={jest.fn()} errorMessage="Invalid email or password" />);

    expect(screen.getByText('Invalid email or password')).toBeTruthy();
    expect(screen.getByLabelText('auth.email').props.editable).not.toBe(false);
    expect(screen.getByLabelText('auth.password').props.editable).not.toBe(false);
  });

  // @s6 — a network_error banner is just a different injected string — same rendering path.
  it('renders a different error banner string for a network error', async () => {
    await render(<LoginForm onSubmit={jest.fn()} errorMessage="upload.networkError" />);

    expect(screen.getByText('upload.networkError')).toBeTruthy();
    expect(screen.queryByText('Invalid email or password')).toBeNull();
  });

  // @s12 — the auth-error banner exposes an `alert` role and an assertive live region so
  // assistive tech announces it as soon as it appears, without waiting for focus.
  it('exposes an alert role and an assertive live region on the error banner', async () => {
    await render(<LoginForm onSubmit={jest.fn()} errorMessage="Invalid email or password" />);

    const banner = screen.getByText('Invalid email or password');
    expect(banner.props.accessibilityLiveRegion).toBe('assertive');
    expect(banner.parent?.props.accessibilityRole).toBe('alert');
  });

  it('does not render an error banner when errorMessage is omitted', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.queryByText('Invalid email or password')).toBeNull();
    expect(screen.queryByText('upload.networkError')).toBeNull();
  });

  // @s5/@s6 — retry: an auth-level errorMessage does not block re-submission (unlike inline
  // validation errors), since the user should be able to fix credentials and try again.
  it('keeps submit enabled (once fields are non-empty) alongside an errorMessage banner', async () => {
    await render(<LoginForm onSubmit={jest.fn()} errorMessage="Invalid email or password" />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: false })).toBeTruthy();
  });

  // @s9 — an inline emailError renders as the email field's supporting text and marks it in
  // error, and blocks submission even though both fields are non-empty.
  it('renders emailError as inline supporting text on the email field and blocks submit', async () => {
    await render(<LoginForm onSubmit={jest.fn()} emailError="Enter a valid email address" />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'not-an-email');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });

    expect(screen.getByText('Enter a valid email address')).toBeTruthy();
    expect(screen.getByLabelText('auth.email').props.value).toBe('not-an-email');
    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });

  // @s12 — the inline emailError is also exposed as an accessibilityHint on the field itself
  // (not just a visually-adjacent supporting-text node), so it is programmatically associated
  // with the field for assistive tech rather than relying on reading order alone.
  it('exposes emailError as an accessibilityHint on the email field', async () => {
    await render(<LoginForm onSubmit={jest.fn()} emailError="Enter a valid email address" />);

    expect(screen.getByLabelText('auth.email').props.accessibilityHint).toBe(
      'Enter a valid email address',
    );
  });

  // Full-review Round 1, Major 3 — accessibilityHint has no effect on react-native-web (its
  // createDOMProps allow-list forwards accessibilityInvalid, not accessibilityHint), so web
  // screen-reader users get no signal at all from the hint alone. accessibilityInvalid closes
  // that gap for web while native platforms keep reading the hint.
  it('exposes accessibilityInvalid true on the email field when emailError is set', async () => {
    await render(<LoginForm onSubmit={jest.fn()} emailError="Enter a valid email address" />);

    expect(screen.getByLabelText('auth.email').props.accessibilityInvalid).toBe(true);
  });

  it('exposes accessibilityInvalid false on the email field when emailError is absent', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('auth.email').props.accessibilityInvalid).toBe(false);
  });

  // Mutation-kill (Full-review Round 1, Major 5.3) — pins the actual error-styling state (the
  // email label's color, driven by TextField's `error` prop), not just the presence of the
  // supporting-text string, so a `!!emailError` → `!emailError` boolean-inversion mutant is
  // caught (TextField consumes `error` for styling only — it is never forwarded onto the
  // underlying TextInput's own props).
  it('colors the email label as an error when emailError is set', async () => {
    await render(<LoginForm onSubmit={jest.fn()} emailError="Enter a valid email address" />);

    expect(screen.getByText('auth.email')).toHaveStyle({ color: lightColors.error });
  });

  it('colors the email label as neutral when emailError is absent', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByText('auth.email')).toHaveStyle({ color: lightColors.onSurfaceVariant });
  });

  // @s9 — same, for the password field (empty password case).
  it('renders passwordError as inline supporting text on the password field and blocks submit', async () => {
    await render(<LoginForm onSubmit={jest.fn()} passwordError="Password is required" />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });

    expect(screen.getByText('Password is required')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });

  // @s12 — same programmatic association as the email field, for the password field.
  it('exposes passwordError as an accessibilityHint on the password field', async () => {
    await render(<LoginForm onSubmit={jest.fn()} passwordError="Password is required" />);

    expect(screen.getByLabelText('auth.password').props.accessibilityHint).toBe(
      'Password is required',
    );
  });

  // Full-review Round 1, Major 3 — same web accessibilityHint gap as the email field.
  it('exposes accessibilityInvalid true on the password field when passwordError is set', async () => {
    await render(<LoginForm onSubmit={jest.fn()} passwordError="Password is required" />);

    expect(screen.getByLabelText('auth.password').props.accessibilityInvalid).toBe(true);
  });

  it('exposes accessibilityInvalid false on the password field when passwordError is absent', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByLabelText('auth.password').props.accessibilityInvalid).toBe(false);
  });

  // Mutation-kill (Full-review Round 1, Major 5.3) — password-field equivalent.
  it('colors the password label as an error when passwordError is set', async () => {
    await render(<LoginForm onSubmit={jest.fn()} passwordError="Password is required" />);

    expect(screen.getByText('auth.password')).toHaveStyle({ color: lightColors.error });
  });

  it('colors the password label as neutral when passwordError is absent', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByText('auth.password')).toHaveStyle({ color: lightColors.onSurfaceVariant });
  });

  // @s9 fix — LoginForm forwards every email keystroke via onEmailChange so the wiring layer
  // (SignInForm) can re-validate/clear emailError reactively; otherwise, once emailError is set,
  // the only way to clear it is via the submit button it itself keeps disabled (permanent deadlock).
  it('calls onEmailChange with the new value as the email field changes', async () => {
    const onEmailChange = jest.fn();
    await render(<LoginForm onSubmit={jest.fn()} onEmailChange={onEmailChange} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });

    expect(onEmailChange).toHaveBeenCalledWith('user@example.com');
  });

  it('does not render inline field errors when emailError/passwordError are omitted', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.queryByText('Enter a valid email address')).toBeNull();
    expect(screen.queryByText('Password is required')).toBeNull();
  });

  // @s8 — a pristine form (no input yet) disables the submit control and shows no error.
  it('disables the submit control and shows no error on a pristine (empty) form', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
    expect(screen.queryByText('auth.signingIn')).toBeNull();
  });

  // @s8 — the submit control re-enables once both fields hold some input (Content state,
  // spec.md UI-states table: "non-empty email + non-empty password").
  it('enables the submit control once both fields hold non-empty input', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: false })).toBeTruthy();
  });

  // Mutation-kill (Full-review Round 1, Major 5.1) — pins isPristine's `||`: only both-empty and
  // both-filled were previously exercised, so a `||` → `&&` mutant (isPristine only true when
  // BOTH are empty) survived. One field filled, the other still blank, must still disable submit.
  it('keeps submit disabled when only the email field holds input (password still blank)', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });

  it('keeps submit disabled when only the password field holds input (email still blank)', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });

  // Mutation-kill (Full-review Round 1, Major 5.1) — pins isPristine's `.trim()` calls: a
  // whitespace-only value must still count as blank/pristine, not merely an empty string.
  it('keeps submit disabled when the email field holds only whitespace', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), '   ');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), 'secret1');
    });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });

  it('keeps submit disabled when the password field holds only whitespace', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.email'), 'user@example.com');
    });
    await act(async () => {
      fireEvent.changeText(screen.getByLabelText('auth.password'), '   ');
    });

    expect(screen.getByRole('button', { name: 'auth.submit', disabled: true })).toBeTruthy();
  });

  // Content state (UI states table, spec.md) — a "Sign up" link is visible and wired.
  it('renders the sign-up prompt and calls onNavigateToSignUp when pressed', async () => {
    const onNavigateToSignUp = jest.fn();
    await render(<LoginForm onSubmit={jest.fn()} onNavigateToSignUp={onNavigateToSignUp} />);

    fireEvent.press(screen.getByRole('button', { name: 'auth.toSignUp' }));

    expect(onNavigateToSignUp).toHaveBeenCalledTimes(1);
  });

  it('does not render the sign-up prompt when onNavigateToSignUp is not provided', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    expect(screen.queryByText('auth.toSignUp')).toBeNull();
  });

  // @s12 — a sensible reading/focus order (email → password → submit → sign-up prompt):
  // no explicit override exists, so this pins the render order the tree already produces,
  // guarding against a future reorder silently scrambling assistive-tech traversal.
  it('renders email, then password, then submit, then the sign-up prompt in that order', async () => {
    await render(<LoginForm onSubmit={jest.fn()} onNavigateToSignUp={jest.fn()} />);

    const tree = JSON.stringify(screen.toJSON());
    const order = ['auth.email', 'auth.password', 'auth.submit', 'auth.toSignUp'].map((text) =>
      tree.indexOf(`"${text}"`),
    );

    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  // Layout — the submit row lays the button and loading affordance out side-by-side,
  // vertically centered, with the standard inline gap (spec.md UI-states table).
  it('lays out the submit row as a horizontally centered row with the standard gap', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    const submitRow = screen.getByRole('button', { name: 'auth.submit' }).parent;

    expect(submitRow).toHaveStyle({ flexDirection: 'row', alignItems: 'center', gap: spacing.s3 });
  });

  // Layout — the form stacks its fields/submit row with the standard vertical gap.
  it('stacks the form contents with the standard vertical gap', async () => {
    await render(<LoginForm onSubmit={jest.fn()} />);

    const form = screen.getByRole('button', { name: 'auth.submit' }).parent?.parent;

    expect(form).toHaveStyle({ gap: spacing.s4 });
  });

  // Layout/a11y — the live-region text stays mounted (so assistive tech can read it) but is
  // clipped out of the visual layout via absolute positioning + a 1x1 hidden box.
  it('keeps the live-region text visually hidden but mounted (absolute, 1x1, clipped)', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting />);

    expect(screen.getByText('auth.signingIn')).toHaveStyle({
      position: 'absolute',
      width: 1,
      height: 1,
      overflow: 'hidden',
    });
  });
});
