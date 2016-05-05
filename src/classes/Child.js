import Prop from './Prop';
import PropCall from './PropCall';
import ConditionalValue from './ConditionalValue';
import Chainable from './Chainable';
import Element from './Element';
import { escape } from 'lodash';

function markupFromValue(value, indents) {
  if (Element.isElement(value))
    return value.markup(indents);

  if (Prop.isProp(value))
    return value.initialValue() 

  if (PropCall.isPropCall(value) || Prop.isProp(value))
    return escape(value.initialValue());

  return escape(value);

  return Element.isElement(value)
    ? value.markup(indents)
    : (Prop.isProp(value) || PropCall.isPropCall(value)) ? value.initialValue() : escape(value);
}

const isDynamicValue = val => Prop.isProp(val)
  || PropCall.isPropCall(val)
  || Chainable.isChainable(val)
  || (ConditionalValue.isConditionalValue(val) && !val.isElement());

export default class Child {
  constructor(value, isRaw) {
    this.value = value;

    if (this.arrayValue() && !this.arrayValue().every(Element.isElement))
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

  arrayValue() {
    if (Array.isArray(this.value))
      return this.value;

    if (Prop.isProp(this.value) && Array.isArray(this.value.transformed()))
      return this.value.transformed();
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

    if (this.arrayValue())
      return this.arrayValue().map(e => e.markup(indents)).join('\n');

    if (this.isConditional())
      return this.value.render(indents);

    if (this.isDynamicText()) {
      return markupFromValue(this.value.initialValue(), indents);
    }

    return markupFromValue(this.value, indents);
  }

  elementNodes() {
    if (this.arrayValue()) {
      return this.arrayValue().filter(Element.isElement).map(el => el.elementNodes()).reduce((a,b) => a.concat(b), [])
    }

    const { consequent, alternate } = this.value || {};
    return [
      Element.isElement(this.value) && this.value.elementNodes(),
      Element.isElement(consequent) && consequent.elementNodes(),
      Element.isElement(alternate) && alternate.elementNodes(),
    ].filter(e => e).reduce((a,b) => a.concat(b), []);
  }
}
