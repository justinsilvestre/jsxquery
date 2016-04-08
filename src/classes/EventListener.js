// maybe this should be in Attribute?

export default class EventListener {
  constructor(eventName, targetId, handler) {
    Object.assign(this, {
      eventName,
      targetId,
      handler,
    });
  }
}
