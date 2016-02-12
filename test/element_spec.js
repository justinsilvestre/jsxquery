import expect from 'expect';
import { createElement } from '../src/jsxquery';
import jsxQuery, { Component, ternary, classNames } from '../src/jsxquery';
import Prop from '../src/classes/Prop';

describe('Element', () => {
  it('throws an error when a child with dynamic content has siblings but no containing element', () => {
    class FreeDynamicChild extends Component {
      static get defaultProps() { return { apropos: 'true' }; }
      render() {
        return <div>{this.props.apropos}hi there</div>;
      }
    }

    expect(() => createElement(FreeDynamicChild, null)).toThrow(
      'Your <div> element has dynamic text content not wrapped in its own element'
    );
  });

  it('throws an error when a child with conditional text has siblings but no containing element', () => {
    class FreeConditionalTextChild extends Component {
      static get defaultProps() { return { apropos: 'true' }; }
      render() {
        return <div>{this.props.apropos ? 'woop' : 'dedoop'} <span>hi there</span></div>;
      }
    }
    expect(() => createElement(FreeConditionalTextChild, null)).toThrow(
      'Your <div> element has dynamic text content not wrapped in its own element'
    );
  });

  it('throws an error when component logic is present without a component having been passed to constructor');

  it('throws an error when component name given does not refer to a function', () => {
    const InvalidComponent = <span>This only is an Element, not a function that returns an Element</span>;
    expect(() => <InvalidComponent />).toThrow('Your component must either be a function returning an Element or a Component class');
  });

  describe('attributes', () => {
    it('gets attributes with static and dynamic values', () => {
      const conditionalAttributeData = ternary(
        new Prop({ mutableProps: ['blah'] }, 'blah', 'whatever'),
        'blah',
        'bloo',
        true
      );
      const attributes = {
        className: conditionalAttributeData,
        id: 'blahblah',
      };
      const element = createElement('div', attributes);

      for(const attr in attributes)
        expect(element.attributes.map(a => a.value)).toContain(attributes[attr]);
    });
  });

  describe('markup()', () => {
    it('produces a self-closing tag for void elements', () => {
      expect(createElement('br', null).markup().trim()).toEqual('<br />');
    });

    it('throws an error when a void element is given children');

    it('produces both start and end tags for non-void tags', () => {
      const div = createElement('div', null, 'hi');
      const markup = div.markup().trim();
      const startTag = '<div>';
      const endTag = '</div>';

      expect(markup.indexOf(startTag)).toBe(0);
      expect(markup.indexOf(endTag)).toBe(markup.length - endTag.length);
    });

    it('accepts a child string', () => {
      const oneStringChildHtml = createElement('span', null, 'hihi').markup();
      const spanContents = oneStringChildHtml.substring(
        oneStringChildHtml.indexOf('<span>') + 1,
        oneStringChildHtml.lastIndexOf('</span>')
      );

      expect(spanContents).toContain('hihi');
    });

    it('accepts a child element', () => {
      const oneElementChildHtml = createElement('div', null, createElement('span', null, 'whatevs')).markup();
      const divContents = oneElementChildHtml.substring(
        oneElementChildHtml.indexOf('<div>') + 1,
        oneElementChildHtml.lastIndexOf('</div>')
      );

      expect(divContents).toContain('<span>', 'whatevs', '</span>');
    });

    it('accepts multiple children', () => {
      const children = [
        createElement('span', null, 'ok'),
        "i'm a string yo",
        createElement('img', null),
      ];
      const parent = createElement('div', null, ...children);
      function htmlFrom(input) {
        return typeof input === 'string' ? input : input.markup();
      }

      expect(parent.markup()).toContain(...children.map((child) => htmlFrom(child)));
    });

    it('accepts an attributes object', () => {
      const attributes = {
        href: 'http://google.com',
        'data-thing': 'whatevs',
      };
      const el = createElement('a', attributes, 'Google');

      expect(el.markup()).toContain('<a href="http://google.com" data-thing="whatevs">');
    });

    it('accepts true boolean attributes', () => {
      const attributes = { hidden: true };
      const el = createElement('div', attributes, 'blah!');

      expect(el.markup()).toContain('<div hidden>', 'blah!', '</div>');
    });

    it('accepts false boolean attributes', () => {
      const attributes = { hidden: false };
      const el = createElement('div', attributes, 'blah!');

      expect(el.markup()).toContain('<div>', 'blah!', '</div>');
    });

    it('accepts a "class" attribute as "className"', () => {
      const el = createElement('div', { className: 'potato skins' });

      expect(el.markup()).toContain(' class=');
    });

    it('accepts a "for" attribute as "htmlFor"', () => {
      const el = createElement('div', { htmlFor: 'onion skins' });

      expect(el.markup()).toContain(' for=');
    });

    it('accepts tag-type string', () => {
      const div = createElement('div', null, 'ok');

      expect(div.markup()).toContain('<div>', 'ok', '</div>');
    });

    it('accepts tag-type Component class', () => {
      const span = createElement('span', null, 'hihi');
      const MyComponent = class extends Component {
        render() {
          return span;
        }
      };
      const div = createElement(MyComponent, null);

      expect(div.markup()).toEqual(span.markup());
    });

    it('accepts tag-type stateless component function', () => {
      const Span = (props) => createElement('span', { id: props.id }, 'hithere');
      const expectedMarkup = '<span id="myId">hithere</span>';

      expect(createElement(Span, { id: 'myId' }).markup().trim()).toEqual(expectedMarkup);
    });
  });

  describe('classNamesHash()', () => {
    it('returns a an empty hash for element with no className attribute', () => {
      const el = createElement('div', null);

      expect(el.classNamesHash()).toEqual({});
    });

    it('returns a hash with class name keys and true values for element with static className attribute', () => {
      const staticClassName = createElement('div', { className: 'class-one class-two' });

      expect(staticClassName.classNamesHash()).toEqual({ 'class-one': true, 'class-two': true });
    });

    it('returns an empty hash for element with empty static className attribute', () => {
      const emptyClassName = createElement('div', { className: '' });
      const whitespaceClassName = createElement('div', { className: ' ' });

      expect(emptyClassName.classNamesHash()).toEqual({});
      expect(whitespaceClassName.classNamesHash()).toEqual({});
    });
  });

  describe('clone()', () => {
    it('returns an element with identical tagName, attributes, and children')
  });
});
