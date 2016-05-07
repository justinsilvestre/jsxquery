import Prop from './classes/Prop';
import PropCall from './classes/PropCall';
import Event from './classes/Event';
import pickBy from 'lodash.pickby';
import { transform } from 'lodash';
import Element from './classes/Element';

// SO ACTUALLY FIRST
// before doing state changes
// we clone the state

function jQueryArgumentFrom(actionArg, dependentValue) {
  if (PropCall.isPropCall(dependentValue))
    return dependentValue.jQueryCall();
    // return dependentValue.prop.initialName;

  if (PropCall.isPropCall(actionArg))
    return actionArg.jQueryCall();
    // return actionArg.prop.initialName;

  if (Event.isEvent(actionArg)
      || Prop.isProp(actionArg))
      // || PropCall.isPropCall(actionArg))
    return actionArg.jQuery();

  if (actionArg && typeof actionArg === 'object')
    return '{ ' + transform(actionArg, (result, val, key) => {
      result.push(JSON.stringify(key) + ':' + jQueryArgumentFrom(val))
    }, []).join(', ') + ' }';

  return typeof actionArg === 'boolean' ? actionArg : JSON.stringify(actionArg);
}

// data- attributes?
export default {
  classNames(element, targetId, mutatedProp, args, actionType) {
    const toggleCriterion = actionType === 'toggle'
      ? (void 0)
      : jQueryArgumentFrom(args[0]);
    const secondArg = typeof toggleCriterion === 'undefined' || typeof toggleCriterion === 'boolean'
      ? toggleCriterion
      : `Bool(${toggleCriterion})`;
    const relevantClassNamesHash = pickBy(element.classNamesHash(), v => (console.log(mutatedProp), mutatedProp.concerns(v)));

    return Object.keys(relevantClassNamesHash).reduce((arr, name) =>
      arr.concat({
        elementId: element.getIdForProp(mutatedProp.initialName, `dynamic class '${name}'`),
        method: 'toggleClass',
        toggleCriterion,
        dynamicValue: relevantClassNamesHash[name],
        args: [`'${name}'`, secondArg].filter(v => typeof v !== 'undefined')
      }), []);
  },

  textChildren(element, targetId, mutatedProp, args, actionType) {
    return element.children.filter(c => c.isDynamicText() && !c.arrayValue() && mutatedProp.concerns(c.value)).map(c => ({
      elementId: element.getIdForProp(mutatedProp.initialName, 'dynamic content'),
      method: c.isRaw() ? 'html' : 'text',
      dynamicValue: c.value,
      args: [jQueryArgumentFrom(args[0], c.value)]
    }));
  },

  // SHOULD USE TOGGLE WHEN LINKED TO PROP FUNCTION CALL
  conditionalDisplayChildren(element, targetId, mutatedProp, args, actionType) {
    const relevantConditionalChild = element.children.find(c => c.isConditional() && mutatedProp.concerns(c.value.test));
    const { test, consequent, alternate } = (relevantConditionalChild || { value: {} }).value;

    return [consequent, alternate].filter(o => Element.isElement(o)).map(el => ({
      elementId: el.getIdForProp(mutatedProp.initialName, 'display styles'),
      method: el === consequent ? 'show' : 'hide',
      dynamicValue: test,
      args: [PropCall.isPropCall(test) ? test.jQuery()
        : (typeof args[0] === 'boolean' ? args[0] : jQueryArgumentFrom(args[0]))],
    }));
  },

  conditionalTextChildren(element, targetId, mutatedProp, args, actionType) {
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
      dynamicValue: test,
      args: [test.jQuery() + ' ? ' + jQueryArgumentFrom(consequent) + ' : ' + jQueryArgumentFrom(alternate)]
    };
  },

  valueAttributes(element, targetId, mutatedProp, args, actionType) {
    const valueAttribute = element.getAttribute('value');

    const v = valueAttribute
      && mutatedProp.concerns(valueAttribute.value)
      && {
        elementId: element.getIdForProp(mutatedProp.initialName, 'value attribute'),
        method: 'val',
        dynamicValue: valueAttribute.value,
        args: [jQueryArgumentFrom(args[0], valueAttribute.value)]
      };
    return v && v.elementId !== targetId ? v : [];
    //////////////////////////////// BUT NOW ELEMENTID CAN BE A CLASS.
  },

  attributes(element, targetId, mutatedProp, args, actionType) {
    const relevantDynamicAttributes = element.attributes.filter(a => a.name !== 'value' && mutatedProp.concerns(a.value));

    return relevantDynamicAttributes.reduce((arr, attribute) =>
      arr.concat({
        elementId: element.getIdForProp(mutatedProp.initialName, 'dynamic attribute'),
        method: attribute.jQueryMethod(),
        dynamicValue: attribute.value,
        args: ["'" + attribute.name + "'", jQueryArgumentFrom(args[0], attribute.value)]
        // newValue: PropCall.isPropCall(attribute.value)
        //   ? attribute.value.jQuery()
        //   : (typeof args[0] !== 'boolean' && jQueryArgumentFrom(args[0])),
      })
    , []);
  },

  mappedLists(element, targetId, mutatedProp, args, actionType) {
    var result = [];
    const relevant = element.children.find(c => c.isDynamicText() && mutatedProp.concerns(c.value) && 'transforms' in c.value); // maybe dynamicText is a bad name?
    if (!relevant || !relevant.value.transforms.find(t => t.type === 'map'))
      return result;
    if (actionType === 'filter') {
      result.push({
        elementId: element.getIdForProp(mutatedProp.initialName, 'list'),
        method: 'filter',
        transformIndex: relevant.value.parent.templates.indexOf(relevant.value.transforms[0].callback),
        filter: args[0].toString(),
      });
    }

    // if (relevant.value.transforms.find(t => t.type === 'map'))
    if (actionType === 'add') {
      result.push({
        elementId: element.getIdForProp(mutatedProp.initialName, 'list'),
        method: 'append',
        transformIndex: relevant.value.parent.templates.indexOf(relevant.value.transforms[0].callback),
        newValue: jQueryArgumentFrom(args[0]),
        args: [jQueryArgumentFrom(args[0])],

      });
    }
      //$(listContainerElement).children().each(child => child.toggle(child.hasClass('complete')))

  // maybe element keeps track if prop was mapped + map function
  // maybe prop accumulates appearances and map function
  // do something different here depending on map, filter, sort, whatever
    // return {
    //   elementId: element.getIdForProp(mutatedProp.initialName, 'list'),
    //   method: 'append',
    //   newValue: mutatedProp.jQuery() + '(' + jQueryArgumentFrom(args[1]) + ')'
    // };
    return result;
  },
};
