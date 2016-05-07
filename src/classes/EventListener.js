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


// each event listener needs to keep track of mutated props.
// how about we first make variables for each mutated prop,
// and then apply the DOM changes.