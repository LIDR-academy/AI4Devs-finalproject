import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { LoginForm } from './login-form';

const labels = {
  email: 'Email',
  password: 'Password',
  submit: 'Log in',
  signUpPrompt: 'No account? Sign up',
};

const meta = {
  title: 'Organisms/LoginForm',
  component: LoginForm,
  args: {
    onSubmit: () => {},
    onNavigateToSignUp: () => {},
    labels,
  },
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Content: Story = {};

export const Loading: Story = {
  args: {
    isSubmitting: true,
  },
};
