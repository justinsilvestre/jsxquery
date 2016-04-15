import jsxQuery, { Component, classNames, createElement } from '../src/jsxquery';
// const jsxQuery = require('jsxquery');
// const { Component, classNames } = jsxQuery;
// import React, { Component } from 'react';
// import classNames from 'classnames';
// import * as domManipulationActions from './domManipulationActions';
// import { bindAll } from './domManipulationActions';

export default class DomManipulationExample extends Component {
  static get defaultProps() {
    return {
      highlighted: false,
      bold: false,
      text: 'default text',
      containerShowing: true,
      num1: 0,
      num2: 0,

      buttonIsDisabled: false,

      bloop: 'blooorp',

      sum: (num1, num2) => +num1 + +num2,

      sideEffect: () => window.alert('...but they should not be taken lightly.'),

      attrProp: 'http://bing.com',
      htmlProp: 'beep',
    };
  }

  static get actionNames() {
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
      'setAttrProp',
      'setHtmlProp'
    ];
  }

  render() {
    const { highlighted,
            bold,
            text,
            containerShowing,
            num1,
            num2,
            sum,
            bloop,
            sideEffect,
            buttonIsDisabled,
            attrProp,
            htmlProp } = this.props;

    const { toggleBold,
            startHighlighted,
            endHighlighted,
            setText,
            hideContainer,
            showContainer,
            setNum1,
            setNum2,
            setBloop,
            setHtmlProp,
            setAttrProp } = this.actions || bindActionCreators(actions, this.props.dispatch);

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
                disabled={buttonIsDisabled}
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
        <span onMouseMove={() => setHtmlProp('boop')} id="html" dangerouslySetInnerHTML={{ __html: htmlProp }} />
        <a id="attr" onScroll={() => setAttrProp('http://google.com')} href={attrProp}>attribute shall change</a>
      </div>
    );

    return (
      <div id="dom-manipulation-component" className={classNames({ highlighted, bold })} >
        {containerShowing ? container : math}
      </div>
    );
  }
}

            // we'll just give our components an actions property
            // which generates a hash with keys as those actions names
            // and they return the action data
            // OR they keep track of any calls.
            // how about, when we're generating jQuery,
            // each of the functions for onWhatever attributes is called.
            // if we can get the functions somehow
            // to tell us the context in which they were called,
            // we'll easily get the list of functions to recreate with jQuery.
            // really, we only want methods on our component to be the only ones
            // calling the actions, anyway. so if we do a simple transform
            // and get some context data passed into the function call that way,
            // the only possible issue probably would be
            // outside dependencies--modules or something.

