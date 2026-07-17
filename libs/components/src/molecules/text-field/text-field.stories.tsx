import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { expect } from 'storybook/test';

import { TextField } from './text-field';

const meta = {
  title: 'Molecules/TextField',
  component: TextField,
  args: {
    label: 'Lesson title',
    placeholder: 'e.g. Photosynthesis basics',
  },
} satisfies Meta<typeof TextField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Filled: Story = {
  args: { autoFocus: true, testID: 'email', id: 'email' },
  play: async ({ canvas, userEvent }) => {
    // 👇 Simulate interactions with the component
    await userEvent.type(canvas.getByTestId('email'), 'email@provider.com');

    // 👇 Assert DOM structure
    await expect(canvas.getByTestId('email')).toHaveValue('email@provider.com');
  },
};

export const Outlined: Story = {
  args: { variant: 'outlined', autoFocus: true },
};

export const WithIcons: Story = {
  args: {
    label: 'Source URL',
    placeholder: 'Paste a link',
    leadingIcon: 'link',
    autoFocus: true,
  },
};

export const Error: Story = {
  args: {
    error: true,
    supportingText: 'We need a title to save your lesson',
    autoFocus: true,
  },
};

export const Multiline: Story = {
  args: {
    label: 'Paste your text',
    placeholder: 'Drop in any source and we’ll build an interactive lesson',
    multiline: true,
    rows: 4,
    variant: 'outlined',
  },
};

export const Disabled: Story = {
  args: { disabled: true, supportingText: 'Not available yet' },
};
