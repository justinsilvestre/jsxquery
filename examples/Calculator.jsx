// import jsxQuery, { Component } from '../jsxquery';

export default class Calculator extends Component {
  static get defaultProps() {
    return {
      operand1: 0,
      operand2: 0,
      operation: '+',
      result(operation, operand1String, operand2String) {
        return {
          '+': (o1, o2) => o1 + o2,
          '-': (o1, o2) => o1 - o2,
          '*': (o1, o2) => o1 * o2,
          '/': (o1, o2) => o1 / o2,
        }[operation](+operand1String, +operand2String);
      },
    };
  }

  static get actionNames() {
    return ['setOperand1', 'setOperand2', 'setOperation'];
  }

  render() {
    const { operand1, operand2, operation, result } = this.props;
    const { setOperand1, setOperand2, setOperation } = this.actions || bindActionCreators(actionsHash, this.props.dispatch);
    return (<div id="calculator">
      <input id="operand1"
             value={operand1}
             onChange={e => setOperand1(e.target.value)}
             style={{ width: '4em' }} />
      <span id="operation">{operation}</span>
      <input id="operand2"
             value={operand2}
             onChange={e => setOperand2(e.target.value)}
             style={{ width: '4em' }} />
      {' = '}
      <span id="result">{result(operation, operand1, operand2)}</span>
      <br />
      <button id="add"
              onClick={() => setOperation('+')}>Addition</button>
      <button id="subtract"
              onClick={() => setOperation('-')}>Subtraction</button>
      <button id="multiply"
              onClick={() => setOperation('*')}>Multiplication</button>
      <button id="division"
              onClick={() => setOperation('/')}>Division</button>
    </div>);
  }
}
