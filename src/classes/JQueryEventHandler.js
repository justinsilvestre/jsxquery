import * as EVENTS from '../supportedEvents';

export default class JQueryEventHandler {
  constructor(eventName, targetId, calls) {
    Object.assign(this, { targetId, eventName, calls });
  }

  render() {
    const { targetId, eventName, calls } = this;
    return [
      `$(${this.targetId}).on('${EVENTS[eventName]}', function() {`,
      ...calls.reduce((arr, call) => arr.concat(call.jQuery(targetId)), []),
      '});'].join('\n  ');
  }
}
