import expect from 'expect';
import Child from '../src/classes/Child';
import Prop from '../src/classes/Prop';
import ConditionalValue from '../src/classes/ConditionalValue';
import jsxQuery, { createElement } from '../src/jsxquery';

describe('Child', () => {
  const stringChild = new Child('hello <b>there</b>');
  const elementChild = new Child(createElement('div', null, 'k!'));

  const span = <span>one</span>;
  const strong = <strong>two</strong>;
  function propTemplate(propsWereLoaded = true, propsAreMutable = true) {
    return new Prop({ mutableProps: [propsAreMutable ? 'thing' : 'notThing'] }, 'thing', true, propsWereLoaded);
  }

  function conditionalElementChildTemplate(propsWereLoaded = true, propsAreMutable = true) {
    const defaultProperties = new ConditionalValue(
      propTemplate(propsWereLoaded, propsAreMutable),
      span,
      strong
    );
    return new Child(defaultProperties);
  };

  const conditionalChild = conditionalElementChildTemplate();
  const conditionalStringChild = new Child(new ConditionalValue(
    new Prop({ mutableProps: ['thing'] }, 'thing', true, true),
      'thingTwo',
      'thingThree'
  ));

  const containerChild = new Child(new Prop({ mutableProps: [] }, 'thingy', true));

  const arrayOfElements = ['one', 'two', 'three'].map(v => <span>{v}</span>);

  describe('when instantiated with an array', () => {
    it('throws an error when any value in the array is not a Element', () => {
      var invalidArray = arrayOfElements.concat();
      invalidArray[0] = "I'm just a string!";

      expect(() => new Child(invalidArray)).toThrow(
        'When providing an array as Element child, each value in the array must be an Element'
      );
    });
  });

  describe('when instantiated with a conditional value having both consequent and alternate values', () => {
    it('throws an error if only one out option is not an Element (should be either both or neither)', () => {
    const mixedConditionalValue = new ConditionalValue(
      new Prop({ mutableProps: ['thing'] }, 'thing', true, true),
      'thingOne',
      span
    );
      expect(() => new Child(mixedConditionalValue)).toThrow('The consequent and alternate in a dynamic conditional child must both be Elements or not Elements');
    });
  })

  describe('isConditional()', () => {
    it('returns false for a Child created from a string', () => {
      expect(stringChild.isConditional()).toBe(false);
    });

    it('returns false for a Child created from an element', () => {
      expect(elementChild.isConditional()).toBe(false);
    });

    it('returns true for a Child created from an object with ternary expression data', () => {
      expect(conditionalElementChildTemplate().isConditional()).toBe(true);
    });

    it('returns false for a Child created from a component prop', () => {
      expect(containerChild.isConditional()).toBe(false);
    });
  });

  describe('isContainer()', () => {
    it('returns false for element children and static text children', () => {
      expect([stringChild.isContainer(), 'string']).toEqual([false, 'string']);
      expect([elementChild.isContainer(), 'element']).toEqual([false, 'element']);
      expect([conditionalChild.isContainer(), 'conditional element']).toEqual([false, 'conditional element']);
    });

    it('returns true for a Child created from a component prop, or a conditional text child', () => {
      expect(containerChild.isContainer()).toBe(true);
      expect(conditionalStringChild.isContainer()).toBe(true);
    });
  });

  describe('render()', () => {
    it('returns HTML-escaped value of string child', () => {
      expect(stringChild.render()).toEqual('hello &lt;b&gt;there&lt;/b&gt;');
    });

    it('renders the value of a raw text child', () => {
      const rawChild = new Child('<b>hi</b>', true);
      expect(rawChild.render()).toEqual('<b>hi</b>')
    });

    it('renders the raw value of a raw container child', () => {
      const rawPropChild = new Child(propTemplate(false, false), true);
      expect(rawPropChild.render()).toEqual(true)
    });

    it('returns value of container child converted to string', () => {
      expect(containerChild.render()).toEqual('true');
    });

    it('renders either consequent element or alternate element if test condition is '
      + 'neither determined at server render time nor part of component\'s mutable state', () => {
      const staticTest = conditionalElementChildTemplate(false, false);

      expect(staticTest.render()).toEqual(span.markup());
    });

    it('renders either consequent non-element or alternate non-element using JSTL logic'
      + ' if test condition is determined at server render time');

   /* it('renders either consequent element or alternate element using JSTL logic'
      + ' if test condition is determined at server render time', () => {
      const jstlTest = conditionalElementChildTemplate(true, false);
      const markup = jstlTest.render();
      const choose = '<c:choose>';
      const when = '<c:when test="${true}">';
      const otherwise = '<c:otherwise>';

      expect(markup).toContain(choose);
      expect(markup.slice(markup.indexOf(choose))).toContain('when');
      expect(markup.slice(markup.indexOf(when))).toContain('otherwise', jstlTest.value.consequent.markup());
      expect(markup.slice(markup.indexOf(otherwise))).toContain(jstlTest.value.alternate.markup());
    });*/

    it('shows either consequent element or alternate element using display styles while rendering both'
      + ' if test condition is part of component\'s mutable state', () => {
      const child = conditionalElementChildTemplate(false, true);

      expect(child.render()).toContain('strong style="display: none');
    });

/*    it('shows either consequent element or alternate element using display styles determined using JSTL logic '
      + 'if test condition is both determined at server render time '
      + 'and part of component\'s mutable state', () => {
      const child = conditionalElementChildTemplate(true, true);

      expect(child.render()).toContain('strong<c:if test="${true}"> style="display: none;"');
      expect(child.render()).toContain('span<c:if test="${!(true)}"> style="display: none;"')
    });*/

    it('accepts function component as consequent', () => {
      const FunctionComponent = () => span;

      const conditionalComponentChild = new Child(
        new ConditionalValue(propTemplate(false, false),
        <FunctionComponent />,
        <span id="alternate">this is the alternate</span>
      ));
      expect(conditionalComponentChild.render()).toEqual(span.markup());
    });

    it('renders each element when value is an array', () => {
      const arrayChild = new Child(arrayOfElements);

      arrayOfElements.forEach(e => {
        expect(arrayChild.render()).toContain(e.markup());
      });
    });
  });
});
