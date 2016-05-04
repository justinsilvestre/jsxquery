import { contains, isFunction } from 'lodash';
import PropCall from './PropCall';
import Chainable from './Chainable';
import { createElement } from './Element';
const jsxQuery = { createElement };

function isValidComponent(val) {
  return 'mutableProps' in val; // maybe shoudl test from callsfromhandler?
}

export default class Prop {
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
        // parent.callsFromHandler.splice(argIndex, 1);
      });

      return propCall;
    };
    var prop = isFunction(value) ? functionProp : this;

    Object.assign(prop, {
      parent,
      initialName,
      value,
      _wasLoaded,
      isMutable: Prop.prototype.isMutable, // should this be bound?
      wasLoaded: Prop.prototype.wasLoaded,
      map: Prop.prototype.map,
      isArray: Prop.prototype.isArray,
    });

    return prop;
  }

  static isProp(val) {
    return val
      && (typeof val === 'object' || typeof val === 'function')
      && ['parent', 'initialName', 'value', 'wasLoaded'].every(p => p in val);
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
    });
    return Object.assign(new Prop(parent, initialName, value, _wasLoaded), { transforms });
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
    return value === this
      || (PropCall.isPropCall(value) && value.concernsProp(this));
  }


// need to get value from presence/absence of element/class, or child content. (conditional stuff.)

  toJQueryCode() {
    const { element, method, argument, equalityCheck } = this.valueSource();
    const elementId = element.getAttribute('id').displayValue();
    const argumentString = typeof argument !== 'undefined' ? JSON.stringify(argument) : '';
    return `$('#${elementId}').${method}(${argumentString})${equalityCheck || ''}`;
  }

  initialValue() {
    if (this.transforms) {
      if (this.wasLoaded()) {
        const loopVar = this.initialName + 'Item';
        const varStatus = this.transforms[0].callback.length > 1 ? this.initialName + 'Index' : false;
        const content = this.transforms[0].callback(new Chainable(loopVar), new Chainable(varStatus).loop);
        return (
          <c:forEach var={loopVar} items={this.value} varStatus={varStatus}>
            {content}
          </c:forEach>
        );
      } else {
        return this.value.map(this.transforms[0].callback)
      }
    }
    return this.value;
  }
}
