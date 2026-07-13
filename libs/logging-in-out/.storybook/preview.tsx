// Must stay first: registers the unistyles themes before any story module evaluates a
// StyleSheet.create call. Public `@helsoft/components/theme` subpath.
import { themes, ThemeScheme } from '@helsoft/components/theme';
import { LocalizationProvider } from '@helsoft/localization';

import type { Decorator, Preview } from '@storybook/react-native-web-vite';
import { useEffect } from 'react';
import { UnistylesRuntime } from 'react-native-unistyles';

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

const withLocalizationProvider: Decorator = (Story) => (
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
  decorators: [withUnistylesTheme, withLocalizationProvider],
};

export default preview;
