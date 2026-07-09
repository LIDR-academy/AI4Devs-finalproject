import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { useState } from 'react';
import { View } from 'react-native';

import { Checkbox } from './checkbox';

const meta = {
  title: 'Atoms/Checkbox',
  component: Checkbox,
  args: {
    label: 'Include quick checks',
  },
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveDemo = ({withLabel}: {withLabel: boolean}) => {
  const [checked, setChecked] = useState(true);
  return <Checkbox label={withLabel ? 'Include quick checks' : undefined} checked={checked} onChange={setChecked} />;
};

export const Interactive: Story = {
  render: () => <InteractiveDemo withLabel={true} />,
};

export const NoLabel: Story = {
  render: () => <InteractiveDemo withLabel={false} />,
};


export const Checked: Story = {
  args: { checked: true },
};

export const Indeterminate: Story = {
  args: { indeterminate: true },
};

export const ErrorState: Story = {
  args: { error: true },
};

export const Disabled: Story = {
  args: { disabled: true, checked: true },
};

export const States: Story = {
  render: () => (
    <View style={{ gap: 12 }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" checked />
      <Checkbox label="Indeterminate" indeterminate />
      <Checkbox label="Disabled" disabled />
    </View>
  ),
};
