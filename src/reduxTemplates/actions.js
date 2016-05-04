import { snakeCase } from 'lodash';

const actionNameString = actionName => snakeCase(actionName).toUpperCase();
function newValueForAction(actionType, mutatedProp) {
  switch (actionType) {
  case 'toggle':
    return `!state.${mutatedProp}`;
  case 'start':
  case 'show':
    return `true`;
  case 'hide':
  case 'end':
    return `false`;
  case 'set':
    return `action.payload`;
  case 'add':
    return `state.${mutatedProp}.concat(action.payload)`
  }
}
function payload(actionType, mutatedProp) {
  return '    payload,\n';
}
function actionCreatorFunction([actionName, actionType, mutatedProp]) {
  // return `export function ${actionName}(payload) {\n`
    return `${actionName}(payload) {\n`
    + `  return {\n    type: '${actionNameString(actionName)}',\n`
    + payload(actionType, mutatedProp) + `\n  };\n}\n`
    + ',';
}
function reducerCase([actionName, actionType, mutatedProp]) {
  return `  case '${actionNameString(actionName)}':
    return set(state, { ${mutatedProp}: ${newValueForAction(actionType, mutatedProp)} });\n`;
}
const pre = `\nconst { bindActionCreators } = Redux;`
  + `\n\nfunction set(obj, newValues) {
  return Object.assign(obj.constructor(), obj, newValues);
}\n\n`;

export default function reduxActionsTemplate(actions) {
  const fullActionData = Object.keys(actions).reduce((arr, actionName) => {
    const actionType = actions[actionName][0];
    const mutatedProp = actions[actionName][1];
    const arraylet = [actionName, actionType, mutatedProp]
    return arr.concat([arraylet]);
  }, []);
  return [pre,
    `export function updateComponent(state, action) {
  console.log(action);
  switch (action.type) {\n`,
    fullActionData.map(reducerCase).join(''),
    '  default:\n    return state;\n  }\n}\n\n',
    'export const actionsHash = {\n',
    fullActionData.map(actionCreatorFunction).join('\n'),
    '};\n'
  ].join('') + '\n';
}

