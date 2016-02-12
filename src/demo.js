import { transform as babelTransform } from 'babel-core';
import jsxQuery from './jsxquery';
import babelOptions from './babelOptions/demo';
import babelReactOptions from './babelOptions/react';
import classNamesOriginal from 'classnames';

function transform(code) {
  return babelTransform(code, babelOptions);
}

function reactTransform(code) {
  return babelTransform(code, babelReactOptions);
}

const rawRedux = jsxQuery.Component.prototype.redux;
jsxQuery.Component.prototype.rawRedux = rawRedux;
jsxQuery.Component.prototype.redux = function() {
  return {
    actions: reactTransform(rawRedux.call(this).actions).code,
    setup: reactTransform(rawRedux.call(this).setup).code,
  };
};

module.exports = Object.assign({},
  jsxQuery,
  {
    transform,
    reactTransform,
    classNamesOriginal,
  }
);
