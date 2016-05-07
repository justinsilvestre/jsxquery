import flatMap from 'lodash.flatmap';
import stateChangeEffects from '../stateChangeEffects';

export default class ActionCall {
  constructor(actionType, mutatedProp, args) {
    Object.assign(this, { actionType, mutatedProp, args });
  }

  jQuery(targetId) {
    return [
      ...this.domActions(targetId).map((effectData) => {
        const { elementId, method, args } = effectData;
        const joinedArgs = args ? args.join(', ') : '';

        switch (method) {
        case ('text'):
        case ('html'):
        case ('val'):
        case ('attr'):
        case ('prop'):
          return `$(${elementId}).${method}(${joinedArgs});`;

        case ('toggleClass'):
          return typeof args[1] === 'boolean'
            ? `$(${elementId}).${args[1] ? 'add' : 'remove'}Class(${args[0]});`
            : `$(${elementId}).toggleClass(${joinedArgs});`;

        case ('show'):
          return typeof args[0] === 'boolean'
            ? `$(${elementId}).${args[0] ? 'show' : 'hide'}();`
            : `$(${elementId}).toggle(${args[0]});`;

        case ('hide'):
          return typeof args[0] === 'boolean'
            ? `$(${elementId}).${args[0] ? 'hide' : 'show'}();`
            : `$(${elementId}).toggle(!(${args[0]}));`;

        case ('append'):
          return `$(${elementId}).append(templates[${effectData.transformIndex}](${effectData.newValue}));`;

        case ('filter'):
          return `var itemIsVisible = ${effectData.filter};\n`
          + `\t$(${elementId}).children().each((i, el) => $(el).toggle(itemIsVisible(extractDataFromTemplate[${effectData.transformIndex}](el))));\n`;
        }
      }),
    ];
  }

  domActions(targetId) {
    const { mutatedProp } = this;
    const element = mutatedProp.parent.element();

    const methodCalls = flatMap(element.elementNodes(), el =>
      flatMap(Object.keys(stateChangeEffects), method =>
        stateChangeEffects[method](this, el, targetId)
      )
    );

    return methodCalls;
  }
}