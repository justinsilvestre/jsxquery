var path = require('path');
// require.main.paths.push('./src/babelTransformPlugins')
var transformNamespacedNames = require('./src/babelTransformPlugins/namespacedNames');
var transformConditionalExpressions = require('./src/babelTransformPlugins/conditionalExpressions');
var transformClassNamesCalls = require('./src/babelTransformPlugins/classNamesCalls');


module.exports = {
  entry: path.join(__dirname, 'src', 'demo.js'),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'jsxquery.js',
    libraryTarget: 'var',
    library: 'jsxQuery',
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loader: 'babel',
        exclude: /node_modules/,
    //     query: {
    //       presets: ['es2015'],
    //       plugins: [
    // "transform-runtime",
    // "../src/babelTransformPlugins/namespacedNames",
    // // transformNamespacedNames,
    // "transform-react-display-name",
    //         ['transform-react-jsx', { 'pragma': 'jsxQuery.createElement' }],
    // // "./src/babelTransformPlugins/conditionalExpressions",
    // // "./src/babelTransformPlugins/classNamesCalls",
    // // transformConditionalExpressions,
    // // transformClassNamesCalls,
    //       ],
        // },
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
  externals: { jquery: 'jQuery', redux: 'Redux', 'react-redux': 'ReactRedux', react: 'React' },
  node: {
    fs: 'empty',
    net: 'empty',
    module: 'empty',
  },
};
