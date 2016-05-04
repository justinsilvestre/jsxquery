import Prop from './Prop';
import PropCall from './PropCall';
import ConditionalValue from './ConditionalValue';
import Chainable from './Chainable';
import Element from './Element';
import { escape } from 'lodash';

function markupFromValue(value, indents) {
  return Element.isElement(value)
    ? value.markup(indents)
    : escape((Prop.isProp(value) || PropCall.isPropCall(value)) ? value.initialValue() : value);
}

const isDynamicValue = val => Prop.isProp(val)
  || PropCall.isPropCall(val)
  || Chainable.isChainable(val)
  || (ConditionalValue.isConditionalValue(val) && !val.isElement());

export default class Child {
  constructor(value, isRaw) {
    this.value = value;

    if (this.val(Array.isArray) && !value.every(Element.isElement))
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

    this._isDynamicText = isDynamicValue(value);

    if (isRaw)
      this._isRaw = true;
  }

  val(fn) {
    return fn(this.value);
  }

  isConditional() {
    return this._isConditional;
  }

  isDynamicText() {
    return this._isDynamicText;
  }

  isRaw() {
    return this._isRaw || false;
  }

  renderRaw() {
    if (this.isDynamicText())
      return this.value.initialValue();

    return this.value;
  }

  render(indents) {
    if (this._isRaw)
      return this.renderRaw(indents);

    if (this.val(Array.isArray))
      return this.value.map(e => e.markup(indents)).join('\n');

    if (this.isConditional())
      return this.value.render(indents);

    if (this.isDynamicText()) {
      return markupFromValue(this.value.initialValue(), indents);
    }

    return markupFromValue(this.value, indents);
  }

  elementNodes() {
    const { consequent, alternate } = this.value || {};
    return [
      Element.isElement(this.value) && this.value.elementNodes(),
      Element.isElement(consequent) && consequent.elementNodes(),
      Element.isElement(alternate) && alternate.elementNodes(),
    ].filter(e => e).reduce((a,b) => a.concat(b), []);
  }
}
