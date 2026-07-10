import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { LOADING_INDICATOR_TEST_ID, LoginForm } from './login-form';

const labels = {
  email: 'Email',
  password: 'Password',
  submit: 'Log in',
  signUpPrompt: 'No account? Sign up',
};

describe('LoginForm', () => {
  // @s2 — renders both fields and the submit control, labelled from the injected copy.
  it('renders the email field, password field, and submit control', async () => {
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);

    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeTruthy();
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

  // @s3 — fields are also disabled while isSubmitting.
  it('disables both fields while isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} isSubmitting labels={labels} />);

    expect(screen.getByLabelText('Email').props.editable).toBe(false);
    expect(screen.getByLabelText('Password').props.editable).toBe(false);
  });

  // @s3 — the loading affordance and disabled state are exclusive to isSubmitting; the
  // Content state (isSubmitting omitted) shows neither.
  it('does not show the loading affordance or disable controls outside of isSubmitting', async () => {
    await render(<LoginForm onSubmit={jest.fn()} labels={labels} />);

    expect(screen.queryByTestId(LOADING_INDICATOR_TEST_ID)).toBeNull();
    expect(screen.getByRole('button', { name: 'Log in', disabled: false })).toBeTruthy();
    expect(screen.getByLabelText('Email').props.editable).not.toBe(false);
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
});
