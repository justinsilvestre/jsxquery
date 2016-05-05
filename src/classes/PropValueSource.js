import PROP_SOURCE_METHODS from '../propSourceMethods';

function findSource(elements, prop) {
  for (const element of elements) {
    for (const method in PROP_SOURCE_METHODS) {
      const sourceData = PROP_SOURCE_METHODS[method](element, prop);
      if (sourceData)
        return sourceData;
    }
  }
  return {};
}

export default class PropValueSource {
  constructor(elements, prop) {
    Object.assign(this, { prop, ...findSource(elements, prop) });
  }

  scopedJQuery(scope) {
    const { element, method, argument, equalityCheck } = this;

    console.log(element)
    const elementId = element.getIdForProp(this.prop);
    const argumentString = typeof argument !== 'undefined' ? JSON.stringify(argument) : '';
    return `$(${scope}).find('${elementId}').addBack(${scope}).${method}(${argumentString})${equalityCheck || ''}`;
  }
}
