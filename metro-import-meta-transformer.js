const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  let code = src;
  if (code.includes('import.meta')) {
    code = code.replace(/import\.meta\.env/g, '(process.env || {})');
    code = code.replace(/import\.meta/g, '({ env: process.env || {} })');
  }
  return upstreamTransformer.transform({ src: code, filename, options });
};
