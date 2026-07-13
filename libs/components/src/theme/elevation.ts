import type { ViewStyle } from 'react-native';

import { hexWithOpacity, palette } from './colors';

/**
 * AI Study Buddy — elevation (MD3 5-level shadow system).
 * Two-layer (ambient + key), neutral slate-tinted, subtle, derived from the brand midnight color.
 * `boxShadow` is supported by React Native 0.76+ and react-native-web.
 */
const ambient = hexWithOpacity(palette.brand.midnight, 0.3);
const key = hexWithOpacity(palette.brand.midnight, 0.15);
const shadow = (
  ambientY: number,
  ambientBlur: number,
  keyY: number,
  keyBlur: number,
  keySpread: number,
) =>
  `0px ${ambientY}px ${ambientBlur}px ${ambient}, 0px ${keyY}px ${keyBlur}px ${keySpread}px ${key}`;

export const elevation = {
  level0: {},
  level1: { boxShadow: shadow(1, 2, 1, 3, 1) },
  level2: { boxShadow: shadow(1, 2, 2, 6, 2) },
  level3: { boxShadow: shadow(1, 3, 4, 8, 3) },
  level4: { boxShadow: shadow(2, 3, 6, 10, 4) },
  level5: { boxShadow: shadow(4, 4, 8, 12, 6) },
} as const satisfies Record<
  'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5',
  ViewStyle
>;
