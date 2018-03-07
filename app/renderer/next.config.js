const withTypescript = require('@zeit/next-typescript');

module.exports = withTypescript({
  webpack: (config) => {
    const webpackConfig = Object.assign(config, {
      target: 'electron-renderer'
    });
    webpackConfig.module.rules.push({
      test: /\.css$/,
      use: 'raw-loader'
    });
    return webpackConfig;
  },
  exportPathMap: () => ({
    '/start': { page: '/start' }
  })
});