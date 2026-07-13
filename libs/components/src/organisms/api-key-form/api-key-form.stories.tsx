import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { ApiKeyForm } from './api-key-form';

const labels = {
  inputLabel: 'API key',
  save: 'Save',
  saving: 'Saving…',
  loadingStatus: 'Checking your API key status…',
  replace: 'Replace',
  remove: 'Remove',
  keySavedStatus: 'OpenAI key saved · Updated Jan 1, 2026',
  guidance: "Don't have a key? Get one from OpenAI",
  removeConfirmHeadline: 'Remove API key?',
  removeConfirmBody: "You'll need to add a new key to generate lessons again.",
  removeConfirmAction: 'Remove',
  removeConfirmCancelAction: 'Cancel',
};

const noKeyStatus = { hasKey: false as const };
const savedStatus = { hasKey: true as const, provider: 'openai' as const, updatedAt: '2026-01-01T00:00:00.000Z' };

const meta = {
  title: 'Organisms/ApiKeyForm',
  component: ApiKeyForm,
  args: {
    status: noKeyStatus,
    onSave: () => {},
    onRemove: () => {},
    guidanceUrl: 'https://platform.openai.com/api-keys',
    labels,
  },
} satisfies Meta<typeof ApiKeyForm>;

export default meta;

type Story = StoryObj<typeof meta>;

// Empty (spec.md UI-states table) — no key saved: labelled input + guidance link, Save
// disabled until a non-blank key is entered (@s5).
export const Empty: Story = {};

// Content — masked "key saved" state (@s1/@s3), Replace/Remove, no raw key rendered.
export const Content: Story = {
  args: {
    status: savedStatus,
  },
};

// Loading — the initial status fetch is in flight; a placeholder replaces the control.
export const Loading: Story = {
  args: {
    isLoadingStatus: true,
  },
};

// Error (@s7/@s9) — a save/remove failure banner; the input stays editable and retry is
// just resubmitting.
export const Error: Story = {
  args: {
    errorMessage: "Couldn't reach the server. Try again.",
  },
};
