import { kebabCase, contains, isFunction } from 'lodash';
import EVENTS from '../supportedEvents';
import { cChoose } from '../jstlHelpers';
import Prop from './Prop';
import PropCall from './PropCall';
import ConditionalValue from './ConditionalValue';

const NAME_ALIAS_MAP = { className: 'class', htmlFor: 'for' };

function formatStyleName(camelCaseName) {
  const maybeHyphen = (/[A-Z]/).test(camelCaseName.charAt(0)) ? '-' : '';
  return maybeHyphen + kebabCase(camelCaseName);
}

function styleString(styleObj) {
  return Object.keys(styleObj).map(styleName =>
    formatStyleName(styleName) + `: ${styleObj[styleName]};`
  ).join(' ');
}

export default class Attribute {
  constructor(name, value) {
    this.name = name;
    this.value = value;
    this._isConditional = ConditionalValue.isConditionalValue(value);
    this._isContainer = Prop.isProp(value) || PropCall.isPropCall(value);

    if (this.isEventHandler() && !isFunction(this.value))
      throw new Error(`Your '${name} attribute needs a function value. Did you forget to wrap an action call in a function?`);
  }

  isConditional() {
    return this._isConditional;
  }

  isContainer() {
    return this._isContainer;
  }

  isEventHandler() {
    return this.name in EVENTS;
  }

  isClassNameObj() {
    return this.value && typeof this.value === 'object' && '_classNames_' in this.value;
  }

  isStyleObj() {
    return this.value && this.name === 'style' && typeof this.value === 'object';
  }

  notToBeRendered() {
    return this.value === false || this.isContainer() && this.value.initialValue() === false || this.isEventHandler();
  }

  classNamesHash() {
    if (this.name !== 'className')
      throw new Error('You are trying to get a classNamesHash from an attribute that is not className');

    if (this.isClassNameObj())
      return this.value._classNames_;

    // what if the alternate is not simply false?
    if (this.isConditional()) {
      return this.value.consequent.trim().split(/\s/).filter(cn => cn.length)
        .reduce((hash, cn) => Object.assign(hash, { [cn]: this.value.test }), {});
    }

    return (this.displayValue() || '')
          .trim().split(/\s/).filter(cn => cn.length)
          .reduce((hash, cn) => Object.assign(hash, { [cn]: true }), {});
  }

  displayName() {
    return NAME_ALIAS_MAP[this.name] || this.name;
  }

  displayValue() {
    if (this.isStyleObj())
      return styleString(this.value);

    if (this.isClassNameObj()) {
      const classObj = this.value._classNames_;
      return Object.keys(classObj).map(className => {
        const propOrCall = (Prop.isProp(classObj[className]) || PropCall.isPropCall(classObj[className]))
          ? classObj[className]
          : null;

        return propOrCall ?
          (propOrCall.wasLoaded()
            ? `$\{${propOrCall.initialValue()} ? '${className}' : ''}`
            : (propOrCall.initialValue() && className))
          : (classObj[className] && className);
      }).filter(c => c).join(' ');
    }

    if (this.isContainer()) 
      return this.value.initialValue();

    if (this.isConditional())
      return this.value.render(null);

    if (this.value === false)
      return '';

    return this.value;
  }

  render() {
    if (this.isConditional()) {
      const { test, consequent, alternate } = this.value;
      if (!Prop.isProp(test) && !PropCall.isPropCall(test))
        return new Attribute(this.name, test ? consequent : alternate);

      const propsWereLoaded = this.value.test.wasLoaded();

      if (!propsWereLoaded)
        return new Attribute(this.name, test.initialValue() ? consequent : alternate).render();

      if (propsWereLoaded) {
        const consequentDisplay = JSON.stringify(new Attribute(this.name, consequent).render().trim());
        const alternateDisplay = JSON.stringify(new Attribute(this.name, alternate).render().trim());

        return ` $\{${test.initialValue()} ? ${consequentDisplay} : ${alternateDisplay}}`;
      }
    } else {
      return this.notToBeRendered() ? '' :
        this.displayValue() === true ? ` ${this.displayName()}` : ` ${this.displayName()}="${this.displayValue()}"`;
    }
  }

  clone() {
    return new Attribute(this.name, this.value);
  }

  conditionallyHiddenStyleClone(test, hiddenIfTestTrue) {
    if (this.name !== 'style')
      throw new Error('You can only add a "display: none" rule to a style attribute');

    const hiddenStyles = this.isStyleObj()
      ? Object.assign({}, this.value, { display: 'none' })
      : this.value + '; display: none;';

    return new Attribute('style', new ConditionalValue(test,
            hiddenIfTestTrue ? hiddenStyles : this.value,
            hiddenIfTestTrue ? this.value : hiddenStyles
        ));
  }
}
