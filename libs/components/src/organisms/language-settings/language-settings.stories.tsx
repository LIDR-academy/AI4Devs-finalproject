import type { Meta, StoryObj } from '@storybook/react-native-web-vite';

import { LanguageSettings } from './language-settings';

const meta = {
  title: 'Organisms/LanguageSettings',
  component: LanguageSettings,
} satisfies Meta<typeof LanguageSettings>;

export default meta;

type Story = StoryObj<typeof meta>;

// Real useLocalization()/LocalizationProvider (.storybook/preview.tsx) — switching languages is
// live: pressing an option calls the real setLocale and re-renders with the new active locale.
export const Default: Story = {};
