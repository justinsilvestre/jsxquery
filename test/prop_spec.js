import expect from 'expect';
import Prop from '../src/classes/Prop';
import Component from '../src/classes/Component';
import jsxQuery, { classNames, createElement } from '../src/jsxQuery';

describe('Prop', () => {
  const mockParent = { mutableProps: [], callsFromHandler: [] };

  const functionProp = new Prop(mockParent, 'myFunc', () => 'hi', false);

  describe('when instantiated with a function value', () => {
    it('adds to parent\'s "callsFromHandler" array on invocation', () => {
      const originalLength = functionProp.parent.callsFromHandler.length;

      functionProp();

      expect(functionProp.parent.callsFromHandler.length).toEqual(originalLength + 1);
    });

    it('still has isMutable() function', () => {
      expect(functionProp.isMutable.bind(functionProp)).toNotThrow();
    });

    it('still has all the expected Prop properties');
  });

  describe('when instantiated with a prop', () => {
    it('is identical to the original prop', () => {
      const firstProp = new Prop(mockParent, 'aprop', 'valueeee', false);
      const secondProp = new Prop(mockParent, 'anotherprop', firstProp, false);

      expect(firstProp).toBe(secondProp);
    });
  });

  describe('initialValue()', () => {
    it('returns the prop value for a prop', () => {
      const normalProp = new Prop(mockParent, 'number', 1, true);
      expect(normalProp.initialValue()).toEqual(1);
    });

    it('returns the result of function at .value for a prop call with no arguments', () => {
      expect(functionProp().initialValue()).toEqual('hi');
    });

    const functionPropWithParameters = new Prop(mockParent, 'myFunc', (num1, num2) => +num1 + +num2, false);
    const numProp1 = new Prop(mockParent, 'num1', 1, false);
    const numProp2 = new Prop(mockParent, 'num1', 2, false);

    it('returns the result of function at .value for a prop call with prop arguments', () => {
      expect(functionPropWithParameters(numProp1, numProp2).initialValue()).toEqual(3);
    });
  });

  describe('transformed()', () => {    
    it('transforms mapped-over list prop with provided callback when not loaded', () => {
      const arrayValue = ['a','b','c','d'];
      const listProp = new Prop(mockParent, 'listProp', arrayValue, false);
      const wrapWithSpan = val => <span id="boop">{val}</span>;

      expect(listProp.map(wrapWithSpan).transformed()).toEqual(arrayValue.map(wrapWithSpan));
    });

    it('uses JSTL logic to iterate over prop value when loaded', () => {
      const arrayValue = ['a','b','c','d'];
      const loadedListProp = new Prop(mockParent, 'loadedListProp', arrayValue, true);
      const wrapWithSpan = val => <span id="boop">{val}</span>;

      expect(loadedListProp.map(wrapWithSpan).transformed()).toContain({
        tagName: 'c:forEach'
      });
    });

    it('returns void for non-transformed prop', () => {
      expect(functionProp.transformed()).toNotExist();
    })
  })

  describe('map()', () => {
    it('throws an error if value is not array and was not loaded', () => {
      const nonLoadedArrayProp = new Prop(mockParent, 'someProp', 'thisIsNotAnArray', false);

      expect(() => nonLoadedArrayProp.map(a => a)).toThrow(
        `You cannot map over your prop '${nonLoadedArrayProp.initialName}' as it is not an array.`
      );
    });

    it('returns a new Prop with same value when called with array value', () => {
      const arrayValue = 'abcdefg'.split('');;
      const propToMap = new Prop(mockParent, 'toBeMapped', arrayValue, false)
      const mappedProp = propToMap.map(a => <span>{a}</span>)

      expect(mappedProp.value).toBe(arrayValue);
    });
  });
});
