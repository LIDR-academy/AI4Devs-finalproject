import type { Decorator, Meta, StoryObj } from '@storybook/react-native-web-vite';

import { configureAuthMock } from '../../../.storybook/mocks/hooks';
import { SignInForm } from './sign-in-form';

// Seeds the fake useAuth() (see .storybook/mocks/hooks.ts) just before the story mounts, so its
// useState lazy initializer picks up this story's state on first (and only) render.
const withAuthMock =
  (config: Parameters<typeof configureAuthMock>[0]): Decorator =>
  (StoryFn) => {
    configureAuthMock(config);
    return <StoryFn />;
  };

const meta = {
  title: 'Features/SignInForm',
  component: SignInForm,
} satisfies Meta<typeof SignInForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// Content (spec's Empty/Content states) — pristine form; typing and submitting is live,
// including the real AuthService.isValidEmail inline-validation path. The fake signIn resolves
// (no error) after a short delay, simulating a successful sign-in.
export const Default: Story = {
  decorators: [withAuthMock({ scenario: 'success' })],
};

// Loading — useAuth().isSubmitting drives LoginForm's Loading affordance.
export const Loading: Story = {
  decorators: [withAuthMock({ isSubmitting: true })],
};

// Error (auth failure, @s5) — invalid_credentials renders as the invalidCredentials banner.
export const InvalidCredentials: Story = {
  decorators: [withAuthMock({ error: 'invalid_credentials' })],
};

// Error (auth failure, @s6) — network_error renders as a distinct banner; form stays editable.
export const NetworkError: Story = {
  decorators: [withAuthMock({ error: 'network_error' })],
};
