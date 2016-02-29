import expect from 'expect';
import Attribute from '../src/classes/Attribute';
import Prop from '../src/classes/Prop';
import { classNames } from '../src/jsxQuery';

describe('Attribute', () => {
  const stringAttribute = new Attribute('href', 'http://google.com');
  const conditionalAttribute = new Attribute('hidden', {
    test: new Prop({ mutableProps: [] }, 'thing', true, true),
    consequent: true,
    alternate: false,
  });

  function conditionalAttributeTemplate(differentProperties) {
    const defaultProperties = {
      test: new Prop({mutableProps: ['thing']}, 'thing', true, true),
      consequent: 'http://google.com',
      alternate: 'http://bing.com',
    };
    return new Attribute('href', Object.assign(defaultProperties, differentProperties));
  }

  it('throws an error if event handler attribute does not have a function value');

  describe('isConditional()', () => {
    it('returns false for an attribute created with a string value', () => {
      expect(stringAttribute.isConditional()).toBe(false);
    });

    it('returns true for an attribute created with an ternary object', () => {
      expect(conditionalAttribute.isConditional()).toBe(true);
    });
  });

  describe('isEventHandler', () => {
    it('returns true for attributes with function values', () => {
      const functionAttribute = new Attribute('onClick', () => console.log('hello!'));

      expect(functionAttribute.isEventHandler()).toBe(true);
    });

    it('returns false for attributes without function values', () => {
      expect(new Attribute('id', 'potatoes').isEventHandler()).toBe(false);
    });
  });

  describe('render()', () => {
    it('returns formatted attribute for a text value', () => {
      expect(stringAttribute.render()).toEqual(' href="http://google.com"');
    });

    it('returns valueless attribute for a true Boolean value', () => {
      const trueAttribute = new Attribute('hidden', true);

      expect(trueAttribute.render()).toEqual(' ' + trueAttribute.name);
    });

    it('returns empty string for a false Boolean value', () => {
      const falseAttribute = new Attribute('hidden', false);

      expect(falseAttribute.render()).toEqual('');
    });

    it('renders style string from styles object', () => {
      const styleAttribute = new Attribute('style', { display: 'block', lineHeight: 1 });

      expect(styleAttribute.render()).toEqual(' style="display: block; line-height: 1;"');
    });

    it('replaces camel-case style names with kebab-case', () => {
      const styleAttribute = new Attribute('style', { backgroundColor: 'blue' });

      expect(styleAttribute.render()).toEqual(' style="background-color: blue;"');
    });

    it('replaces capitalized style names with vendor-prefixed style', () => {
      const styleAttribute = new Attribute('style', { WebkitTransform: 'rotate(7deg)' });

      expect(styleAttribute.render()).toEqual(' style="-webkit-transform: rotate(7deg);"');
    });

    it('returns an empty string for event handlers', () => {
      const eventHandlerAttribute = new Attribute('onClick', () => console.log('clicked!'));

      expect(eventHandlerAttribute.render()).toEqual('');
    });

    it('returns an empty string for dangerouslySetInnerHTML', () => {
      const innerHTMLAttribute = new Attribute('dangerouslySetInnerHTML', { __html: '&amp;lifi!!' });

      expect(innerHTMLAttribute.render()).toEqual('')
    })

    it('renders an attribute with name "className" as "class"', () => {
      const classNameAttribute = new Attribute('className', 'thingy');

      expect(classNameAttribute.render()).toContain('class=');
    });

    it('returns a string for a plain string className value', () => {
      const simpleClassNameAttribute = new Attribute('className', 'thingy');

      expect(simpleClassNameAttribute.render()).toEqual(' class="thingy"');
    });

    it('returns a space-separated list of class names for a className object value', () => {
      const compositeClassNameAttribute = new Attribute('className', classNames({ thingy: true, otherThingy: true, notThisThingy: false }));

      expect(compositeClassNameAttribute.render()).toEqual(' class="thingy otherThingy"');
    });

    it('omits class names set to false and not linked to component\'s loaded props', () => {
      const compositeClassNameAttribute = new Attribute('className',
        classNames({ thingy: true, otherThingy: true, dontShow: false }));

      expect(compositeClassNameAttribute.render()).toNotContain('dontShow');
    });

    it('wraps class names linked to component\'s loaded props in JSTL logic', () => {
      const conditionalClassNameAttribute = new Attribute('className',
        classNames({ thingy: true, otherThingy: new Prop({ mutableProps: [] }, 'thisIsAPropName', false, true) }));

      expect(conditionalClassNameAttribute.render()).toEqual(' class="thingy ${false ? \'otherThingy\' : \'\'}"');
    });

    it('wraps attribute in JSTL logic if it is conditional');

    it('evaluates prop values as booleans when linked to classNames', () => {
      const thingy = new Prop({ mutableProps: [] }, 'thisIsAPropName', 'thisIsAPropValue', false); // these were not loaded
      const otherThingy = new Prop({ mutableProps: [] }, 'thisIsAPropName', true, false);
      const notThisThingy = new Prop({ mutableProps: [] }, 'thisIsAPropName', 0, false);
      const norThisThingy = new Prop({ mutableProps: [] }, 'thisIsAPropName', false, false);

      const propClasses = new Attribute('className', classNames({ thingy, otherThingy, notThisThingy, norThisThingy }));

      expect(propClasses.render()).toEqual(' class="thingy otherThingy"')
    })

    it('returns prop value if it is a container', () => {
      const containerAttribute = new Attribute('thisIsFromComponentsLoadedProps', new Prop({ mutableProps: [] }, 'thisIsAPropName', 'thisIsAPropValue', true));

      expect(containerAttribute.render()).toEqual(' thisIsFromComponentsLoadedProps="thisIsAPropValue"');
    });
  });
});
