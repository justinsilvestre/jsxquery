import jsdom from 'jsdom';
import expect from 'expect';
import sinon from 'sinon';
import DomManipulationExample from '../examples/BasicDomManipulation.jsx';
import jsxQuery from '../src/jsxQuery';
import _eval from 'node-eval';

describe('Component with basic DOM manipulation', () => {
  var window;
  var $;
  var componentModule;
  var sinonSandbox;
  const el = <DomManipulationExample />;
  const js = el.component.jQuery();
  const html = el.markup();

  beforeEach((done) => {
    window = global.window = jsdom.jsdom(html).defaultView;
    jsdom.jQueryify(window, './node_modules/jquery/dist/jquery.js', () => {
      $ = global.$ = window.$;
      $(window.document).ready(() => {
        componentModule = _eval.call(window, js);
        done();
      });
    });
  });

  beforeEach(() => {
    sinonSandbox = sinon.sandbox.create();
    sinonSandbox.spy(componentModule.propMethods, 'sideEffect');
  });
  afterEach(() => sinonSandbox.restore());

  beforeEach(() => {
    expect($('#click-me').hasClass('blue')).toBe(false);
    expect($('#mouse-over-me').hasClass('yellow')).toBe(false);
    expect($('#container1').css('display')).toNotEqual('none');
    expect($('#container2').css('display')).toEqual('none');
    expect($('#echo-input').val()).toEqual('instant feedback');
    expect($('#later-echo-input').text()).toEqual('');
  });

  it('toggles class on click', () => {
    $('#click-me').trigger('click');

    expect($('#click-me').hasClass('blue')).toBe(true);
  });

  it('toggles class back on click', () => {
    $('#click-me').trigger('click');
    $('#click-me').trigger('click');

    expect($('#click-me').hasClass('blue')).toBe(false);
  });

  it('adds class on mouseenter', () => {
    $('#mouse-over-me').trigger('mouseenter');

    expect($('#mouse-over-me').hasClass('yellow')).toBe(true);
  });

  it('removes class on mouseleave', () => {
    $('#mouse-over-me').trigger('mouseenter');
    $('#mouse-over-me').trigger('mouseleave');

    expect($('#mouse-over-me').hasClass('yellow')).toBe(false);
  });

  it('changes text on input change', () => {
    $('#echo-input').val('something')
      .trigger('change');

    expect($('#echo-text').text()).toEqual('something');
  });

  it('changes text from input value', () => {
    $('#echo-input').val('something');
    $('#echo-button').trigger('click');

    expect($('#later-echo-text').text()).toEqual('something');
  });

  it('shows/hides conditionally displayed elements on click', () => {
    $('#goodbye-button').trigger('click');

    expect($('#container1').css('display')).toEqual('none');
    expect($('#container2').css('display')).toNotEqual('none');
  });

  it('re-shows/-hides conditionally displayed elements on click', () => {
    $('#goodbye-button').trigger('click');
    $('#hello-button').trigger('click');

    expect($('#container1').css('display')).toNotEqual('none');
    expect($('#container2').css('display')).toEqual('none');
  });

  it('calls propMethod on click', () => {
    $('#side-effect').trigger('click');

    expect(componentModule.propMethods.sideEffect.called).toBe(true);
  });
});
