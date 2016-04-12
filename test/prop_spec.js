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

  describe('map()', () => {
    it('throws an error if value is not array', () => {
      expect(() => functionProp.map(a => a)).toThrow(
        `You cannot map over your prop '${functionProp.initialName}' as it is not an array.`
      );
    });

    it('delegates to value\'s map() function if the prop was not loaded', () => {
      const arrayProp = new Prop(mockParent, 'arrayProp', ['a', 'b', 'c'], false);

      const callback = v => 'whoop!!!' + v;
      expect(arrayProp.map(callback)).toEqual(arrayProp.value.map(callback));
    });
  });
});
