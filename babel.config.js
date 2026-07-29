module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['babel-plugin-transform-import-meta', { module: 'ES6' }],
      // React Native Reanimated plugin MUST be listed last
      'react-native-reanimated/plugin',
    ],
  };
};
