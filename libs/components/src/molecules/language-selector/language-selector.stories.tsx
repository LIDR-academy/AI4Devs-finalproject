import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';

import { LanguageSelector } from './language-selector';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
];

const meta = {
  title: 'Molecules/LanguageSelector',
  component: LanguageSelector,
  args: {
    options: languages,
    value: 'en',
    accessibilityLabel: 'Choose a language',
    onChange: () => {},
  },
} satisfies Meta<typeof LanguageSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const English: Story = {
  args: { value: 'en' },
};

export const Spanish: Story = {
  args: { value: 'es' },
};

export const Portuguese: Story = {
  args: { value: 'pt' },
};

export const German: Story = {
  args: { value: 'de' },
};

const InteractiveDemo = () => {
  const [value, setValue] = useState('en');
  return <LanguageSelector options={languages} value={value} onChange={setValue} accessibilityLabel="Choose a language" />;
};

export const Interactive: Story = {
  render: () => <InteractiveDemo />,
};

export const Disabled: Story = {
  args: { value: 'es', disabled: true },
};
