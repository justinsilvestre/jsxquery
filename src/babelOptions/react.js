export default {
  presets: [require('babel-preset-react'), require('babel-preset-stage-2')],
  plugins: [
    require('babel-plugin-transform-es2015-destructuring'),
    require('babel-plugin-transform-es2015-parameters'),
    require('babel-plugin-transform-es2015-modules-commonjs'),
  ],
}
