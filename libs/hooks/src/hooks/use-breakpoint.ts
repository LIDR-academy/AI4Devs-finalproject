import { Platform, useWindowDimensions } from 'react-native';

const DESKTOP_MIN_WIDTH = 768;

export const useBreakpoint = (): 'desktop' | 'mobile' => {
  const { width } = useWindowDimensions();

  return Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH ? 'desktop' : 'mobile';
};
