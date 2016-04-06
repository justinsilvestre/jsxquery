import Proxy from 'harmony-proxy';

const JQUERY_EVENT_PROPERTY_EQUIVALENTS = {
  'target': '$(this)',
  'target.value': '$(this).val()',
};

export default class Event {
  constructor(callTracker, ...chain) {
    this.callTracker = callTracker;
    this.chain = chain;
    this.__isEvent__ = true;

    const fn = () => {
      const call = Object.assign(new Event(callTracker, ...chain), {
        toJQueryCode: () => this.toJQueryCode() + '()',
      });

      callTracker.push(call);
      return call;
    };

    Object.assign(fn, this, {
      toJQueryCode: this.toJQueryCode.bind(this),
    });

    return new Proxy(fn, {
      get: Event.getHandler,
    });
  }

  static getHandler(target, name) {
    return name in target
      ? target[name]
      : new Event(target.callTracker, ...target.chain.concat(name));
  }

  static isEvent(val) {
    return typeof val === 'function' && '__isEvent__' in val;
  }

  toJQueryCode() {
    const { chain } = this;
    const joinedPropertyChain = chain.join('.');
    return JQUERY_EVENT_PROPERTY_EQUIVALENTS[joinedPropertyChain] || ['event', ...chain].join('.');
  }
}
