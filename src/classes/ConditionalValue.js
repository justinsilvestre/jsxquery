import Prop from './Prop';
import PropCall from './PropCall';
import Attribute from './Attribute';
import Element from './Element';
import { escape } from 'lodash';
import { cChoose } from '../jstlHelpers';

function markupFromValue(value, indents) {
  return Element.isElement(value)
    ? value.markup(indents)
    : escape((Prop.isProp(value) || PropCall.isPropCall(value)) ? value.initialValue() : value);
}

export default class ConditionalValue {
  static isConditionalValue(value) {
    return value && typeof value === 'object'
      && ['test', 'consequent', 'alternate'].every(prop => prop in value);
  }

  constructor(test, consequent, alternate) {
    Object.assign(this, { test, consequent, alternate });
  }

  isElement() {
    return Element.isElement(this.consequent || this.alternate);
  }

  render(indents) {
    const { test, consequent, alternate } = this;
    if (!Prop.isProp(test) && !PropCall.isPropCall(test))
      return markupFromValue(test ? consequent : alternate);

    if (!Element.isElement(consequent || alternate)) // we are not dealing with Elements.
      return markupFromValue(test.initialValue() ? consequent : alternate);

    const propWasLoaded = test.wasLoaded();
    const propIsMutable = test.isMutable();



    if (!propWasLoaded && !propIsMutable)
      return (test.initialValue() ? consequent : alternate).markup(indents);

    if (propWasLoaded && !propIsMutable)
      return cChoose(test.initialValue(), consequent, alternate).markup(indents);

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
