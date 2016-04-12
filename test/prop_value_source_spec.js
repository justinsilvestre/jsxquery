import expect from 'expect';
import Component from '../src/classes/Component';
import jsxQuery, { classNames, createElement } from '../src/jsxQuery';

describe('Prop.prototype.valueSource()', () => {
  class ValueSourceTestComponent extends Component {
    static get defaultProps() {
      return {
        elementProp: 'prop in child position',
        attributeProp: 'prop in attribute value position',
        classNameProp: 'prop in className hash value position',
        conditionalElementProp: 'prop in conditional element position',
        conditionalElementNoConsequentProp: 'prop in conditional element position, no consequent',
        conditionalTextProp: 'prop in conditional text position',
        conditionalAttributeProp: 'prop in conditional attribute position',
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
        'setConditionalElementProp',
        'setConditionalElementNoConsequentProp',
        'setConditionalTextProp',
        'setConditionalAttributeProp',
        'setHtmlProp',
        'setValueAttributeProp',
        'setAbsentProp',
      ];
    }

    render() {
      const {
        elementProp,
        attributeProp,
        classNameProp,
        conditionalElementProp,
        conditionalElementNoConsequentProp,
        conditionalTextProp,
        conditionalAttributeProp,
        htmlProp,
        valueAttributeProp } = this.props;

      return (
        <div>
          <span id="first-span"
            some-attribute={attributeProp}
            className={classNames({ someClass: classNameProp })}
          >{elementProp}</span>
          <input id="input-field" value={valueAttributeProp}/>
          <span id="second-span" some-other-attribute={elementProp}></span>
          <div id="conditional-child">
            {conditionalElementProp
              ? <span id="consequent">consequent</span>
              : <span id="alternate">alternate</span> }
          </div>
          <div id="conditional-child-without-consequent">
            {conditionalElementNoConsequentProp
              ? null
              : <span id="lone-alternate">alternate</span> }
          </div>
          <div id="conditional-text-child">
            {conditionalTextProp ? null : 'boop!'}
          </div>
          <span id="third-span"
                conditional-attribute={conditionalAttributeProp ? 'boop' : 'scoop'}
                dangerouslySetInnerHTML={{ __html: htmlProp }} ></span>
        </div>
      );
    }
  }

  const component = <ValueSourceTestComponent />.component;
  const { elementProp,
          attributeProp,
          classNameProp,
          conditionalElementProp,
          conditionalElementNoConsequentProp,
          conditionalTextProp,
          conditionalAttributeProp,
          absentProp,
          htmlProp,
          valueAttributeProp } = component.props;

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

  describe('when test condition is the first instance of the prop', () => {
    it('returns visibility state of consequent element in conditional value', () => {
      const sourceForConditionalElementProp = conditionalElementProp.valueSource();

      expect(sourceForConditionalElementProp.element.getAttribute('id').displayValue()).toEqual('consequent');
      expect(sourceForConditionalElementProp.method).toEqual('is');
      expect(sourceForConditionalElementProp.argument).toEqual(':visible');
    });

    it('returns hidden state of alternate element if consequent is absent', () => {
      const sourceForConditionalElementNoConsequentProp = conditionalElementNoConsequentProp.valueSource();

      expect(
        sourceForConditionalElementNoConsequentProp.element.getAttribute('id').displayValue()
        ).toEqual('lone-alternate');
      expect(sourceForConditionalElementNoConsequentProp.method).toEqual('is');
      expect(sourceForConditionalElementNoConsequentProp.argument).toEqual(':hidden');
    });

    it('checks conditional text against potential value', () => {
      const sourceForConditionalTextProp = conditionalTextProp.valueSource();

      expect(sourceForConditionalTextProp.element.getAttribute('id').displayValue()).toEqual('conditional-text-child');
      expect(sourceForConditionalTextProp.method).toEqual('text');
      expect(sourceForConditionalTextProp.argument).toNotExist();
      expect(sourceForConditionalTextProp.equalityCheck.trim()).toEqual('!== "boop!"');
    });

    it('checks conditional attribute against potential value', () => {
      const propSource = conditionalAttributeProp.valueSource();
      expect(propSource.equalityCheck.trim()).toEqual('=== "boop"');
    });
  });

  it('throws an error if the prop does not appear in component at all', () => {
    expect(absentProp.valueSource.bind(absentProp)).toThrow();
  });
});