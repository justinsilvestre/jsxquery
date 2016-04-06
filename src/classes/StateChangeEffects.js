import Prop from './Prop';
import PropCall from './PropCall';
import Event from './Event';
import pickBy from 'lodash.pickby';
import Element from './Element';

export function jQueryArgumentFrom(arg) {
  if (Event.isEvent(arg)
      || Prop.isProp(arg)
      || PropCall.isPropCall(arg))
    return arg.toJQueryCode();

  return typeof arg === 'boolean' ? arg : JSON.stringify(arg);
}

export default class StateChangeEffects {
  constructor(element, targetId, mutatedProp, args, actionType) {
    Object.assign(this, {
      element,
      targetId,
      mutatedProp,
      args,
      actionType,
      all: [],
    });

    this.populateDependencyArrays();
  }

  populateDependencyArrays() {
    this.element.each(e => {
      this.all = [].concat.call(this.all, this.extractDynamicClassNamesFrom(e),
      this.extractDynamicTextChildrenFrom(e),
      this.extractConditionalDisplayChildrenFrom(e),
      this.extractConditionalTextChildrenFrom(e),
      this.extractDynamicValChildrenFrom(e),
      this.extractDynamicAttributesFrom(e)
      );
      // data-?
      // conditional attr too?
    });
  }

  extractDynamicClassNamesFrom(e) {
    const toggleCriterion = this.actionType === 'toggle' ? ''
      : jQueryArgumentFrom(this.args[0]);
    const { mutatedProp } = this;
    const relevantClassNamesHash = pickBy(e.classNamesHash(), v => mutatedProp.concerns(v));

    return Object.keys(relevantClassNamesHash).reduce((arr, name) =>
      arr.concat({
        elementId: e.getIdForProp(mutatedProp.initialName, `dynamic class '${name}'`),
        method: 'toggleClass',
        className: name,
        toggleCriterion,
      }), []);
  }

  extractDynamicTextChildrenFrom(e) {
    const { mutatedProp } = this;

    return e.children.filter(c => c.isContainer() && mutatedProp.concerns(c.value)).map(c => ({
      elementId: e.getIdForProp(mutatedProp.initialName, 'dynamic content'),
      method: c.isRaw() ? 'html' : 'text',
      // newValue: jQueryArgumentFrom(c.value),
      newValue: PropCall.isPropCall(c.value)
          ? c.value.toJQueryCode()
          : jQueryArgumentFrom(this.args[0]),
    }));
  }

// SHOULD USE TOGGLE WHEN LINKED TO PROP FUNCTION CALL
  extractConditionalDisplayChildrenFrom(e) {
    const { mutatedProp } = this;
    const relevantConditionalChild = e.children.find(c => c.isConditional() && mutatedProp.concerns(c.value.test));
    const { test, consequent, alternate } = (relevantConditionalChild || { value: {} }).value;

    return [consequent, alternate].filter(o => Element.isElement(o)).map(e => ({
      elementId: e.getIdForProp(mutatedProp.initialName, 'display styles'),
      method: e === consequent ? 'show' : 'hide',
      toggleCriterion: PropCall.isPropCall(test) ? test.toJQueryCode()
        : (typeof this.args[0] === 'boolean' ? this.args[0] : jQueryArgumentFrom(this.args[0])),
    }));
  }

  extractConditionalTextChildrenFrom(e) {
    const { mutatedProp } = this;
    const relevantConditionalChild = e.children.find(c =>
      c.isConditional()
        && !Element.isElement(c.value.consequent || c.value.alternate) && mutatedProp.concerns(c.value.test)
    );
    if (!relevantConditionalChild)
      return [];

    const { test, consequent, alternate } = relevantConditionalChild.value;
    return {
      elementId: e.getIdForProp(mutatedProp.initialName, 'conditional text'),
      method: relevantConditionalChild.isRaw() ? 'html' : 'text',
      newValue: test.toJQueryCode() + ' ? ' + jQueryArgumentFrom(consequent) + ' : ' + jQueryArgumentFrom(alternate),
    };
  }

  extractDynamicValChildrenFrom(e) {
    const { mutatedProp } = this;
    const valueAttribute = e.getAttribute('value');

    const v = valueAttribute
      && mutatedProp.concerns(valueAttribute.value) 
      && {
        elementId: e.getIdForProp(mutatedProp.initialName, 'value attribute'),
        method: 'val',
        newValue: PropCall.isPropCall(valueAttribute.value)
          ? valueAttribute.value.toJQueryCode()
          : jQueryArgumentFrom(this.args[0]),
      };
    return v && v.elementId !== this.targetId ? v : [];
  }

  extractDynamicAttributesFrom(e) {
    const { mutatedProp } = this;
    const relevantDynamicAttributes = e.attributes.filter(a => a.name !== 'value' && mutatedProp.concerns(a.value));

    return relevantDynamicAttributes.reduce((arr, attribute) =>
      arr.concat({
        elementId: e.getIdForProp(mutatedProp.initialName, 'dynamic attribute'),
        method: 'attr',
        // newValue: jQueryArgumentFrom(args[0]),
        attributeName: attribute.name,
        newValue: PropCall.isPropCall(attribute.value)
          ? attribute.value.toJQueryCode()
          : (typeof this.args[0] !== 'boolean' && jQueryArgumentFrom(this.args[0])),
      })
    , []);
  }
}
