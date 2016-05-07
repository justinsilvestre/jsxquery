import Prop from './Prop';
import Event from './Event';
import flatMap from 'lodash.flatmap';


function jQueryArgumentFrom(actionArg, dependentValue) {
  if (PropCall.isPropCall(dependentValue))
    return dependentValue.prop.initialName;

  if (PropCall.isPropCall(actionArg))
    return actionArg.prop.initialName;

  if (Event.isEvent(actionArg)
      || Prop.isProp(actionArg))
      // || PropCall.isPropCall(actionArg))
    return actionArg.jQuery();

  if (actionArg && typeof actionArg === 'object')
    return '{ ' + transform(actionArg, (result, val, key) => {
      result.push(JSON.stringify(key) + ':' + jQueryArgumentFrom(val))
    }, []).join(', ') + ' }';

  return typeof actionArg === 'boolean' ? actionArg : JSON.stringify(actionArg);
}

export default class PropCall {
  constructor(functionProp, args) {
    this.prop = functionProp;
    this.args = args;
  }

  jQuery() {
    return `var ${this.prop.initialName} = ` + this.jQueryCall();
    return this.prop.initialName;
  }

  jQueryCall() {
    const { prop, args } = this;
    return 'propMethods[' + JSON.stringify(prop.initialName) + '](' + args.map(jQueryArgumentFrom).join(', ') + ')';
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
    return val
      && typeof val === 'object'
      && Prop.isProp(val.prop);
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

  propsInvolved() {
    return flatMap(this.args, v => v.propsInvolved());
  }
}
