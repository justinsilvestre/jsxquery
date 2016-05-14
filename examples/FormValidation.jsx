import jsxQuery, { Component } from '../jsrc/sxquery';
import $ from 'jquery';
import _ from 'lodash';
/*** END IMPORT STATEMENTS ***/

const propNameFor = (fieldName) => _.camelCase(fieldName + 'Text');
const setXActionFor = (fieldName) => _.camelCase('set-' + propNameFor(fieldName));
const setXIsInvalidActionNameFor = (fieldName) => _.camelCase('set-' + fieldName + 'IsInvalid');
const startXWasBlurredActionNameFor = (fieldName) => _.camelCase('start-' + fieldName + 'WasBlurred');

const Field = ({ name, confirmAgainst, inputType, actions, props }) => {
  const camelCaseName = _.camelCase(name);
  const prop = props[propNameFor(name)];
  const validationMessage = props.validationMessage(camelCaseName, prop, ...[confirmAgainst].filter(v=>v));

  return (<div id={name + '-field-component'}
               className={classNames({ invalid: props[camelCaseName + 'IsInvalid'] })}>
    <input id={name + '-field'}
      type={inputType || 'text'}
      value={prop}
      onChange={e => {
        actions[setXActionFor(name)](e.target.value);
        actions[setXIsInvalidActionNameFor(name)](validationMessage);
      }}
      onBlur={() => actions[startXWasBlurredActionNameFor(name)]()}
    ></input>
    {props[camelCaseName + 'WasBlurred']
      ? <span id={name + '-validation-message'} className="validation-message">{validationMessage}</span>
      : null}
  </div>);
};

const fieldNames = ['username', 'email', 'password', 'confirmPassword'];

export default class FormValidation extends Component {
  static get defaultProps() {
    const fieldProps = fieldNames.reduce((obj, fieldName) =>
      Object.assign(obj, {
        [propNameFor(fieldName)]: '',
        [fieldName + 'IsInvalid']: true,
        [fieldName + 'WasBlurred']: false,
      }), {});

    const functionProps = {
      validationMessage: (fieldName, ...args) => {
        const rules = {
          username: un =>
            un.length < 5
              && 'Your username must be longer than 5 characters.'
            || un.length > 15
              && 'Your username must be shorter than 15 characters.',
          email: em =>
            em.indexOf('@') === -1
              && 'Your email address must contain "@".',
          password: pw => pw.length < 6
            && 'Your password must be longer that 5 characters.',
          confirmPassword: (confirmPw, pw) =>
            pw !== confirmPw
              && 'The passwords you entered do not match.',
        };
        return rules[fieldName] && rules[fieldName](...args) || null;
      },
      anyFieldsAreInvalid: (...fieldsAreInvalid) => fieldsAreInvalid.some(v => v),
    };

    return Object.assign(fieldProps, functionProps);
  }

  static get actionNames() {
    const actionNamesFor = (fieldName) =>
      [setXIsInvalidActionNameFor(fieldName), setXActionFor(fieldName), startXWasBlurredActionNameFor(fieldName)];

    return [].concat.call(...fieldNames.map(actionNamesFor));
  }

  render() {
    const { props } = this;
    const actions = this.actions || bindActionCreators(actionsHash, this.props.dispatch);

    return (<div id="form">
      username
      <Field name="username" actions={actions} props={props}/>
      email
      <Field name="email" actions={actions} props={props}/>
      password
      <Field name="password" inputType="password" actions={actions} props={props}/>
      <Field name="confirm-password" inputType="password"  confirmAgainst={props.passwordText} actions={actions} props={props}/>
      <button id="submit" disabled={this.props.anyFieldsAreInvalid(...fieldNames.map(fn => props[fn + 'IsInvalid']))}>Submit form</button>
    </div>);
  }
}
