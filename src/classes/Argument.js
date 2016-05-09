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
    const actualArgument = PropCall.isPropCall(dependentDynamicValue) ? dependentDynamicValue : this.value;

    if (actualArgument && typeof actualArgument.jQuery === 'function')
      return actualArgument.jQuery(declaredProps, declaredPropCalls, dependentDynamicValue);

    if (actualArgument && typeof actualArgument === 'object') {
      return '{ ' + transform(actualArgument, (result, val, key) => {
        result.push(JSON.stringify(key) + ':' + new Argument(val).jQuery(declaredProps, declaredPropCalls, dependentDynamicValue))
      }, []).join(', ') + ' }';
    }

    switch (typeof actualArgument) {
    case 'boolean':
      return actualArgument;
    case 'function':
      return actualArgument.toString()
    default:
      return JSON.stringify(actualArgument);
    }
  }

  boolean() {
    if (typeof this.value === 'boolean')
      return this;

    return Object.assign({}, this, { jQuery: () => `Boolean(${this.jQuery()})` });
  }
}
