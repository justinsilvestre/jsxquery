import { bindActionCreators } from 'redux';
export class Demo extends Component {
        static get defaultProps() {
    return {
      highlighted: false,
      bold: false,
      text: 'default text',
      containerShowing: true,
      num1: 0,
      num2: 0,

      bloop: 'blooorp',

      sum: (num1, num2) => +num1 + +num2,

      sideEffect: () => window.alert('...but they should not be taken lightly.'),
    };
  }

  actionNames() {
    return [
      'toggleBold',
      'startHighlighted',
      'endHighlighted',
      'setText',
      'hideContainer',
      'showContainer',
      'setNum1',
      'setNum2',
      'setBloop',
    ];
  }

  render() {
console.log(this.props)
    const { highlighted, bold, text, containerShowing, num1, num2, sum, bloop, sideEffect } = this.props;
    const { toggleBold,
            startHighlighted,
            endHighlighted,
            setText,
            hideContainer,
            showContainer,
            setNum1,
            setNum2,
            setBloop } = this.actions() ; //Redux.bindActionCreators(window.exports.actions, this.props.dispatch);

    const container = (
      <div id="dom-manipulation-container">
        <i id="dom-manipulation-bold"
           onClick={() => toggleBold()}
        >click</i>
        <br />
        <strong id="dom-manipulation-highlight"
          onMouseLeave={() => endHighlighted()}
          onMouseEnter={() => startHighlighted()}
        >
        mouse over</strong>
        <br />
        <input id="dom-manipulation-text-input"
               type="text"
               value={text}
               onChange={(e) => setText(e.target.value)}
        ></input>
        <span id="dom-manipulation-text">{text}</span>

        <div>
          <input id="something" value={bloop} onChange={e => setBloop(e.target.value)} />
          <input id="somethingelse" value={bloop} onChange={e => setBloop(e.target.value)} />
          <button id="heyooo" onClick={() => setBloop('heyooo')}>heyooo</button>
          <button id="matchytime" onClick={() => setBloop(this.props.text)}>matchytime</button>
        </div>

        <br />
        <button id="dom-manipulation-goodbye-button"
                onClick={() => hideContainer()}
        >goodbye</button>
      </div>
    );

    const math = (
      <div id="dom-manipulation-data-binding">
        <button id="dom-manipulation-hello-button"
                onClick={() => showContainer()}
        >hello</button>
        <input id="dom-manipulation-number-1" value={num1} onChange={e => setNum1(e.target.value)} />
        +
        <input id="dom-manipulation-number-2" value={num2} onChange={e => setNum2(e.target.value)} />
        =
        <span id="dom-manipulation-result">{sum(num1, num2)}</span>
        <br />
        <button id="dom-manipulation-side-effect" onClick={() => sideEffect()} >Side effects are necessary, in the end.</button>
      </div>
    );

    return (
      <div id="dom-manipulation-component" className={classNames({ highlighted, bold })} >
        {containerShowing ? container : math}
      </div>
    );
  }
      }