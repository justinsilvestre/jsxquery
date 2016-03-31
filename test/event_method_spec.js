import expect from 'expect';
import { Component, createElement } from '../src/jsxquery';

describe('Event', () => {
  class PreventDefaultComponent extends Component {
      static get defaultProps() {
        return {
          num: 0,
        };
      }

      static get actionNames() {
        return ['setNum'];
      }

      setNum(e) {
        e.preventDefault();
        this.actions.setNum(1);
      }

      render() {
        return (
          <div id="component">
            <a id="setNum" onClick={e => this.setNum(e)} href="#">not a normal link</a>
            <span id="num">{this.props.num}</span>
            <button id="whatev" onClick={e => e.stopPropagation()} href="#">whoo!</button>
          </div>
        );
      }
    }
    const component = <PreventDefaultComponent />.component;
    const script = component.jQuery();

  it('tracks call to preventDefault()', () => {
    expect(script).toContain('preventDefault()');
  });

  it('tralls call to stopPropagation()', () => {
    expect(script).toContain('stopPropagation()');
  });
});