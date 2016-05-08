import flatMap from 'lodash.flatmap';
import { uniq, contains } from 'lodash';
import stateChangeEffects from '../stateChangeEffects';
import Prop from './Prop';
import PropCall from './PropCall';
import Argument from './Argument';

function dynamicValuesNeedingDeclarations(domActions) {
  // first, take out aLL PRPOS And ALL PROP CALLS from dynamicValue and args
  const allArgsAndDynamicValues = domActions.reduce((arr, call) => {
    const argValuesInCall = (call.args || []).map(arg => arg.value) || [];
    const dynamicValueInCall = call.dynamicValue || [];
    return [...argValuesInCall, ...dynamicValueInCall];
  }, []);
  const propsAndPropCalls =
    flatMap(allArgsAndDynamicValues.filter(val => Prop.isProp(val) || PropCall.isPropCall(val)),
      p => p.propsAndPropCallsInvolved());

  const count = (arr, predicate) => arr.reduce((n, val) => n + predicate(val), 0);

  return uniq(propsAndPropCalls, propsAndPropCalls.filter(p1 => 1 < count(propsAndPropCalls, p2 => p1 === p2)));
}

export default class ActionCall {
  constructor(actionType, mutatedProp, args) {
    Object.assign(this, { actionType, mutatedProp, args: args.map(arg => new Argument(arg)) });
  }

  jQuery(targetId) {
    const { mutatedProp } = this;
    const callsData = this.domActions(targetId);
    // where initial state needs taken into account
    const allDeclaredValues = dynamicValuesNeedingDeclarations(callsData);
    const propDeclarations = allDeclaredValues.filter(Prop.isProp);
    const propCallDeclarations = allDeclaredValues.filter(PropCall.isPropCall);

    return [
      ...propDeclarations.map(p => `var ${mutatedProp.varName()} = ${p.jQuery()};`),
      ...propCallDeclarations.map(pC => `var ${pC.varName()} = ${pC.jQuery(propDeclarations)};`),
      ...this.domActions(targetId).map((effectData) => {
        const { elementId, method, dynamicValue } = effectData;
        // const args = (effectData.args || []).map(arg => arg.jQuery(propDeclarations, propCallDeclarations, dynamicValue))
        // const joinedArgs = args ? args.join(', ') : '';

        switch (method) {
        case 'text':
        case 'html':
        case 'val':
        case 'addClass':
        case 'removeClass':
          return `$(${elementId}).${method}(${effectData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue)});`;

        case 'attr':
        case 'prop':
          return `$(${elementId}).${method}(${effectData.args[0].jQuery(propDeclarations, propCallDeclarations)}, ${effectData.args[1].jQuery(propDeclarations, propCallDeclarations, dynamicValue)});`;

        case 'toggleClass':
          const toggleCriterion = effectData.args[1] ? `, ${effectData.args[1].jQuery(propDeclarations, propCallDeclarations, dynamicValue)}` : '';
          return `$(${elementId}).${method}(${effectData.args[0].jQuery(propDeclarations, propCallDeclarations)}${toggleCriterion});`;

        case 'show':
          return typeof effectData.args[0].value === 'boolean'
            ? `$(${elementId}).${effectData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue) ? 'show' : 'hide'}();`
            : `$(${elementId}).toggle(${effectData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue)});`;

        case 'hide':
          return typeof effectData.args[0].value === 'boolean'
            ? `$(${elementId}).${effectData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue) ? 'hide' : 'show'}();`
            : `$(${elementId}).toggle(!(${effectData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue)}));`;

        case 'append':
          return `$(${elementId}).append(templates[${effectData.transformIndex}](${effectData.newValue}));`;

        case 'filter':
          return `var itemIsVisible = ${effectData.filter.jQuery(propDeclarations, propCallDeclarations, dynamicValue)};\n`
          + `\t$(${elementId}).children().each((i, el) => $(el).toggle(itemIsVisible(extractDataFromTemplate[${effectData.transformIndex}](el))));\n`;
        }
      }),
    ];
  }

  domActions(targetId) {
    const { mutatedProp } = this;
    const element = mutatedProp.parent.element();

    return flatMap(element.elementNodes(), el =>
      flatMap(Object.keys(stateChangeEffects), method =>
        stateChangeEffects[method](this, el, targetId)
      )
    );
  }
}