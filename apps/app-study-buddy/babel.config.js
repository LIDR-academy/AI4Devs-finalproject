module.exports = (api) => {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Processes app files under src plus any file importing react-native-unistyles
      // (covers @helsoft/components, which ships uncompiled source).
      ['react-native-unistyles/plugin', { root: 'src' }],
    ],
  };
};
