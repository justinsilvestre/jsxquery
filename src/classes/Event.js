export default class Event {
  constructor(...path) {
    this.path = path;
  }

  toJQueryCode() {
    if (typeof this.path === 'undefined')
      return 'event';

    const joinedPath = this.path.join('.');
    return ({
      'target.value': '$(this).val()',
      'preventDefault()': 'event.preventDefault()',
      'stopPropagation()': 'event.stopPropagation()',
    }[joinedPath]) || (() => {
      throw new Error(`Acceptance of 'event.${joinedPath}' as an action argument has not been implemented yet.`);
    })();
  }
}

const e = (...path) => new Event(...path);

export const mockEvent = function(accumulator) {
  return {
    target: {
      value: e('target', 'value'),
    },

    preventDefault() {
      accumulator.push(e('preventDefault()'));
    },

    stopPropagation() {
      accumulator.push(e('stopPropagation()'));
    },
  };
};
