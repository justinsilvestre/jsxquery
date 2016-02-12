import { bindActionCreators } from 'redux';

export function bindAll(functionsHash, componentWithDispatchProp) {
  const { dispatch } = componentWithDispatchProp.props;
  return bindActionCreators(functionsHash, dispatch);
}

export function set(obj, newValues) {
  return Object.assign(obj.constructor(), obj, newValues);
}

export function push(arr, newValue) {
  var newArr = arr.concat();
  arr.push(newValue);
  return newArr;
}
