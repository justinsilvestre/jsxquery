import expect from 'expect';
import Prop from '../src/classes/Prop';
import Component from '../src/classes/Component';
import jsxQuery, { classNames, createElement } from '../src/jsxQuery';

describe('Prop', () => {
  const mockParent = { mutableProps: [], callsFromHandler: [] };

  const functionProp = new Prop(mockParent, 'myFunc', () => 'hi', false);
  const fakeProp1 = { ima: 'fakeProp' };
  const fakeProp2 = { imanother: 'fakeProp' };

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

  describe('valueSource()', () => {
    class ValueSourceTestComponent extends Component {
      static get defaultProps() {
        return {
          elementProp: 'prop in child position',
          attributeProp: 'prop in attribute value position',
          classNameProp: 'prop in className hash value position',
          ternaryTestProp: 'prop in ternary expression test condition position',
          absentProp: 'prop is not anywhere in render method',
          htmlProp: 'prop in innerHTML object',
          valueAttributeProp: 'prop in value attribute value position',
        };
      }

      static get actionNames() {
        return [
          'setElementProp',
          'setAttributeProp',
          'setClassNameProp',
          'setTernaryTestProp',
          'setHtmlProp',
          'setValueAttributeProp',
          'setAbsentProp',
        ];
      }

      render() {
        const { elementProp, attributeProp, classNameProp, ternaryTestProp, htmlProp, valueAttributeProp } = this.props;

        return (
          <div>
            <span id="first-span"
              some-attribute={attributeProp}
              className={classNames({ someClass: classNameProp })}
            >{elementProp}</span>
            <input id="input-field" value={valueAttributeProp}/>
            <span id="second-span" some-other-attribute={elementProp}></span>
            <div id="conditional-child">
              {ternaryTestProp
                ? <span id="consequent">consequent</span>
                : <span id="alternate">alternate</span> }
            </div>
            <span id="third-span" dangerouslySetInnerHTML={{ __html: htmlProp }} ></span>
          </div>
        );
      }
    }

    const component = <ValueSourceTestComponent />.component;
    const { elementProp, attributeProp, classNameProp, ternaryTestProp, absentProp, htmlProp, valueAttributeProp } = component.props;

    it('returns an element if its child is the first instance of the prop', () => {
      const sourceForElementProp = elementProp.valueSource();

      expect(sourceForElementProp.element.getAttribute('id').displayValue()).toEqual('first-span');
    });

    it('returns an attribute if its value is the first instance of the prop', () => {
      const sourceForAttributeProp = attributeProp.valueSource();

      expect(sourceForAttributeProp.argument).toEqual('some-attribute');
    });

    it('returns a className if its value in a dynamic className hash is the first instance of the prop', () => {
      const sourceForClassNameProp = classNameProp.valueSource();

      expect(sourceForClassNameProp.method).toEqual('hasClass');
      expect(sourceForClassNameProp.argument).toEqual('someClass');
    });

    it('returns an element if its innerHTML object contains the first instance of the prop', () => {
      const sourceForHtmlProp = htmlProp.valueSource();

      expect(sourceForHtmlProp.element.getAttribute('id').displayValue()).toEqual('third-span');
      expect(sourceForHtmlProp.method).toEqual('html');
    });

    it('returns a value attribute if its value is the first instance of the prop', () => {
      const sourceForValueAttributeProp = valueAttributeProp.valueSource();

      expect(sourceForValueAttributeProp.element.getAttribute('id').displayValue()).toEqual('input-field');
    });

    it('returns an element\s display value (Boolean) if it is the consequent in a ternary expression '
      + 'where test condition is the first instance of the prop???');

    it('returns the negation of an element\s display value if it is the alternate (with no consequent) '
      + 'in a ternary expression where test condition is the first instance of the prop???');

    // also for value??

    it('throws an error if the prop does not appear in component at all', () => {
      expect(absentProp.valueSource.bind(absentProp)).toThrow();
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

