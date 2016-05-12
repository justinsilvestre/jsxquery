import flatMap from 'lodash.flatmap';
import { uniq } from 'lodash';
import stateChangeEffects from '../stateChangeEffects';
import Prop from './Prop';
import PropCall from './PropCall';
import Argument from './Argument';
import JQueryDomAction from './JQueryDomAction';

export default class ActionCall {
  constructor(actionType, mutatedProp, args) {
    Object.assign(this, { actionType, mutatedProp, args: args.map(arg => new Argument(arg)) });

    this.domActions = this.getDomActions();
    this.repeatedDynamicValues = this.getRepeatedDynamicValues();
    Object.assign(this, {
      propDeclarations: this.getPropDeclarations(),
      propCallDeclarations: this.getPropCallDeclarations(),
    });
  }

  jQuery(targetId) {
    const { mutatedProp, propDeclarations, propCallDeclarations, domActions } = this;

    return [
      ...propDeclarations.map(p => `${mutatedProp.varName()} = ${p.jQuery()};`),
      ...propCallDeclarations.map(pC => `${pC.varName()} = ${pC.jQuery(propDeclarations)};`),
      ...domActions.filter(actionData => actionData.method !== 'val' || actionData.elementId !== targetId)
        .map(actionData => JQueryDomAction(actionData, propDeclarations, propCallDeclarations)),
    ];
  }

  getDomActions() {
    const { mutatedProp } = this;
    const element = mutatedProp.parent.element();

    return flatMap(element.elementNodes(), el =>
      flatMap(Object.keys(stateChangeEffects), method =>
        stateChangeEffects[method](this, el)
      )
    );
  }

  getPropDeclarations() {
    return this.repeatedDynamicValues.filter(Prop.isProp);

  }

  getPropCallDeclarations() {
    return this.repeatedDynamicValues.filter(PropCall.isPropCall);
  }

  getRepeatedDynamicValues() {
    const allArgs = this.domActions.reduce((arr, call) => {
      const argValuesInCall = (call.args || []).map(arg => arg.value);
      return arr.concat([
        ...(argValuesInCall || []),
        // ...(dynamicValueInCall || []),
      ]);
    }, []);
    const propsAndPropCalls =
      flatMap(allArgs.filter(val => Prop.isProp(val) || PropCall.isPropCall(val)),
        p => p.propsAndPropCallsInvolved());
    const count = (arr, predicate) => arr.reduce((n, val) => n + predicate(val), 0);
    const repeatedPropsAndPropCalls = propsAndPropCalls.filter(p1 => 1 < count(propsAndPropCalls, p2 => p1 === p2));

    return uniq(repeatedPropsAndPropCalls);
  }
}