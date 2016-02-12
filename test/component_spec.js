import expect from 'expect';
import DomManipulationExample from '../examples/DomManipulation.jsx';
import jsxQuery, { Component, classNames, createElement } from '../src/jsxquery';
import { isFunction, values } from 'lodash';

describe('Component', () => {
  class ValidActions extends Component {
    static get actionNames() {
      return ['startDancing', 'setYourCourse', 'endGlobalPoverty'];
    }
    render() {
      return <div />;
    }
  }

  describe('actions', () => {
    it('throws an error if you try creating an action with an invalid name.', () => {
      class InvalidActions extends Component {
        static get actionNames() {
          return ['startDancing', 'setYourCourse', 'explode'];
        }
        render() {
          return <div />;
        }
      }
      const component = <InvalidActions />.component;
      expect(() => component.actions).toThrow("'explode' is not a valid action name");
    });

    it('creates an action function for each action name returned by actionNames', () => {
      const component = <ValidActions />.component;

      expect(Object.keys(component.actions)).toEqual(ValidActions.actionNames);
      expect(values(component.actions).every(action => isFunction(action))).toBe(true);
    });
  });

  class LotsaProps extends Component {
    static get defaultProps() {
      return { thing: false, something: false, preloadedProp: 1 };
    }

    static get actionNames() {
      return ['startThing', 'startSomething'];
    }

    doSomething() {
      this.actions.startSomething();
    }

    render() {
      const { thing, something, preloadedProp } = this.props;
      const { startThing } = this.actions;

      const span = <span id='wassup'
                         onMouseEnter={() => this.doSomething()}
                         className={something ? 'something' : ''}
                         >whaaa</span>;
      const link = <a id='hi' href="http://google.com" onMouseLeave={() => this.doSomething()}>hey!</a>;

      return (<div id="testingEventListeners" onClick={() => startThing()}>
        <span id="a">{ thing ? link : span }</span>
        <span id="b">{ preloadedProp ? link : span}</span>
      </div>);
    }
  }

  describe('get mutableProps()', () => {
    it('returns the name of any props found in actionNames', () => {
      const component = <LotsaProps preloadedProp="0" />.component;
      const expectedProps = ['thing', 'something'];
      expect(component.mutableProps).toEqual(expectedProps);
    });
  });

  describe('eventListeners()', () => {
    it('returns an empty array for a component with no event listeners', () => {
      class NoListeners extends Component {
        render() {
          return (<div id="noListeners">
            <a href="http://bing.com/lol/yeahright">click here mebbe</a>
          </div>);
        }
      }
      const component = <NoListeners />.component;
      expect(component.eventListeners()).toEqual([]);
    });

    it('collects all event listener attributes in a simple component', () => {
      class TestEventListeners extends Component {
        static get defaultProps() {
          return { one: '1', two: '2' };
        }

        static get actionNames() {
          ['setOne'];
        }

        render() {
          return (<div id="testingEventListeners">
            <a id='hi' href="http://google.com" onClick={() => this.doThing()}>hey!</a>
            <strong id='strong-one' onMouseEnter={() => this.doThing()}>whaaa</strong>
          </div>);
        }
      }
      const component = <TestEventListeners />.component;
      const expectedEventListenerNames = ['onClick', 'onMouseEnter'];
      const actualEventListenerNames = component.eventListeners().map(e => e.eventName);

      expectedEventListenerNames.forEach(name => {
        expect(actualEventListenerNames).toContain(name);
      });
      // ALSO TEST FOR STRINGIFIED FUNCTIOns
    });

    it('collects all event listener attributes in a component with client-side-scripted conditional children', () => {
      const component = <LotsaProps />.component;
      const expectedEventListenerNames = ['onClick', 'onMouseEnter', 'onMouseLeave'];
      const actualEventListenerNames = component.eventListeners().map(e => e.eventName);

      expectedEventListenerNames.forEach(name => {
        expect(actualEventListenerNames).toContain(name);
      });
    });

    it('throws an error when an element with an event listener has no id', () => {
      class NoIdForListeners extends Component {
        render() {
          return <div id="hi">
            <div onClick={() => this.doThing()}>do the thing</div>
          </div>;
        }
      }
      const component = <NoIdForListeners />.component;
      expect(component.eventListeners.bind(component)).toThrow(
        'Your <div> element with listeners [onClick] needs a unique id attribute'
      );
    });

    it('throws an error when an component has event listeners but no outer id', () => {
      class NoOuterIdForListeners extends Component {
        render() {
          return (<div>
            <span onClick={() => this.doThing()}>do the thing</span>
          </div>);
        }
      }
      const component = <NoOuterIdForListeners />.component;
      expect(component.eventListeners.bind(component)).toThrow(Error);
    });
  });

  describe('namespaceName()', () => {
    it('returns the component constructor name when component has only one instance in tree', () => {
      expect(<LotsaProps />.component.namespaceName()).toEqual('LotsaProps');
    });
  });
});
