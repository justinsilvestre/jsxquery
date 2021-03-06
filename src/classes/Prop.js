import { contains, isFunction } from 'lodash';
import PropCall from './PropCall';
import Chainable from './Chainable';
import { createElement } from './Element';
import Proxy from 'harmony-proxy';
import PropValueSource from './PropValueSource';
function isValidComponent(val) {
  return 'mutableProps' in val; // maybe shoudl test from callsfromhandler?
}

export default class Prop {
  subpropSources() {
    var that = this;
    var subprops = [];
    const arg = new Proxy({}, {
      get(target, name) {
        const subprop = new Prop(that.parent, name, 'dummyValue', that.wasLoaded());
        subprops.push(subprop);

        return subprop;
      },
    });

    const el = this.transforms[0].callback(arg, 'key');

    return subprops.reduce((hash, subprop) => 
      Object.assign(hash, {
        [subprop.initialName]: new PropValueSource(el.elementNodes(), subprop),
      }), {});
  }

  constructor(parent, initialName, value, _wasLoaded = false) {
    if (Prop.isProp(value))
      return value;

    if(!isValidComponent(parent) || typeof initialName !== 'string' || typeof value === 'undefined')
      throw new Error('Prop constructor must take parent element, prop name (string), and prop value.');

    var functionProp = (...args) => {
      const propCall = new PropCall(functionProp, args);

      parent.callsFromHandler.push(propCall); // track calls to retrace steps in jQuery translation of handler

      const propCallArgs = args.filter(a => PropCall.isPropCall(a));
      propCallArgs.forEach(arg => {
        const argIndex = parent.callsFromHandler.lastIndexOf(arg);
        parent.callsFromHandler.splice(argIndex, 1);
      });

      return propCall;
    };

    var prop = isFunction(value) ? Object.setPrototypeOf(functionProp, Prop.prototype) : this;

    return Object.assign(prop, { parent, initialName, value, _wasLoaded });
  }

  static isProp(val) {
    return val
      && (typeof val === 'object' || typeof val === 'function')
      && typeof val.initialName === 'string';
  }

  isMutable() {
    const { parent, initialName } = this;
    return contains(parent.mutableProps, initialName);
  }

  wasLoaded() {
    return this._wasLoaded;
  }

  isArray() {
    return Array.isArray(this.value);
  }

  map(callback) {
    if (!this.wasLoaded() && !this.isArray())
      throw new Error(`You cannot map over your prop '${this.initialName}' as it is not an array.`);

    const { parent, initialName, value, _wasLoaded } = this;
    const transforms = (this.transforms || []).concat({
      type: 'map',
      callback,
      // extract: this.subpropSources(),
    });

    this.parent.templates.push(callback);
    const listPropWithTransform = Object.assign(new Prop(parent, initialName, value, _wasLoaded), { transforms });
    this.parent.extractionProcedures.push(this.subpropSources.bind(listPropWithTransform))
    return listPropWithTransform;
  }

  valueSource() {
    const sourceData = this.parent.propValuesWithSources().find(data => data && data.prop === this);
    if (!sourceData)
      throw new Error(`Your prop '${this.initialName}' must appear somewhere in the element returned by your component render() method`);

    const sourceElement = sourceData.element;
    if (!sourceElement) {
      throw new Error(
        `Your prop '${this.initialName}' must appear somewhere in the element returned by your component render() method`
      );
    }

    return sourceData;
  }

  concerns(value) {
    return (Prop.isProp(value) && value.initialName === this.initialName)
      || (PropCall.isPropCall(value) && value.concernsProp(this));
  }

// need to get value from presence/absence of element/class, or child content. (conditional stuff.)

  jQuery(declaredProps = []) {
    return this.valueSource().jQuery(declaredProps);
  }

  initialValue() {
    return this.value;
  }

  transformed() {
    if (!this.transforms)
      throw new Error(`Prop ${this.initialName} is not transformed in this place.`);

    if (!this.wasLoaded() || Array.isArray(this.value))
      return this.value.map(this.transforms[0].callback);

    const loopVar = this.initialName + 'Item';
    const varStatus = this.transforms[0].callback.length > 1 ? this.initialName + 'Index' : false;
    const content = this.transforms[0].callback(new Chainable(loopVar), new Chainable(varStatus).loop);
    return [createElement('c:forEach', { var: loopVar, items: this.value, varStatus }, content)];
      // <c:forEach var={loopVar} items={this.value} varStatus={varStatus}>
      //   {content}
      // </c:forEach>
  }

  propsAndPropCallsInvolved() {
    return [ this ];
  }

  varName() {
    return `${this.initialName}InitialVal`;
  }
}
