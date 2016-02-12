import expect from 'expect';
import { transform } from 'babel-core';
import jsxQuery from '../src/jsxquery';
import babelTransformConditionalExpressions from '../src/babelTransformPlugins/conditionalExpressions';

describe('babelTransformConditionalExpressions()', () => {
  const transformConditionalExpressions = code => transform(code, {
    plugins: [babelTransformConditionalExpressions],
  });

  it('transforms conditional expressions in createElement calls\' attribute value position', () => {
    const conditionalAttribute = `jsxQuery.createElement(div, { className: thing ? 'one' : 'two' })`;
    const transformed = transformConditionalExpressions(conditionalAttribute);

    expect(transformed.code).toContain("ternary(thing, 'one', 'two'");
  });

  it('transforms conditional expressions in createElement calls\' child position', () => {
    const conditionalChild = `jsxQuery.createElement("div", null,
      thing ? jsxQuery.createElement("span") : jsxQuery.createElement("div"))`;
    const transformed = transformConditionalExpressions(conditionalChild);

    const expectedBits = ["ternary(thing,", 'jsxQuery.createElement("span"),', 'jsxQuery.createElement("div")'];
    expectedBits.forEach(bit => {
      expect(transformed.code).toContain(bit);
    })
  });

  it('does not transform conditional expressions outside of createElement calls', () => {
    const originalCode = 'thing ? "one" : "two"';
    const transformed = transformConditionalExpressions(originalCode);

    expect(transformed.code).toContain(originalCode);
  });

  it('does not transform conditional expressions in other call expressions', () => {
    const originalCode = `thingy(thing ? 'one' : 'two')`;
    const transformed = transformConditionalExpressions(originalCode);

    expect(transformed.code).toContain(originalCode);
  })

  it('recognizes createElement calls from independent functions and object methods of that name')

  // it('transforms conditional expressions in right-hand side of assignment to variable used in attribute value position');

  // it('transforms conditional expressions in right-hand side of assignment to variable used in child position;');

});

// describe('babelTransformChildrenWithDynamicContent', () => {
//   const babelTransformChildren = code => transform(code, {
//     plugins: [babelTransformChildrenWithDynamicContent],
//   });

//   it('transforms child arguments in createElement calls');
// });
