import * as EVENTS from '../supportedEvents';

export default class JQueryEventHandler {
  constructor(eventName, targetId, calls) {
    Object.assign(this, { targetId, eventName, calls });
  }

  render() {
    const { targetId, eventName, calls } = this;
    const repeatedDynamicValues = this.calls.reduce((arr, call) => {
      if (!call.repeatedDynamicValues)
        return arr.concat([])
      else
        return arr.concat(call.repeatedDynamicValues(targetId));
    }, [])
    .reduce((arr, call) => {
      // get rid of duplicate initializations from multiple propfunction calls in same handler
      const notToBeAdded = arr.some(c => c.varName() === call.varName());
      return arr.concat(notToBeAdded ? [] : call);
    }, []);

    return [
      `$(${this.targetId}).on('${EVENTS[eventName]}', function() {`,
      ...repeatedDynamicValues.map(val =>
        `var ${val.varName()};`
      ),
      ...calls.reduce((arr, call) => arr.concat(call.jQuery(targetId)), []),
      '});'].join('\n  ');
  }
}
