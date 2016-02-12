import { isFunction } from 'lodash';

// maybe this should be in Attribute?

export default class EventListener {
  constructor(eventName, targetId, handler) {
    Object.assign(this, {
      eventName,
      targetId,
      handler,
    });
  }

  build(event, tracker) {
    if (isFunction(this.handler)) {
      this.handler(event, tracker);
      return true;
    } else {
      isFunction(this.handler.consequent) && this.handler.consequent(event, tracker);
      isFunction(this.handler.alternate) && this.handler.alternate(event, tracker);
      return true;
    }
    return false;
  }
}
