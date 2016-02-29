import Prop from './Prop';
import PropCall from './PropCall';
import ConditionalValue from './ConditionalValue';
import Element from './Element';
import { escape } from 'lodash';

function markupFromValue(value, indents) {
  return Element.isElement(value)
    ? value.markup(indents)
    : escape((Prop.isProp(value) || PropCall.isPropCall(value)) ? value.initialValue() : value);
}

const isDynamicValue = val => Prop.isProp(val) || PropCall.isPropCall(val)
  || (ConditionalValue.isConditionalValue(val) && !val.isElement());

export default class Child {
  constructor(value, isRaw) {
    this._isArray = Array.isArray(value);
    if (this._isArray && !value.every(Element.isElement))
      throw new Error('When providing an array as Element child, each value in the array must be an Element');

    this._isConditional = ConditionalValue.isConditionalValue(value);
    if (this._isConditional){
      if (isDynamicValue(value.consequent || value.alternate))
        throw new Error('Dynamic content in result of conditional expression must be wrapped in an Element');
      const { consequent, alternate } = value;
      const optionIsPresent = o => o || typeof o === 'number';
      const presentOptions = [consequent, alternate].filter(optionIsPresent);
      if (presentOptions.length === 2
        && !([consequent, alternate].every(Element.isElement) || [consequent, alternate].every(o => !Element.isElement(o)))
       )
        throw new Error('The consequent and alternate in a dynamic conditional child must both be Elements or not Elements');

    }

    // if (this._isCondi)

    
    // if (this._isConditional && [consequent, alternate].filter(o=>o).every(Element.isElement))
    // ('The consequent and alternate in a dynamic conditional child must both be Elements or not Elements');

    this._isContainer = isDynamicValue(value);

    this.value = value;

    if (isRaw)
      this._isRaw = true;
  }

  isConditional() {
    return this._isConditional;
  }

  isContainer() {
    return this._isContainer;
  }

  isRaw() {
    return this._isRaw || false;
  }

  isArray() {
    return this._isArray;
  }

  renderRaw() {
    if (this.isContainer())
      return this.value.initialValue();

    return this.value;
  }

  render(indents) {
    if (this._isRaw)
      return this.renderRaw(indents);

    if (this.isArray())
      return this.value.map(e => e.markup(indents)).join('\n');

    if (this.isContainer()) {
      return this.isConditional() ? this.value.render(indents) : markupFromValue(this.value.initialValue(), indents);
    }

    if (this.isConditional())
      return this.value.render(indents);

    return markupFromValue(this.value, indents);
  }

  eachElement(callback) {
    if (Element.isElement(this.value))
      return this.value.each(callback);

    const { consequent, alternate } = this.value || {};
    Element.isElement(consequent) && consequent.each(callback);
    Element.isElement(alternate) && alternate.each(callback);
  }
}
