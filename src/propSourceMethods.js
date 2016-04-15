import { findKey, values } from 'lodash';
import Element from './classes/Element';
import ConditionalValue from './classes/ConditionalValue';

const dependsOnProp = (val, prop) => val === prop || ConditionalValue.isConditionalValue(val) && val.test === prop;
const containerChildAsProp = (el, prop) => el.children.find(c => c.isContainer() && dependsOnProp(c.value, prop));
const attributeAsProp = (el, prop) => values(el.attributes).find(a => dependsOnProp(a.value, prop));
const dynamicClassFromProp = (el, prop) => findKey(el.classNamesHash(), c => dependsOnProp(c, prop));
const childWithTestConditionProp = (el, prop) =>
  el.children.find(c => c.isConditional() && c.value.test === prop);

function equalityCheckAgainst(val) {
  if (ConditionalValue.isConditionalValue(val)) {
    const { consequent, alternate } = val;
    return consequent
      ? ' === ' + JSON.stringify(consequent)
      : ' !== ' + JSON.stringify(alternate);
  }
  return '';
}

export default {
  textChild(element, prop) {
    const child = containerChildAsProp(element, prop);
    return child && {
      element,
      method: child.isRaw() ? 'html' : 'text',
      equalityCheck: equalityCheckAgainst(child.value),
    };
  },

  attribute(element, prop) {
    const attribute = attributeAsProp(element, prop);

    return attribute && {
      element,
      method: attribute.jQueryMethod(),
      argument: attribute.name === 'value' ? undefined : attribute.displayName(),
      equalityCheck: equalityCheckAgainst(attribute.value),
    };
  },

  className(element, prop) {
    const className = dynamicClassFromProp(element, prop);
    return className && {
      element,
      method: 'hasClass',
      argument: className,
    };
  },

  conditionalElementChild(element, prop) {
    const conditionalElementChild = childWithTestConditionProp(element, prop) || { value: {} };
    const { consequent, alternate } = conditionalElementChild.value;
    return Element.isElement(consequent || alternate) && {
      element: consequent || alternate,
      method: 'is',
      argument: consequent ? ':visible' : ':hidden',
    };
  },
};
