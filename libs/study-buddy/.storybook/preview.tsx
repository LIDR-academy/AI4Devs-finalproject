// Must stay first: registers the unistyles themes before any story module evaluates a
// StyleSheet.create call. Public `@helsoft/components/theme` subpath (StyleSheet.configure
// side effect) — study-buddy doesn't own the theme registry.
import { type ThemeScheme, themes } from '@helsoft/components/theme';

import { LocalizationProvider } from '@helsoft/localization';
import type { Decorator, Preview } from '@storybook/react-native-web-vite';
import { useEffect } from 'react';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { UnistylesRuntime } from 'react-native-unistyles';

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

// Real LocalizationProvider (not mocked): study-buddy's feature components call
// useLocalization() directly, and the provider is self-contained (isolated i18next
// instance, no app-level setup needed) — so stories get genuine translated copy and
// live locale switching instead of raw i18n keys.
const withLocalizationProvider: Decorator = (Story) => (
  <LocalizationProvider initialLocale="en">
    <Story />
  </LocalizationProvider>
);

const withSafeAreaProvider: Decorator = (Story) => (
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <Story />
  </SafeAreaProvider>
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
  decorators: [withUnistylesTheme, withLocalizationProvider, withSafeAreaProvider],
};

export default preview;
