import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { StateLayer } from './state-layer';

const demoStyles = StyleSheet.create((theme) => ({
  container: {
    width: 200,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.shape.md,
    backgroundColor: theme.colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  label: {
    ...theme.typography.labelLarge,
    color: theme.colors.onSurface,
  },
}));

const meta = {
  title: 'Atoms/StateLayer',
  component: StateLayer,
  // MD3 opacities: hover 0.08 · focus/press 0.12 · drag 0.16 (theme.stateLayerOpacity)
  args: { opacity: 0.08 },
  decorators: [
    (Story) => (
      <View style={demoStyles.container}>
        <Text style={demoStyles.label}>Container</Text>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof StateLayer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Hover: Story = {};

export const Press: Story = {
  args: { opacity: 0.12 },
};

export const Hidden: Story = {
  args: { opacity: 0 },
};

export const CustomColor: Story = {
  args: { opacity: 0.12, color: '#B84C2B' },
};
