import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Card } from './card';

const contentStyles = StyleSheet.create((theme) => ({
  wrap: { gap: 4 },
  title: { ...theme.typography.titleMedium, color: theme.colors.onSurface },
  subtitle: { ...theme.typography.bodyMedium, color: theme.colors.onSurfaceVariant },
}));

const CardContent = () => (
  <View style={contentStyles.wrap}>
    <Text style={contentStyles.title}>Photosynthesis basics</Text>
    <Text style={contentStyles.subtitle}>Biology · 14 slides · 6 min</Text>
  </View>
);

const meta = {
  title: 'Atoms/Card',
  component: Card,
  args: {
    children: <CardContent />,
    style: { width: 320 },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Elevated: Story = {};

export const Filled: Story = {
  args: { variant: 'filled' },
};

export const Outlined: Story = {
  args: { variant: 'outlined' },
};

export const Interactive: Story = {
  args: { interactive: true },
};
