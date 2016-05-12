import * as EVENTS from '../supportedEvents';
import PropCall from './PropCall';

export default class JQueryEventHandler {
  constructor(eventName, targetId, calls) {
    Object.assign(this, { targetId, eventName, calls });
  }

  render() {
    const { targetId, eventName, calls } = this;

    const allRepeatedDynamicValues = calls.reduce((arr, call) =>
      arr.concat(call.repeatedDynamicValues || [])
    , [])
    .reduce((arr, call) => {
      // get rid of duplicate initializations from multiple propfunction calls in same handler
      const notToBeAdded = arr.some(c => c.varName() === call.varName());
      return arr.concat(notToBeAdded ? [] : call);
    }, []);

    return [
      `$(${this.targetId}).on('${EVENTS[eventName]}', function() {`,
      ...allRepeatedDynamicValues.map(val => `var ${val.varName()};`),
      ...calls.reduce((arr, call) =>
        arr.concat(PropCall.isPropCall(call) ? call.jQuery() : call.jQuery(targetId))
      , []),
      '});'].join('\n  ');
  }
}
