import { bindActionCreators } from 'redux';

function set(obj, newValues) {
  return Object.assign(obj.constructor(), obj, newValues);
}

export function updateComponent(state, action) {
  console.log(action);
  switch (action.type) {
  case 'TOGGLE_BOLD':
    return set(state, { bold: !state.bold });
  case 'START_HIGHLIGHTED':
    return set(state, { highlighted: true });
  case 'END_HIGHLIGHTED':
    return set(state, { highlighted: false });
  case 'SET_TEXT':
    return set(state, { text: action.payload });
  case 'HIDE_CONTAINER':
    return set(state, { containerShowing: false });
  case 'SHOW_CONTAINER':
    return set(state, { containerShowing: true });
  case 'SET_NUM_1':
    return set(state, { num1: action.payload });
  case 'SET_NUM_2':
    return set(state, { num2: action.payload });
  case 'SET_BLOOP':
    return set(state, { bloop: action.payload });
  default:
    return state;
  }
}

export const actions = {  toggleBold(payload) {
    return {
      type: 'TOGGLE_BOLD',
    payload,

    };
},

  startHighlighted(payload) {
    return {
      type: 'START_HIGHLIGHTED',
    payload,

    };
},

  endHighlighted(payload) {
    return {
      type: 'END_HIGHLIGHTED',
    payload,

    };
},

  setText(payload) {
    return {
      type: 'SET_TEXT',
    payload,

    };
},

  hideContainer(payload) {
    return {
      type: 'HIDE_CONTAINER',
    payload,

    };
},

  showContainer(payload) {
    return {
      type: 'SHOW_CONTAINER',
    payload,

    };
},

  setNum1(payload) {
    return {
      type: 'SET_NUM_1',
    payload,

    };
},

  setNum2(payload) {
    return {
      type: 'SET_NUM_2',
    payload,

    };
},

  setBloop(payload) {
    return {
      type: 'SET_BLOOP',
    payload,

    };
},
};
