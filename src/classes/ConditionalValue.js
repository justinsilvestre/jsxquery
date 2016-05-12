import Prop from './Prop';
import PropCall from './PropCall';
import Attribute from './Attribute';
import Element from './Element';
import { escape, identity } from 'lodash';
import { cChoose } from '../jstlHelpers';

function markupFromValue(value, indents, raw) {
  const escapeOrNot = raw ? identity : escape;
  return Element.isElement(value)
    ? value.markup(indents)
    : escapeOrNot((Prop.isProp(value) || PropCall.isPropCall(value)) ? value.initialValue() : value);
}

export default class ConditionalValue {
  static isConditionalValue(value) {
    return value && typeof value === 'object'
      && ['test', 'consequent', 'alternate'].every(prop => prop in value)
      && !value.chain;
  }

  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }

  isElement() {
    return Element.isElement(this.consequent || this.alternate);
  }

  jQuery() {
    const { test, consequent, alternate } = this;
    return test.jQuery() + ' ? ' + JSON.stringify(consequent) + ' : ' + JSON.stringify(alternate);
  }

  render(indents, raw) {
    const { test, consequent, alternate } = this;
    if (!Prop.isProp(test) && !PropCall.isPropCall(test))
      return markupFromValue(test ? consequent : alternate, 0, raw);

    // if (!Element.isElement(consequent || alternate)) // we are not dealing with Elements.
    //   return markupFromValue(test.initialValue() ? consequent : alternate, 0, raw);

    const propWasLoaded = test.wasLoaded();
    const propIsMutable = test.isMutable();

    if (!propIsMutable && typeof test.value === 'boolean')
      return markupFromValue(test.value ? consequent : alternate, 0, raw);

    if (!propWasLoaded && !propIsMutable)
      return markupFromValue(test.initialValue() ? consequent : alternate, indents, raw);

    if (propWasLoaded && !propIsMutable)
      return markupFromValue(cChoose(test.initialValue(), consequent, alternate, raw), indents, true);

    const maybeHiddenOption = (option, hiddenIfTestTrue = false) => {
      const newElement = option.clone();
      const styleAttribute = newElement.getAttribute('style');
      const attrs = newElement.attributes;

      if (styleAttribute) {
        attrs[attrs.indexOf(styleAttribute)] = styleAttribute.conditionallyHiddenStyleClone(test, hiddenIfTestTrue);
      } else {
        attrs.push(new Attribute('style',
            new ConditionalValue(
              test,
              hiddenIfTestTrue ? { display: 'none' } : false,
              hiddenIfTestTrue ? false : { display: 'none' }
          )
        ));
      }

      return newElement;
    };

    if ((propWasLoaded || !propWasLoaded) && propIsMutable) {
      return [
        consequent && maybeHiddenOption(consequent).markup(indents),
        alternate && maybeHiddenOption(alternate, true).markup(indents),
      ].filter(el => el).join('');
    }

  }
}
