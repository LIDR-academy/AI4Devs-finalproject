import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { LoginForm } from './login-form';

const meta = {
  title: 'Organisms/LoginForm',
  component: LoginForm,
  args: {
    onSubmit: () => {},
    onNavigateToSignUp: () => {},
  },
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// Empty (spec.md UI-states table) — pristine form: submit disabled, no error shown.
export const Empty: Story = {};

// Content — both fields hold input, submit enabled.
export const Content: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(canvas.getByLabelText('Password'), 'secret1');
  },
};

export const Loading: Story = {
  args: {
    isSubmitting: true,
  },
};

// Error (auth failure, @s5/@s6) — banner rendered above the fields; form stays editable.
export const Error: Story = {
  args: {
    errorMessage: 'Invalid email or password',
  },
};

// Error (inline validation, @s9) — field-level messages; submit blocked.
export const ErrorInlineValidation: Story = {
  args: {
    emailError: 'Enter a valid email address',
    passwordError: 'Password is required',
  },
};
