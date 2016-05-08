import PropCall from './classes/PropCall';
import pickBy from 'lodash.pickby';
import Element from './classes/Element';
import Argument from './classes/Argument';

// data- attributes?
export default {
  classNames({ mutatedProp, args, actionType }, element) {
    const relevantClassNames = pickBy(element.classNamesHash(), v => mutatedProp.concerns(v));
    const toggleCriterion = args[0] && args[0].value;
    const method = typeof toggleCriterion === 'boolean'
      ? (toggleCriterion ? 'addClass' : 'removeClass')
      : 'toggleClass';
    const secondArg = method === 'toggleClass' && toggleCriterion
      ? args[0].boolean()
      : [];

    return Object.keys(relevantClassNames).reduce((arr, name) =>
      arr.concat({
        elementId: element.getIdForProp(mutatedProp.initialName, `dynamic class '${name}'`),
        method,
        dynamicValue: relevantClassNames[name],
        args: [new Argument(name)].concat(secondArg),
      }), []);
  },

  textChildren({ mutatedProp, args }, element) {
    const dynamicTextChildren = element.children.filter(c =>
      c.isDynamicText() && !c.arrayValue() && mutatedProp.concerns(c.value)
    );

    return dynamicTextChildren.map(c => ({
      elementId: element.getIdForProp(mutatedProp.initialName, 'dynamic content'),
      method: c.isRaw() ? 'html' : 'text',
      dynamicValue: c.value,
      args: [args[0]],
    }));
  },

  // SHOULD USE TOGGLE WHEN LINKED TO PROP FUNCTION CALL
  conditionalDisplayChildren({ mutatedProp, args }, element) {
    const relevantConditionalChild = element.children.find(c =>
      c.isConditional() && mutatedProp.concerns(c.value.test)
    ) || { value: {} };
    const { test, consequent, alternate } = relevantConditionalChild.value;

    return [consequent, alternate].filter(o => Element.isElement(o)).map(el => ({
      elementId: el.getIdForProp(mutatedProp.initialName, 'display styles'),
      method: el === consequent ? 'show' : 'hide',
      dynamicValue: test,
      args: [args[0]],
    }));
  },

  conditionalTextChildren({ mutatedProp, args }, element) {
    const relevantConditionalChild = element.children.find(c =>
      c.isConditional()
        && !Element.isElement(c.value.consequent || c.value.alternate) && mutatedProp.concerns(c.value.test)
    );
    if (!relevantConditionalChild)
      return [];

    const { consequent, alternate } = relevantConditionalChild.value;
    return {
      elementId: element.getIdForProp(mutatedProp.initialName, 'conditional text'),
      method: relevantConditionalChild.isRaw() ? 'html' : 'text',
      args: [new Argument(args[0].value ? consequent : alternate)],
      dynamicValue: test,
    };
  },

  valueAttributes({ mutatedProp, args }, element, targetId) {
    const valueAttribute = element.getAttribute('value');

    const v = valueAttribute
      && mutatedProp.concerns(valueAttribute.value)
      && {
        elementId: element.getIdForProp(mutatedProp.initialName, 'value attribute'),
        method: 'val',
        dynamicValue: valueAttribute.value,
        args: [args[0]],
      };
    return v && v.elementId !== targetId ? v : [];
  },

  attributes({ mutatedProp, args }, element) {
    const relevantDynamicAttributes = element.attributes.filter(a => a.name !== 'value' && mutatedProp.concerns(a.value));

    return relevantDynamicAttributes.reduce((arr, attribute) =>
      arr.concat({
        elementId: element.getIdForProp(mutatedProp.initialName, 'dynamic attribute'),
        method: attribute.jQueryMethod(),
        dynamicValue: attribute.value,
        args: [new Argument(attribute.name), args[0]],
      })
    , []);
  },

  mappedLists({ mutatedProp, args, actionType }, element) {
    var result = [];
    const mappedList = element.children.find(c =>
      c.isDynamicText() && mutatedProp.concerns(c.value) && 'transforms' in c.value
    ); // maybe dynamicText is a bad name?
    if (!mappedList || !mappedList.value.transforms.find(t => t.type === 'map'))
      return result;

    if (actionType === 'filter') {
      result.push({
        elementId: element.getIdForProp(mutatedProp.initialName, 'list'),
        method: 'filter',
        transformIndex: mappedList.value.parent.templates.indexOf(mappedList.value.transforms[0].callback),
        filter: args[0],
      });
    }

    // if (mappedList.value.transforms.find(t => t.type === 'map'))
    if (actionType === 'add') {
      result.push({
        elementId: element.getIdForProp(mutatedProp.initialName, 'list'),
        method: 'append',
        transformIndex: mappedList.value.parent.templates.indexOf(mappedList.value.transforms[0].callback),
        newValue: args[0].jQuery(),
        // dynamicValue: args[0],
        args: [args[0]],
      });
    }
      //$(listContainerElement).children().each(child => child.toggle(child.hasClass('complete')))

  // maybe element keeps track if prop was mapped + map function
  // maybe prop accumulates appearances and map function
  // do something different here depending on map, filter, sort, whatever
    // return {
    //   elementId: element.getIdForProp(mutatedProp.initialName, 'list'),
    //   method: 'append',
    //   newValue: mutatedProp.jQuery() + '(' + args[1].jQuery() + ')'
    // };
    return result;
  },
};
