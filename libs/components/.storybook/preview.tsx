// Must stay first: registers the unistyles themes before any story module
// evaluates a StyleSheet.create call.
import '../src/theme/unistyles';

import type { Decorator, Preview } from '@storybook/react-native-web-vite';
import { LocalizationProvider } from '@helsoft/localization';
import { useEffect } from 'react';
import { UnistylesRuntime } from 'react-native-unistyles';

import { themes, ThemeScheme } from '../src/theme/unistyles';

// The library defaults to adaptive (OS) themes; storybook drives them manually.
// Pinned at module scope so the first story paint matches the toolbar default
// instead of flashing the OS scheme.
UnistylesRuntime.setAdaptiveThemes(false);
UnistylesRuntime.setTheme('light');
document.body.style.backgroundColor = themes.light.colors.background;

const withUnistylesTheme: Decorator = (Story, context) => {
  const scheme: ThemeScheme = context.globals.theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    UnistylesRuntime.setTheme(scheme);
    document.body.style.backgroundColor = themes[scheme].colors.background;
  }, [scheme]);

  return <Story />;
};

/** Organisms that call `useLocalization` need a provider; `initialLocale` skips AsyncStorage. */
const withLocalization: Decorator = (Story) => (
  <LocalizationProvider initialLocale="en">
    <Story />
  </LocalizationProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Design-system color scheme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [withLocalization, withUnistylesTheme],
};

export default preview;
