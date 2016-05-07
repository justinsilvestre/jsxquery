import Proxy from 'harmony-proxy';

const JQUERY_EVENT_PROPERTY_EQUIVALENTS = {
  'target': '$(this)',
  'target.value': '$(this).val()',
};

export default class Event {
  constructor(callTracker, ...propertyChain) {
    this.callTracker = callTracker;
    this.propertyChain = propertyChain;
    this.__isEvent__ = true;

    const fn = () => {
      const call = Object.assign(new Event(callTracker, ...propertyChain), {
        jQuery: () => this.jQuery() + '()',
      });

      callTracker.push(call);
      return call;
    };

    Object.assign(fn, this, {
      jQuery: this.jQuery.bind(this),
    });

    return new Proxy(fn, {
      get: Event.getHandler,
    });
  }

  static getHandler(target, name) {
    return name in target
      ? target[name]
      : new Event(target.callTracker, ...target.propertyChain.concat(name));
  }

  static isEvent(val) {
    return typeof val === 'function' && val.__isEvent__ === true;
  }

  jQuery() {
    const { propertyChain } = this;
    const joinedPropertyChain = propertyChain.join('.');
    return JQUERY_EVENT_PROPERTY_EQUIVALENTS[joinedPropertyChain] || ['event', ...propertyChain].join('.');
  }
}
