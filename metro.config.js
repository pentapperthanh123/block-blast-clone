// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add .wav to asset extensions for sound files
config.resolver.assetExts.push('wav');

// Ensure Metro runs Babel transformation for node_modules that use import.meta (e.g., Zustand ES modules)
const defaultBabelTransformerPath = config.transformer.babelTransformerPath;
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('./metro-import-meta-transformer.js'),
};

module.exports = config;

