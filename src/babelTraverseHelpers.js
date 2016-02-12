import { transform, traverse } from 'babel-core';
import transformReactJSX from 'babel-plugin-transform-react-jsx';
import transformNamespacedNames from './babelTransformPlugins/namespacedNames';
import transformConditionalExpressions from './babelTransformPlugins/conditionalExpressions';

const babelOptions = {
  plugins: [
    transformNamespacedNames,
    [transformReactJSX, { pragma: 'jsxQuery.createElement' }],
    transformConditionalExpressions,
  ],
};

export function prepareTransform(originalCode) {
  return transform(originalCode, babelOptions).code;
}

export function calleeName(callee) {
  return callee && callee.property && callee.property.name;
}

export function normalizeWhitespace(str) {
  return str.trim().replace(/\s+/g, ' ');
}

export function eachNode(transformedCode, callback) {
  traverse(transformedCode.ast, {
    enter({ node, parent }) {
      callback(node, parent);
    },
  });
}

export function filterNodes(transformedCode, predicate) {
  var result = [];
  eachNode(transformedCode, (node, parent) => {
    if (predicate(node, parent))
      result.push(node);
  });
  return result;
}

export function codeAtNodes(transformedCode, predicate, orig) {
  return filterNodes(transformedCode, predicate).map((node) => {
    const {start, end} = node;
    return normalizeWhitespace(transformedCode.code.substring(start, end));
  });
}
