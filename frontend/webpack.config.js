const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const { ProvidePlugin } = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    vm: require.resolve('vm-browserify'),
  };

  config.plugins.push(
    new ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  );

  return config;
};
