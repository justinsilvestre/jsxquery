      // should catch not only if child value is prop, but also if child is prop call.
      // EXCEPT THERE CAN BE UNLIMITED NESTING!! a prop call can be passed to a prop call, and a prop can be passed to that
      //     and all that can be passed to an action....

import expect from 'expect';
import PropCall from '../src/classes/PropCall';
import Prop from '../src/classes/Prop';
import Argument from '../src/classes/Argument'

describe('PropCall', () => {
  const mockParent = { mutableProps: [], callsFromHandler: [], displayName() { return 'MockParent'; } };
  const functionProp = new Prop(mockParent, 'myFunc', (a, b) => +a + +b, false);

  const fakeProp1 = { parent: '', initialName: '', value: '', wasLoaded: '', initialValue() { return 5; } };
  const fakeProp2 = { parent: '', initialName: '', value: '', wasLoaded: '', initialValue() { return 6; } };

    it('contains reference to Prop and given prop arguments in an array', () => {
      const propCall = functionProp(fakeProp1, fakeProp2, fakeProp2);
      expect(propCall.prop).toBe(functionProp);
    });

    it('contains array of Arguments as args', () => {
      const propCall = functionProp(fakeProp1, fakeProp2, fakeProp2);
      expect(propCall.args.every(arg => arg instanceof Argument)).toBe(true);
    });

  describe('initialValue', () => {
    it('returns the result of calling the prop function with static arguments', () => {
      expect(functionProp(2, 4).initialValue()).toEqual(6);
    });

    it('returns the result of calling the prop function with prop arguments', () => {
      expect(functionProp(fakeProp1, fakeProp2).initialValue()).toEqual(11);
    });
  });

  describe('isPropCall', () => {
    it('returns true for the result of calling a prop', () => {
      const propCallResult = functionProp(fakeProp1, fakeProp2);
      expect(PropCall.isPropCall(propCallResult)).toBe(true);
    });
  });

  describe('concernsProp', () => {
    const propCall = functionProp(fakeProp1, fakeProp1);
    it('returns true when passed prop within arguments', () => {
      expect(propCall.concernsProp(fakeProp1)).toBe(true);
    });

    it('returns false when passed prop not in arguments', () => {
      expect(propCall.concernsProp(fakeProp2)).toBe(false)
    });

    it('returns true when passed prop within sub-arguments', () => {
      const otherFunctionProp = new Prop(mockParent, 'otherFunc', (a, b) => +a - +b, false);
      const deepFunctionProp = functionProp(fakeProp1, otherFunctionProp(fakeProp2, fakeProp2));

      expect(deepFunctionProp.concernsProp(fakeProp2)).toBe(true);
    });
  });
});
