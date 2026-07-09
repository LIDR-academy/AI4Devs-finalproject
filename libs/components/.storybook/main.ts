import type { StorybookConfig } from '@storybook/react-native-web-vite';

// RN primitives the unistyles babel plugin swaps in. Pre-bundling them stops Vite
// from re-optimizing (and full-page reloading) the first time a story uses one.
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
    return viteConfig;
  },
};

export default config;
