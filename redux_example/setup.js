import { createStore } from 'redux' ;
import { connect, Provider } from 'react-redux';
import React from 'react';

export function mapStateToProps(state) {
  return {
    highlighted: state.highlighted,
    bold: state.bold,
    text: state.text,
    containerShowing: state.containerShowing,
    num1: state.num1,
    num2: state.num2,
    bloop: state.bloop,
    sum: state.sum,
    sideEffect: state.sideEffect,
  };
}

export function setupComponent(component) {
  const connectedComponent = connect(mapStateToProps)(component);
  return (
    // <Provider store={createStore(updateComponent, component.defaultProps)}>
    React.createElement(Provider, { store: createStore(updateComponent, component.defaultProps)}, 
      React.createElement(connectedComponent)
      )
    // </Provider>
  );
}