import PropCall from './PropCall';
import ACTIONS from '../supportedActions';
import ActionCall from './ActionCall';

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

function mutatedPropNameFrom(actionType, restOfActionName) {
  const { prefix, suffix } = propAffixes(actionType);
  return [prefix, restOfActionName, suffix].filter(s=>s).join('');
}

function actionData(actionName) {
  const actionMatch = actionName.match(`(${ACTIONS.join('|')})([A-Z].+)`);

  if (actionMatch) {
    const actionType = actionMatch[1];
    const mutatedPropName = mutatedPropNameFrom(actionType, actionMatch[2]);
    const lowerCaseState = mutatedPropName.charAt(0).toLowerCase() + mutatedPropName.slice(1);
    return ([actionType, lowerCaseState]);
  }
  return null;
}

export default class Actions {
  constructor(actionNames, getComponentTracker, parentProps) {
    getTracker = getComponentTracker;

    actionNames.forEach(actionName => {
      const data = actionData(actionName);
      if (!data)
        throw new Error(`'${actionName}' is not a valid action name`);

      if (this[actionName])
        throw new Error(`You have already entered an action named ${actionName}`);

      const [actionType, mutatedPropName] = data;
      this[actionName] = this.create(actionType, parentProps[mutatedPropName]);
      Object.assign(this[actionName], data);
    });
  }

  create(actionType, mutatedProp) {
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

      const actionCall = new ActionCall(actionType, mutatedProp, practicalArgs);

      getTracker().push(actionCall);
      return actionCall;
    };
  }

  static isActionCall(value) {
    return value
      && typeof value === 'object'
      && ['actionType', 'mutatedProp'].every(p => p in value);
  }
}
