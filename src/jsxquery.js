import Element, { createElement } from './classes/Element';
import Component, { createClass } from './classes/Component';
import classNames from './classNames';
import ConditionalValue from './classes/ConditionalValue';
import babelTransformNamespacedNames from './babelTransformPlugins/namespacedNames';
import babelTransformConditionalExpressions from './babelTransformPlugins/conditionalExpressions';

const jsxQuery = {
  Element,
  createElement,
  
  Component,
  createClass,

  ternary(test, consequent, alternate) {
    return new ConditionalValue(test, consequent, alternate);
  },

  classNames,

  babelTransformNamespacedNames,
  babelTransformConditionalExpressions,
};

module.exports = jsxQuery;
