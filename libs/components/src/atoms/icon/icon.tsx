import { Platform, type StyleProp, Text, type TextStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type IconProps = {
  /** Material Symbols ligature name, e.g. "upload_file". */
  name: string;
  size?: number;
  /** Filled style for selected/active/emphasis states (variable-font FILL axis). */
  fill?: boolean;
  weight?: number;
  grade?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
};

/**
 * Icon — thin wrapper over Material Symbols Rounded (the MD3 icon set).
 * The font must be loaded under family name "Material Symbols Rounded"
 * via expo-font (e.g. `@expo-google-fonts/material-symbols-rounded` in the app root).
 * Variable-font axes (fill/weight/grade) apply on web only.
 */
export const Icon = ({
  name,
  size = 24,
  fill = false,
  weight = 400,
  grade = 0,
  color,
  style,
}: IconProps) => {
  const variation: TextStyle | null =
    Platform.OS === 'web'
      ? ({
          // Material Symbols renders via ligatures; RN Web needs liga enabled.
          fontFeatureSettings: "'liga'",
          fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${Math.min(48, Math.max(20, size))}`,
        } as TextStyle)
      : null;

  return (
    <Text selectable={false} style={[styles.icon(size, color), variation, style]}>
      {name}
    </Text>
  );
};

const styles = StyleSheet.create((theme) => ({
  icon: (size: number, color?: string) => ({
    fontFamily: theme.fontFamily.icon,
    fontSize: size,
    lineHeight: size,
    color: color ?? theme.colors.onSurface,
    includeFontPadding: false,
  }),
}));
