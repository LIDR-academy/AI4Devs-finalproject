import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { ApiKeyRequiredNotice } from './api-key-required-notice';

const meta = {
  title: 'Organisms/ApiKeyRequiredNotice',
  component: ApiKeyRequiredNotice,
  args: {
    onNavigateToAccount: () => {},
  },
} satisfies Meta<typeof ApiKeyRequiredNotice>;

export default meta;

type Story = StoryObj<typeof meta>;

// Default (AC10/@s10/@s14) — the generation-entry guard-rail notice: inline message + an
// action (button role by construction) linking to the account screen.
export const Default: Story = {};
