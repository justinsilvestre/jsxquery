import flatMap from 'lodash.flatMap';
import Prop from './classes/Prop';
import PropCall from './classes/PropCall';
import Event from './classes/Event';
import pickBy from 'lodash.pickby';
import Element from './classes/Element';

export function jQueryArgumentFrom(arg) {
  if (Event.isEvent(arg)
      || Prop.isProp(arg)
      || PropCall.isPropCall(arg))
    return arg.toJQueryCode();

  if (arg && typeof arg === 'object')
    return arg;

  return typeof arg === 'boolean' ? arg : JSON.stringify(arg);
}

// data- attributes?

function extractDynamicClassNamesFrom(element, targetId, mutatedProp, args, actionType) {
  const toggleCriterion = actionType === 'toggle' ? ''
    : jQueryArgumentFrom(args[0]);
  const relevantClassNamesHash = pickBy(element.classNamesHash(), v => mutatedProp.concerns(v));

  return Object.keys(relevantClassNamesHash).reduce((arr, name) =>
    arr.concat({
      elementId: element.getIdForProp(mutatedProp.initialName, `dynamic class '${name}'`),
      method: 'toggleClass',
      className: name,
      toggleCriterion,
    }), []);
}

function extractDynamicTextChildrenFrom(element, targetId, mutatedProp, args, actionType) {
  return element.children.filter(c => c.isContainer() && mutatedProp.concerns(c.value)).map(c => ({
    elementId: element.getIdForProp(mutatedProp.initialName, 'dynamic content'),
    method: c.isRaw() ? 'html' : 'text',
    // newValue: jQueryArgumentFrom(c.value),
    newValue: PropCall.isPropCall(c.value)
        ? c.value.toJQueryCode()
        : jQueryArgumentFrom(args[0]),
  }));
}

// SHOULD USE TOGGLE WHEN LINKED TO PROP FUNCTION CALL
function extractConditionalDisplayChildrenFrom(element, targetId, mutatedProp, args, actionType) {
  const relevantConditionalChild = element.children.find(c => c.isConditional() && mutatedProp.concerns(c.value.test));
  const { test, consequent, alternate } = (relevantConditionalChild || { value: {} }).value;

  return [consequent, alternate].filter(o => Element.isElement(o)).map(el => ({
    elementId: el.getIdForProp(mutatedProp.initialName, 'display styles'),
    method: el === consequent ? 'show' : 'hide',
    toggleCriterion: PropCall.isPropCall(test) ? test.toJQueryCode()
      : (typeof args[0] === 'boolean' ? args[0] : jQueryArgumentFrom(args[0])),
  }));
}

function extractConditionalTextChildrenFrom(element, targetId, mutatedProp, args, actionType) {
  const relevantConditionalChild = element.children.find(c =>
    c.isConditional()
      && !Element.isElement(c.value.consequent || c.value.alternate) && mutatedProp.concerns(c.value.test)
  );
  if (!relevantConditionalChild)
    return [];

  const { test, consequent, alternate } = relevantConditionalChild.value;
  return {
    elementId: element.getIdForProp(mutatedProp.initialName, 'conditional text'),
    method: relevantConditionalChild.isRaw() ? 'html' : 'text',
    newValue: test.toJQueryCode() + ' ? ' + jQueryArgumentFrom(consequent) + ' : ' + jQueryArgumentFrom(alternate),
  };
}

function extractDynamicValChildrenFrom(element, targetId, mutatedProp, args, actionType) {
  const valueAttribute = element.getAttribute('value');

  const v = valueAttribute
    && mutatedProp.concerns(valueAttribute.value)
    && {
      elementId: element.getIdForProp(mutatedProp.initialName, 'value attribute'),
      method: 'val',
      newValue: PropCall.isPropCall(valueAttribute.value)
        ? valueAttribute.value.toJQueryCode()
        : jQueryArgumentFrom(args[0]),
    };
  return v && v.elementId !== targetId ? v : [];
}

function extractDynamicAttributesFrom(element, targetId, mutatedProp, args, actionType) {
  const relevantDynamicAttributes = element.attributes.filter(a => a.name !== 'value' && mutatedProp.concerns(a.value));

  return relevantDynamicAttributes.reduce((arr, attribute) =>
    arr.concat({
      elementId: element.getIdForProp(mutatedProp.initialName, 'dynamic attribute'),
      method: attribute.jQueryMethod(),
      attributeName: attribute.name,
      newValue: PropCall.isPropCall(attribute.value)
        ? attribute.value.toJQueryCode()
        : (typeof args[0] !== 'boolean' && jQueryArgumentFrom(args[0])),
    })
  , []);
}

// function extractDynamicListItemsFrom(element, targetId, mutatedProp, args, actionType) {
//   const relevant = element.children.find(c => c.isContainer() && c.value.isArray());
// // maybe element keeps track if prop was mapped + map function
// // maybe prop accumulates appearances and map function
//   return relevant ? {
//     elementId: element.getIdForProp(mutatedProp.initialName, 'list'),
//     method: 'append',
//     newValue: mutatedProp.
//   } : [];
// }

export default function stateChangeEffects(element, targetId, mutatedProp, args, actionType) {
  return flatMap(element.elementNodes(), el =>
    [].concat(
      extractDynamicClassNamesFrom(el, targetId, mutatedProp, args, actionType),
      extractDynamicTextChildrenFrom(el, targetId, mutatedProp, args, actionType),
      extractConditionalDisplayChildrenFrom(el, targetId, mutatedProp, args, actionType),
      extractConditionalTextChildrenFrom(el, targetId, mutatedProp, args, actionType),
      extractDynamicValChildrenFrom(el, targetId, mutatedProp, args, actionType),
      extractDynamicAttributesFrom(el, targetId, mutatedProp, args, actionType)
    )
  );
}
