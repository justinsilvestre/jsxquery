import expect from 'expect';
import Event from '../src/classes/Event';

describe('Event', () => {
  it('tracks calls to event methods', () => {
    const callTracker = [];
    const event = new Event(callTracker);

    event.stopPropagation();
    event.preventDefault();

    expect(callTracker.length).toBe(2);
  });

  describe('toJQueryCode()', () => {
    it('returns equivalent jQuery code for event target', () => {
      const event = new Event([]);
      const target = event.target;

      expect(target.toJQueryCode()).toEqual('$(this)');
    });

    it('returns equivalent jQuery code for event target value', () => {
      const event = new Event([]);
      const targetValue = event.target.value;

      expect(targetValue.toJQueryCode()).toEqual('$(this).val()');
    });

    it('returns chain of properties accessed on event when there is no jQuery equivalent', () => {
      const event = new Event([]);
      const eventObjs = [event, event.type, event.some.other.property];

      expect(eventObjs.map(e => e.toJQueryCode())).toEqual([
        'event',
        'event.type',
        'event.some.other.property',
      ]);
    });

    it('includes parentheses when event or event property is called as a function', () => {
      const event = new Event([]);
      const eventObjs = [event.preventDefault(), event.prop.otherProp.someMethod()];

      expect(eventObjs.map(e => e.toJQueryCode())).toEqual([
        'event.preventDefault()',
        'event.prop.otherProp.someMethod()',
      ]);
    });
  });
});
