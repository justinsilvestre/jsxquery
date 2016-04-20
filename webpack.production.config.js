var c = require('./webpack.config');
c.entry = ['./src/jsxquery.js'];
c.output.libraryTarget = 'commonjs2';

module.exports = c;
