import { fileURLToPath } from 'node:url';

import type { StorybookConfig } from '@storybook/react-native-web-vite';

const dirname = fileURLToPath(new URL('.', import.meta.url));

// RN primitives the unistyles babel plugin swaps in. Pre-bundling them stops Vite
// from re-optimizing (and full-page reloading) the first time a story uses one.
// Mirrors libs/components/.storybook/main.ts (same root cause, one workspace layer up).
const unistylesComponents = [
  'ActivityIndicator',
  'Animated',
  'FlatList',
  'Image',
  'ImageBackground',
  'KeyboardAvoidingView',
  'Pressable',
  'RefreshControl',
  'SafeAreaView',
  'ScrollView',
  'SectionList',
  'Switch',
  'Text',
  'TextInput',
  'TouchableHighlight',
  'TouchableOpacity',
  'View',
  'VirtualizedList',
];

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-native-web-vite',
    options: {
      pluginReactOptions: {
        babel: {
          plugins: [['react-native-unistyles/plugin', { root: 'src' }]],
        },
      },
    },
  },
  viteFinal: (viteConfig) => {
    viteConfig.optimizeDeps = {
      ...viteConfig.optimizeDeps,
      include: [
        ...(viteConfig.optimizeDeps?.include ?? []),
        'react-native-unistyles',
        ...unistylesComponents.map((name) => `react-native-unistyles/components/native/${name}`),
      ],
    };
    viteConfig.resolve = {
      ...viteConfig.resolve,
      alias: {
        ...viteConfig.resolve?.alias,
        // Storybook-only seams: no Expo Router / Supabase tree here. See .storybook/mocks/*.
        'expo-router': `${dirname}mocks/expo-router.ts`,
        'expo-document-picker': `${dirname}mocks/expo-document-picker.ts`,
        '@helsoft/hooks': `${dirname}mocks/hooks.ts`,
        '@helsoft/pdf-upload-extraction': `${dirname}mocks/pdf-upload-extraction.ts`,
      },
    };
    return viteConfig;
  },
};

export default config;
