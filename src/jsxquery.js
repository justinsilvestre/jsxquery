import Element, { createElement } from './classes/Element';
import Component, { createClass } from './classes/Component';
import classNames from './classNames';
import babelTransformNamespacedNames from './babelTransformPlugins/namespacedNames';
import babelTransformConditionalExpressions from './babelTransformPlugins/conditionalExpressions';
import ternary from './ternary';

const jsxQuery = {
  Element,
  createElement,
  
  Component,
  createClass,

  ternary,

  classNames,

  babelTransformNamespacedNames,
  babelTransformConditionalExpressions,
};

module.exports = jsxQuery;
