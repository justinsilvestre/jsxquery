import { isEmpty, contains, isFunction, intersection } from 'lodash';
import flatMap from 'lodash.flatmap';
import Child from './Child';
import Attribute from './Attribute';
import EventListener from './EventListener';
import * as EVENTS from '../supportedEvents';
import { INLINE_ELEMENTS, VOID_ELEMENTS } from '../htmlElementData';
const EVENT_NAMES = Object.keys(EVENTS);

function buildComponent(ComponentConstructor, props) {
  var component;
  try {
    component = new ComponentConstructor(props);
  } catch (err) {
    if (!contains(err.message, 'is not a constructor'))
      throw err;
    component = { element: () => ComponentConstructor.call(null, props) };
  }

  // WE NEED TO PUT CHILDREN IN PROPS BEFORE HERE.

  return component;
}

export default class Element {
  static isElement(val) {
    return val
      && typeof val === 'object'
      && val._isElement_;
  }

  constructor(tagName, propsOrAttributes, ...children) {
    this._isElement_ = true;
    const ComponentConstructor = typeof tagName === 'string' ? null : tagName;
    if (ComponentConstructor) {
      if (!isFunction(ComponentConstructor))
        throw new Error('Your component must either be a function returning an Element or a Component class');
      this.component = buildComponent(ComponentConstructor, propsOrAttributes);
    }

    if (Element.isElement(this.component))
      return this.component;

    const element = this.component ? this.component.element() : this;

    this.tagName = element.tagName || tagName;

    const attributeNames = Object.keys(propsOrAttributes || {});
    this.attributes = element.attributes
      || attributeNames
        .filter(n => n !== 'dangerouslySetInnerHTML')
        .map(name => new Attribute(name, propsOrAttributes[name]));

    const HTMLAttribute = propsOrAttributes && propsOrAttributes.dangerouslySetInnerHTML;
    const rawTextChildValue = HTMLAttribute
      && typeof HTMLAttribute === 'object'
      && HTMLAttribute.__html;

    this.children = element.children
      || (rawTextChildValue && [new Child(rawTextChildValue, true)])
      || (isEmpty(children) ? [] : children.map(child => new Child(child)));

    const dynamicTextContentChild = this.children.some(child => child.isContainer());
    const idAttribute = this.getAttribute('id');
    if (dynamicTextContentChild && this.children.length > 1)
      throw new Error(`Your <${this.tagName}> element has dynamic text content not wrapped in its own element`);
    if (dynamicTextContentChild && !idAttribute)
      throw new Error(`Your <${this.tagName}> element with dynamic text content has no id attribute.`);
  }

  markup(indents = 0) {
    const { tagName } = this;
    const formattedAttributes = this.formattedAttributes();
    const childrenMarkup = this.childrenMarkup(indents === null ? null : indents + 1);
    const childrenAreShowing = this.childrenMarkup.length > 0;
    const lineBreak = indents === null || this.isInline() ? '' : '\n' + '\t'.repeat(indents);
    const innerIndent = indents !== null && childrenAreShowing && contains(childrenMarkup, '\n') ? '\t' : '';

    return lineBreak + (!this.isVoid() ?
        `<${tagName}${formattedAttributes}>${lineBreak + innerIndent + childrenMarkup + lineBreak}</${tagName}>`
        : `<${tagName}${formattedAttributes} />`) + lineBreak.repeat(2);
  }

  isInline() {
    return contains(INLINE_ELEMENTS, this.tagName);
  }

  isVoid() {
    return contains(VOID_ELEMENTS, this.tagName);
  }

  formattedAttributes() {
    return this.attributes ? this.attributes.map(attr => attr.render()).join('') : '';
  }

  hasDynamicInnerHTML() {
    return this.children.some(c => c.isContainer() && c.isRaw())
  }

  childrenMarkup(indents) {
    if (!this._childrenMarkup) {
      const { children } = this;
      this._childrenMarkup = children ? children.map(child => child.render(indents)).join('') : '';
    }
    return this._childrenMarkup;
  }

  clone() {
    const clonedAttributesObj = this.attributes && this.attributes.reduce((newObj, a) =>
      Object.assign(newObj, { [a.name]: a.value }), {});

    return new Element(
      this.tagName,
      clonedAttributesObj,
      ...this.children.map(child => child.value)
    );
  }

  classNamesHash() {
    const classNameAttribute = this.getAttribute('className');
    return classNameAttribute ? classNameAttribute.classNamesHash() : {};
  }

  each(enter) {
    this.elementNodes().forEach(node => enter(node))
  }

  elementNodes() {
    return [this, ...flatMap(this.children, childElement => childElement.elementNodes())];
  }

  getAttribute(attributeName) {
    return this.attributes.find(a => a.name === attributeName);
  }

  eventListeners() {
    this.getIdBecause('returned by render()');

    var listeners = [];
    this.each((element) => {
      const usedEventsNames = isEmpty(element.attributes)
        ? []
        : intersection(EVENT_NAMES, element.attributes.map(a => a.name));
      usedEventsNames.forEach(eventName => {
        const targetId = element.getIdBecause(`with listeners [${usedEventsNames.join(', ')}]`);
        const eventHandler = element.getAttribute(eventName).value;
        listeners.push(new EventListener(eventName, targetId, eventHandler.bind(this)));
      });
    });
    return listeners;
  }

  getIdBecause(qualityRequiringId) {
    const id = this.getAttribute('id');
    if (!id)
      throw new Error(`Your <${this.tagName}> element ${qualityRequiringId} needs a unique id attribute`);
    return id.displayValue();
  }

  getIdForProp(propName, domain) {
    return this.getIdBecause(`with ${domain} linked to prop ${propName}`);
  }
}

export function createElement(...args) {
  return new Element(...args);
}

