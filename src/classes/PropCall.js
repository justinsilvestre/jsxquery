import Prop from './Prop';
import Event from './Event';
import Argument from './Argument';
import flatMap from 'lodash.flatmap';

export default class PropCall {
  constructor(functionProp, args) {
    this.prop = functionProp;
    // this.args = args;
    this.args = args.map(arg => new Argument(arg));
  }

  varName() {
    return this.prop.initialName;
  }

  jQuery(declaredProps = [], declaredPropCalls = []) {
    if (declaredPropCalls.includes(this))
      return this.varName();

    return this.jQueryCall(declaredProps, declaredPropCalls);
  }

  jQueryCall(declaredProps, declaredPropCalls) {
    const { prop, args } = this;
    return 'propMethods[' + JSON.stringify(prop.initialName) + ']('
      + args.map(arg => arg.jQuery(declaredProps, declaredPropCalls)).join(', ')
      + ')';
  }

  initialValue() {
    return this.prop.value(...this.args.map(arg => arg.initialValue()));
    return this.prop.value(...this.args.map(arg =>
      (Prop.isProp(arg) || PropCall.isPropCall(arg))
        ? arg.initialValue()
        : arg
      )
    );
  }
        // here should maybe throw an error if you try to access .value as for a Prop

  static isPropCall(val) {
    return val
      && typeof val === 'object'
      && Prop.isProp(val.prop);
  }

  concernsProp(prop) {
    return this.args.map(arg => arg.value).some(arg => {
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

  propsAndPropCallsInvolved() {
    return [this, ...flatMap(this.args, v => v.value.propsAndPropCallsInvolved())];
  }
}
