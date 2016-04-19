import jsdom from 'jsdom';
import expect from 'expect';
import { transform } from 'babel-core';
import DomManipulationExample from '../examples/DomManipulation.jsx';
import { prepareTransform, codeAtNodes, normalizeWhitespace, calleeName } from '../src/babelTraverseHelpers';
import * as jsxQuery from '../src/jsxquery';

var window;
var expectedScript;

const codeWhere = predicate => codeAtNodes(transform(expectedScript), predicate, expectedScript);
const handlersInExpectedScript = eventType => codeWhere(node =>
  calleeName(node.callee) === 'on' && node.arguments[0].value === eventType
  );
const domManipulationExample = <DomManipulationExample />;
const actualScript = normalizeWhitespace(prepareTransform(domManipulationExample.component.jQuery()));
const handlerRegex = eventType => new RegExp("\\S+\\.on\\('" + eventType + "'\\, function.+?\\}\\)", 'g');
const handlersInActualScript = eventType => actualScript.match(handlerRegex(eventType));

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
    const clickHandler = handlersInExpectedScript('click')[0];
    // expect(actualScript.match(/\S+\.on\('click'\, function.+?\}\); /)).toContain(clickHandler);
    expect(handlersInActualScript('click')).toContain(clickHandler);
  });

  it('generates jQuery addClass call from START action on prop in className attribute', () => {
    const mouseEnterHandler = handlersInExpectedScript('mouseenter')[0];
    expect(handlersInActualScript('mouseenter')).toContain(mouseEnterHandler);
  });

  it('generates jQuery removeClass call from END action on prop in className attribute', () => {
    const mouseLeaveHandler = handlersInExpectedScript('mouseleave')[0];
    expect(handlersInActualScript('mouseleave')).toContain(mouseLeaveHandler);
  });

  it('generates jQuery text() call from SET action on prop in child position', () => {
    const changeHandler = handlersInExpectedScript('change input')[0];
    expect(handlersInActualScript('change input')).toContain(changeHandler);
  });

  it('generates jQuery show() call from SHOW action on prop in ternary expression test position', () => {
    const clickHandler = handlersInExpectedScript('click')[1];
    expect(handlersInActualScript('click')).toContain(clickHandler);
  });

  it('generates jQuery hide() call from HIDE action on prop in ternary expression test position', () => {
    const clickHandler = handlersInExpectedScript('click')[2];
    expect(actualScript).toContain(clickHandler);
  });

  it('generates jQuery html() call from SET action on prop in dangerouslySetInnerHTML attribute', () => {
    const mouseMoveHandler = handlersInExpectedScript('mousemove')[0];
    expect(handlersInActualScript('mousemove')).toContain(mouseMoveHandler);
  });

  it('generates jQuery attr() call from SET action on prop in renderable attribute', () => {
    const scrollHandler = handlersInExpectedScript('scroll')[0];
    expect(handlersInActualScript(('scroll'))).toContain(scrollHandler)
  });

  it('generates prop method', () => {
    const sumPropMethod = <DomManipulationExample />.component.props.sum.value.toString();
    expect(actualScript).toContain(normalizeWhitespace(sumPropMethod));
  });

  it('includes prop method call in appropriate handler', () => {
    const clickHandler = handlersInExpectedScript('click')[3];
    expect(actualScript).toContain(clickHandler);
  });
});
