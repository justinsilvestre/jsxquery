var path = require('path');

module.exports = {
  entry: path.join(__dirname, 'src', 'demo.js'),
  output: {
    path: path.join(__dirname, 'demo'),
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
