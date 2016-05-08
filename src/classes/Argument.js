import Prop from './Prop';
import PropCall from './PropCall';
import Event from './Event';
import pickBy from 'lodash.pickby';
import { transform } from 'lodash';
import Element from './Element';

export default class Argument {
  constructor(value) {
    Object.assign(this, { value });
  }

  initialValue() {
    const { value } = this;

    if (PropCall.isPropCall(value) || Prop.isProp(value))
      return value.initialValue();

    return value;
  }

  jQuery(declaredProps, declaredPropCalls, dependentDynamicValue) {
    const actionArg = this.value;
    if (PropCall.isPropCall(dependentDynamicValue))
      return dependentDynamicValue.jQuery(declaredProps, declaredPropCalls, dependentDynamicValue);
      // return dependentDynamicValue.prop.initialName;

    if (PropCall.isPropCall(actionArg))
      return actionArg.jQuery(declaredProps, declaredPropCalls, dependentDynamicValue);
      // return actionArg.prop.initialName;

    if (Event.isEvent(actionArg)
        || Prop.isProp(actionArg))
        // || PropCall.isPropCall(actionArg))
      return actionArg.jQuery();

    if (actionArg && typeof actionArg === 'object') {
      return '{ ' + transform(actionArg, (result, val, key) => {
        result.push(JSON.stringify(key) + ':' + new Argument(val).jQuery(declaredProps, declaredPropCalls, dependentDynamicValue))
      }, []).join(', ') + ' }';
    }

    switch (typeof actionArg) {
    case 'boolean':
      return actionArg;
    case 'function':
      return actionArg.toString()
    default:
      return JSON.stringify(actionArg);
    }
  }

  boolean() {
    if (typeof this.value === 'boolean')
      return this;

    return Object.assign({}, this, { jQuery: () => `Boolean(${this.jQuery()})` });
  }
}
