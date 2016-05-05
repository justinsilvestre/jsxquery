import transformNamespacedNames from '../babelTransformPlugins/namespacedNames';
import transformConditionalExpressions from '../babelTransformPlugins/conditionalExpressions';

export default {
  'presets': [require('babel-preset-stage-2')],
  'plugins': [
    transformNamespacedNames,
    require('babel-plugin-transform-react-display-name'),
    [require('babel-plugin-transform-react-jsx'), { pragma: 'jsxQuery.createElement' }],
    require('babel-plugin-transform-es2015-destructuring'),
    // require('babel-plugin-transform-es2015-parameters'),
    // LATER also do modules???
    // definitely need to make stuff work with both createElement
    // calls and babel'd createElement calls. plus ternary calls.
    transformConditionalExpressions,
    require('babel-plugin-transform-es2015-modules-commonjs'),
  ],
};
