import Element, { createElement } from './classes/Element';
import Component, { createClass } from './classes/Component';
import ConditionalValue from './classes/ConditionalValue';

const jsxQuery = {
  Element,

  createElement,

  Component,

  createClass,

  ternary(test, consequent, alternate) {
    return new ConditionalValue(test, consequent, alternate);
  },

  classNames(obj, loadedProps = [], mutableProps = []) {
    return { '_classNames_': obj, loadedProps, mutableProps };
  },

  // map(collection, callbackParam, callback) {
  //   const el = new Element('c:forEach',
  //     { items: collection, 'var': callbackParam },
  //     callback(callbackParam));
  //   // all the dot operators in the callback will
  //   // be translated into string concatenation?
  //   // there might be some logic about like styles or something in here
  //   // but that will be transformed into jQuery elsewhere
  //   return el;
  // },

  // cIf(condition, consequent) {
  //   const el = new Element('c:if', { test: '${' + condition + '}' }, consequent);
  //   return el.html();
  // },

  // doubleAnd(condition, ifTrue) {
  //   return jsxQuery.cIf(condition, ifTrue);
  // },

  // doubleOr(condition, ifFalse) {
  //   // maybe not like this, because in JS
  //   // this would return condition if true (like, might be safe assignment)
  //   return jsxQuery.cIf(`!(${condition})`, ifFalse);
  // },
};

module.exports = jsxQuery;
