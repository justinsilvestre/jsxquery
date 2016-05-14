import jsxQuery, { Component, classNames } from '../src/jsxquery';
/*** END IMPORT STATEMENTS ***/

export default class DomManipulationExample extends Component {
  static get defaultProps() {
    return {
      yellow: false,
      blue: false,

      echoText: 'instant feedback',
      laterEchoText: '',

      container1Showing: true,

      sideEffect(message) { window.alert(message); },
    };
  }

  static get actionNames() {
    return [
      'toggleBlue',
      'startYellow',
      'endYellow',

      'setEchoText',
      'setLaterEchoText',

      'showContainer1',
      'hideContainer1',
    ];
  }

  render() {
    const { yellow, blue, echoText, laterEchoText, container1Showing, sideEffect } = this.props;

    const { toggleBlue, startYellow, endYellow,
            setEchoText, setLaterEchoText,
            showContainer1, hideContainer1 } = this.actions || bindActionCreators(actionsHash, this.props.dispatch);

    const container1 = (
      <div id="container1">
        <span id="click-me"
              className={classNames({ blue })}
              onClick={() => toggleBlue()}>Click me</span>
        <br />
        <span id="mouse-over-me"
              className={classNames({ yellow })}
              onMouseEnter={() => startYellow()}
              onMouseLeave={() => endYellow()}>Mouse-over me</span>

        <br /><br />

        <input id="echo-input"
               value={echoText}
               onChange={e => setEchoText(e.target.value)}></input>
        <span id="echo-text">{echoText}</span>

        <br /><br />

        <button id="echo-button" onClick={() => setLaterEchoText(echoText)}>Not-so-instant feedback</button>
        <span id="later-echo-text">{laterEchoText}</span>

        <br /><br />

        <button id="goodbye-button" onClick={() => hideContainer1()} >Goodbye</button>
      </div>
    );

    const container2 = (
      <div id="container2">
        <button id="side-effect" onClick={() => sideEffect('But we should treat them with care.')} >Side effects are necessary, in the end.</button>
        <br /><br />
        <button id="hello-button" onClick={() => showContainer1()}>Hello</button>
      </div>
    );

    return (
      <div id="dom-manipulation-example" >
        {container1Showing ? container1 : container2}
      </div>
    );
  }
}
