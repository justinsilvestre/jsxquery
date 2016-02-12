export default function reduxSetupTemplate(propNames) {
  return (
`const { createStore } = Redux;
const { connect, Provider } = ReactRedux;

export function mapStateToProps(state) {
  return {
` + propNames.map((propName) => `    ${propName}: state.${propName},\n`).join('')
  + `  };
}

export function setupComponent(component) {
  const connectedComponent = connect(mapStateToProps)(component);
  return (
    <Provider store={createStore(updateComponent, component.defaultProps)}>
      {React.createElement(connectedComponent)}
    </Provider>
  );
}
`);
}
