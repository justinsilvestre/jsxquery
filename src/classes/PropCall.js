import Prop from './Prop';
import { jQueryArgumentFrom } from './StateChangeEffects';

export default class PropCall {
  constructor(functionProp, args) {
    this.prop = functionProp;
    this.args = args;
  }

  toJQueryCode() {
    const { prop, args } = this;
    const namespaceName = this.prop.parent.namespaceName();

    return namespaceName + '.' + prop.initialName + '(' + args.map(jQueryArgumentFrom).join(', ') + ')';
  }

  initialValue() {
    return this.prop.value(...this.args.map(arg =>
      (Prop.isProp(arg) || PropCall.isPropCall(arg))
        ? arg.initialValue()
        : arg
      )
    );
  }
        // here should maybe throw an error if you try to access .value as for a Prop

  static isPropCall(val) {
    return (val &&
      typeof val === 'object'
      && ['prop', 'args'].every(p => p in val));
      // && Array.isArray(val.args))
      // && isFunction(val.prop);
  }

  concernsProp(prop) {
    return this.args.some(arg => {
      return (arg === prop)
        || (PropCall.isPropCall(arg) && arg.concernsProp(prop));
    });
  }

  isMutable() {
    return true;
  }

  wasLoaded() {
    return this.args.some(arg => (Prop.isProp(arg) || PropCall.isPropCall(arg)) && arg.wasLoaded());
  }
}
