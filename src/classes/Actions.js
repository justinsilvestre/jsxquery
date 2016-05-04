import { contains } from 'lodash';
import Prop from './Prop';
import PropCall from './PropCall'
import ACTIONS from '../supportedActions';

var getTracker;

function propAffixes(actionType) {
  switch (actionType) {
  case 'show':
  case 'hide':
    return { suffix: 'Showing' };
  case 'add':
    return { suffix: 'List' };
  default:
    return {};
  }
}

function mutatedPropFrom(actionType, restOfActionName) {
  const { prefix, suffix } = propAffixes(actionType);
  return [prefix, restOfActionName, suffix].filter(s=>s).join('');
}

function actionData(actionName) {
  const actionMatch = actionName.match(`(${ACTIONS.join('|')})([A-Z].+)`);

  if (actionMatch) {
    const actionType = actionMatch[1];
    const mutatedProp = mutatedPropFrom(actionType, actionMatch[2]);
    const lowerCaseState = mutatedProp.charAt(0).toLowerCase() + mutatedProp.slice(1);
    return ([actionType, lowerCaseState]);
  }
  return null;
}

export default class Actions {
  constructor(actionNames, getComponentTracker) {
    getTracker = getComponentTracker;

    actionNames.forEach(actionName => {
      const data = actionData(actionName);
      if (!data)
        throw new Error(`'${actionName}' is not a valid action name`);

      if (this[actionName])
        throw new Error(`You have already entered an action named ${actionName}`);

      this[actionName] = this.create(data);
      Object.assign(this[actionName], data);
    });
  }

  create([actionType, mutatedProp]) {
    return (...args) => {
      const propCallArgs = args.filter(a => PropCall.isPropCall(a));
      propCallArgs.forEach(arg => {
        const argIndex = getTracker().lastIndexOf(arg);
        // getTracker().splice(argIndex, 1);
      });

      var practicalArgs = [].concat.call(args);
      if (actionType === 'start' || actionType === 'show')
        practicalArgs.push(true);
      if (actionType === 'end' || actionType === 'hide')
        practicalArgs.push(false);

      const actionCall = {
        actionType,
        mutatedProp,
        args: practicalArgs,
      }

      getTracker().push(actionCall)
      return actionCall;
    };
  }

  static isActionCall(value) {
    return value
      && typeof value === 'object'
      && ['actionType', 'mutatedProp'].every(p => p in value);
  }
}
