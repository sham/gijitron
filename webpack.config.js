
var path = require('path')
var glob = require('glob')
var slash = require('slash')
var webpack = require('webpack')
var UglifyJSPlugin = require('uglifyjs-webpack-plugin')

var jsBasePath = slash(path.resolve('app'))
var targets = glob.sync(`${jsBasePath}/**/*.{js,jsx}`)
var entries = {}
targets.forEach(value => {
  var re = new RegExp(`${jsBasePath}/`)
  var key = value.replace(re, '').replace('.jsx', '.js').replace('.js', '')
  entries[key] = value;
});

module.exports = {
  entry: entries,
  target: "electron",
  output: {
    path: path.join(__dirname, '_dist'),
    filename: '[name].js'
  },
  node: {
    __dirname: false,
    __filename: false
  },
  module: {
    loaders: [
    {
      test: /.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/
    }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),
    new UglifyJSPlugin()
  ]
};