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

  jQuery(declaredProps, declaredPropCalls) {
    const { value } = this;

    if (value && typeof value.jQuery === 'function')
      return value.jQuery(declaredProps, declaredPropCalls);

    if (value && typeof value === 'object') {
      return '{ ' + transform(value, (result, val, key) => {
        result.push(JSON.stringify(key) + ':' + new Argument(val).jQuery(declaredProps, declaredPropCalls))
      }, []).join(', ') + ' }';
    }

    switch (typeof value) {
    case 'boolean':
      return value;
    case 'function':
      return value.toString()
    default:
      return JSON.stringify(value);
    }
  }

  boolean() {
    if (typeof this.value === 'boolean')
      return this;

    return Object.assign({}, this, { jQuery: () => `Boolean(${this.jQuery()})` });
  }
}
