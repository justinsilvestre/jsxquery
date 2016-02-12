export default class EventArgument {
  constructor(...path) {
    this.path = path;
  }

  toJQueryArgument() {
    if (typeof this.path === 'undefined')
      return 'event';

    const joinedPath = this.path.join('.');
    return ({
      'target.value': '$(this).val()',
    }[joinedPath]) || (() => {
      throw new Error(`Acceptance of 'event.${joinedPath}' as an action argument has not been implemented yet.`);
    })();
  }
}

const e = (...path) => new EventArgument(...path);

export const mockEvent = {
  target: {
    value: e('target', 'value'),
  },

  preventDefault() {
    throw new Error();
  },

  stopPropagation() {
    throw new Error();
  },
};

// ALSO ACCOUNT FOR PREVENT DEFAULT AND STOP PROPAGATION!!!!
