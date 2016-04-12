// two components of the same class in an element means ids must be changed

// IF TERNARY TEST CONDITION IS NOT A PROP/PROPFUNCTION CALL THEN WE JUST RENDER THAT CHILD/ATTR WITH THE RESULT.

// CUSTOM ATTRIBUTES SHOULD HAVE A DATA PREFIX. OTHERWISE ONLY ACCEPT NORMAL OR ARIA- ATTRIBUTES.

// static get defaultProps should fall back on getDefaultProps() for ES5/createClass
// static get actionNames should fall back on getActionsNames()

// CLASSNAMESHASH SHOULD TAKE INTO ACCOUNT CONDIDTIONAL CLASSNAME ATTR

import { uniq, isFunction, values, contains } from 'lodash';
import * as EVENTS from '../supportedEvents';
import Prop from './Prop';
import Actions from './Actions';
import StateChangeEffects from './StateChangeEffects';
import reduxActionsTemplate from '../reduxTemplates/actions';
import reduxSetupTemplate from '../reduxTemplates/setup';
import Event from './Event';
import jQueryCall from '../jQueryCall';
import PropValueSource from './PropValueSource';

export default class Component {
  constructor(loadedState) {
    const safeLoadedState = loadedState || {};
    const that = this;
    const propsFromObj = (obj, wasLoaded = false) => {
      return Object.keys(obj).reduce((builtProps, rawPropName) =>
        Object.assign(builtProps, {
          [rawPropName]: new Prop(that, rawPropName, obj[rawPropName], wasLoaded),
        })
      , {});
    };

    this.props = Object.assign(
      propsFromObj(this.constructor.defaultProps),
      propsFromObj(safeLoadedState, true)
    );
    this.loadedProps = Object.keys(safeLoadedState);

    this.callsFromHandler = [];
  }

  static get defaultProps() {
    return {};
  }

  static get actionNames() {
    return [];
  }

  element() {
    this.el = this.el || this.render();
    return this.el;
  }

  jQuery() {
    const propMethodStrings = this.propMethodStrings();
    const propMethodsChunk = `var ${this.namespaceName()} = {\n\t` + Object.keys(propMethodStrings).map(propMethodName => {
      return '\t' + propMethodName + ': ' + propMethodStrings[propMethodName].replace('\n', '\t');
      //
      // THIS IS SLOPPY. ANY NEWLINES IN A TEMPLATE STRING WILL BE COUNTED AS WELL.
      //
      //
    }).join(',\n') + '\n};';

    const jQueryChange = (actionCall, targetId) => {
      const { actionType, mutatedProp: mutatedPropName, args } = actionCall;
      const mutatedProp = this.props[mutatedPropName];
      if (!mutatedProp)
        throw new Error(`A '${actionType}' action was defined for a prop '${mutatedPropName}' that doesn't exist.`);
      return jQueryCall((new StateChangeEffects(this.element(), targetId, mutatedProp, args, actionType)).all);
    };

    const eventListeners = this.eventListeners().map(eventListener => {
      const { eventName, targetId, handler } = eventListener;
      this.callsFromHandler = [];
      handler(new Event(this.callsFromHandler));
      // should have called actions AND called props.
      // if a prop is passed to an action, jquery-pass in the value taken from the appropriate DOM node.
      // if another value is passed to an action, save its value and stringify it, and jquery-pass that.
      const calledActionsAndProps = this.callsFromHandler.concat();
      return `$('#${targetId}').on('${EVENTS[eventName]}', function() {`
        + '\n\t'
        + calledActionsAndProps.map(call => {
          return Actions.isActionCall(call)
          ? jQueryChange(call, targetId)
          : call.toJQueryCode();
        }).join('\n  ')
        + '\n});';
    });

    return [propMethodsChunk, ...eventListeners].join('\n\n');
  }

  // these should be namespaced with component names. so then maybe we can just toString the methods
  // and concatenate them between a pair of brackets for an object literal.
  /// or maybe we can even just make that object, and then stringify that?
  // we call that object something like myComponentMethods, and then we can call myComponentMethods.transform()
  // or whatever.
  propMethodStrings() {
    function prepareMethod(value) {
      const functionString = value.toString();
      const validFunctionString = (value.hasOwnProperty('prototype') || !value.name)
        ? functionString
        : 'function ' + functionString;
      return validFunctionString;
    }
    return values(this.props).filter(isFunction).reduce((hash, { initialName, value }) =>
      Object.assign(hash, { [initialName]: prepareMethod(value) })
    , {});
  }

  redux() {
    return {
      actions: reduxActionsTemplate(this.actions),
      setup: reduxSetupTemplate(Object.keys(this.props)),
    };
  }

  eventListeners() {
    return this.element().eventListeners();
  }

  get mutableProps() {
    return uniq(this.constructor.actionNames.map(name => this.actions[name][1]));
  }

  propValuesWithSources() {
    if (!this._propValuesWithSources) {
      this._propValuesWithSources = this.mutableProps.map(propName => {
        const prop = this.props[propName];
        const elements = this.element().elementNodes();
        return new PropValueSource(elements, prop);
      });
    }

    return this._propValuesWithSources;
  }

  get actions() {
    if (!this._actions)
      this._actions = new Actions(this.constructor.actionNames, () => this.callsFromHandler);
    return this._actions;
  }

  namespaceName() {
    return this.constructor.name;
  }
}

export function createClass(extensions) {
  class NewComponent extends Component {}
  return Object.assign(NewComponent.prototype, extensions);
}
