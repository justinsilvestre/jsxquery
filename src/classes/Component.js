// two components of the same class in an element means ids must be changed

// CUSTOM ATTRIBUTES SHOULD HAVE A DATA PREFIX. OTHERWISE ONLY ACCEPT NORMAL OR ARIA- ATTRIBUTES.

// static get defaultProps should fall back on getDefaultProps() for ES5/createClass
// static get actionNames should fall back on getActionsNames()

import { uniq, isFunction, values } from 'lodash';
import * as EVENTS from '../supportedEvents';
import Prop from './Prop';
import Actions from './Actions';
import reduxActionsTemplate from '../reduxTemplates/actions';
import reduxSetupTemplate from '../reduxTemplates/setup';
import Event from './Event';
import JQueryEventHandler from './JQueryEventHandler';
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
    this.templates = [];
    this.extractionProcedures = [];
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
    const propMethodsChunk = `var propMethods = {\n\t` + Object.keys(propMethodStrings).map(propMethodName => {
      return '\t' + propMethodName + ': ' + propMethodStrings[propMethodName].replace('\n', '\t');
      //
      // THIS IS SLOPPY. ANY NEWLINES IN A TEMPLATE STRING WILL BE COUNTED AS WELL.
      //
      //
    }).join(',\n') + '\n};'
    + '\nObject.assign(module.exports, { propMethods: propMethods });\n';

    const templateMethodStrings = this.templates.map(t => t.toString()).join(',\n');
    const templateMethodsChunk = `var templates = [${templateMethodStrings}].map((fn) => (...args) => fn(...args).render());\n\n`;

    const objsWithSubpropsAndSourceProcedures = this.extractionProcedures.map(fn => fn());
    const ex = objsWithSubpropsAndSourceProcedures.map(obj => '(el) => \({ ' +
      Object.keys(obj).map(subpropName => `get ${subpropName}() { return ` + obj[subpropName].scopedJQuery('el') + '; }'
    ).join(', ') + ' })');
    const extractDataFromTemplateChunk = `var extractDataFromTemplate = [${ex}];`;

    const eventListeners = this.eventListeners().map(eventListener => {
      const { eventName, targetId, handler } = eventListener;
      this.callsFromHandler = [];
      handler(new Event(this.callsFromHandler));
      const calledActionsAndProps = this.callsFromHandler.concat();

      calledActionsAndProps.filter(Actions.isActionCall).forEach(actionCall => {
        const { actionType, mutatedProp } = actionCall;
        if (!mutatedProp)
          throw new Error(`A '${actionType}' action was defined for a prop '${mutatedProp.initialName}' that doesn't exist.`);
      });

      return new JQueryEventHandler(eventName, targetId, calledActionsAndProps);
    });

    return [propMethodsChunk, templateMethodsChunk, extractDataFromTemplateChunk, ...eventListeners.map(e=> e.render())].join('\n\n');
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
    const props = uniq(this.constructor.actionNames.map(name => {
      return this.actions[name][1]
    }));
    // this.element().getIdBecause('returned by render()');
    return props;
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
      this._actions = new Actions(this.constructor.actionNames, () => this.callsFromHandler, this.props);
    return this._actions;
  }

  namespaceName() {
    return this.constructor.name;
  }
}

export function createClass(extensions) {
  class NewComponent extends Component {}
  Object.assign(NewComponent.prototype, extensions);
  if (extensions.getDefaultProps)
    Object.defineProperty(NewComponent, 'defaultProps', { get: extensions.getDefaultProps });
  if (extensions.getActionNames)
    Object.defineProperty(NewComponent, 'actionNames', { get: extensions.getActionNames });
  return NewComponent;
}
