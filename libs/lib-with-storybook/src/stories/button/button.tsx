import { Pressable, StyleSheet, Text } from 'react-native';

export type ButtonProps = {
  label: string;
  variant?: 'primary' | 'secondary';
  onPress?: () => void;
};

export const Button = ({ label, variant = 'primary', onPress }: ButtonProps) => (
  <Pressable
    style={[styles.base, variant === 'primary' ? styles.primary : styles.secondary]}
    onPress={onPress}
  >
    <Text style={variant === 'primary' ? styles.primaryLabel : styles.secondaryLabel}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primary: {
    backgroundColor: '#2563eb',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
  },
  primaryLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryLabel: {
    color: '#111827',
    fontWeight: '600',
  },
});
