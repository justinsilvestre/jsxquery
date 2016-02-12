import jsdom from 'jsdom';
import expect from 'expect';
import { transform } from 'babel-core';
import DomManipulationExample from '../examples/DomManipulation.jsx';
import { prepareTransform, codeAtNodes, normalizeWhitespace, calleeName } from '../src/babelTraverseHelpers';
import { createElement } from '../src/jsxquery';

var window;
var expectedScript;

const expectedCodeWhere = predicate => codeAtNodes(transform(expectedScript), predicate, expectedScript);
const domManipulationExample = <DomManipulationExample />;
const actualScript = normalizeWhitespace(prepareTransform(domManipulationExample.component.jQuery()));

before(() => {
  jsdom.env('domManipulationExample.html', [], (er, w) => {
    if (!('document' in w))
      throw new Error('jsdom had a problem. Run the test suite again.');

    window = w;
    expectedScript = prepareTransform(
      window.document.getElementById('dom-manipulation-script').innerHTML
    );
  });
});

describe('jQuery DOM manipulation code generation', () => {
  it('generates jQuery toggleClass call from TOGGLE action on prop in className attribute', () => {
    const clickHandler = expectedCodeWhere(node =>
      calleeName(node.callee) === 'on'
        && node.arguments[0].value === 'click'
    )[0];
    expect(actualScript).toContain(clickHandler);
  });

  it('generates jQuery addClass call from START action on prop in className attribute', () => {
    const mouseEnterHandler = expectedCodeWhere(node =>
      calleeName(node.callee) === 'on'
        && node.arguments[0].value === 'mouseenter'
    )[0];
    expect(actualScript).toContain(mouseEnterHandler);
  });

  it('generates jQuery removeClass call from END action on prop in className attribute', () => {
    const mouseLeaveHandler = expectedCodeWhere(node =>
      calleeName(node.callee) === 'on'
        && node.arguments[0].value === 'mouseleave'
    )[0];
    expect(actualScript).toContain(mouseLeaveHandler);
  });

  it('generates jQuery text() call from SET action on prop in child position', () => {
    const changeHandler = expectedCodeWhere(node =>
      calleeName(node.callee) === 'on'
        && node.arguments[0].value === 'change input'
    )[0];
    expect(actualScript).toContain(changeHandler);
  });

  it('generates jQuery show() call from SHOW action on prop in ternary expression test position', () => {
    const clickHandler = expectedCodeWhere(node =>
      calleeName(node.callee) === 'on'
        && node.arguments[0].value === 'click'
    )[1];
    expect(actualScript).toContain(clickHandler);
  });

  it('generates jQuery hide() call from HIDE action on prop in ternary expression test position', () => {
    const clickHandler = expectedCodeWhere(node =>
      calleeName(node.callee) === 'on'
        && node.arguments[0].value === 'click'
    )[2];
    expect(actualScript).toContain(clickHandler);
  });

  it('generates jQuery html() call from SET action on prop in dangerouslySetInnerHTML attribute');

  it('generates jQuery attr() call from SET action on prop in renderable attribute');

  it('generates prop method', () => {
    const sumPropMethod = <DomManipulationExample />.component.props.sum.value.toString();
    expect(actualScript).toContain(normalizeWhitespace(sumPropMethod));
  });

  it('includes prop method call in appropriate handler', () => {
    const clickHandler = expectedCodeWhere(node =>
      calleeName(node.callee) === 'on'
        && node.arguments[0].value === 'click'
    )[3];
    expect(actualScript).toContain(clickHandler);
  });
});
