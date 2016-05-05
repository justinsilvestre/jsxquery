export default function jQueryCall(stateChangeEffects) {
  return stateChangeEffects.map((effectData) => {
    const { elementId, method, newValue, toggleCriterion } = effectData;
    switch (method) {
    case ('text'):
      return `$('${elementId}').text(${newValue});`;

    case ('html'):
      return `$('${elementId}').html(${newValue});`;

    case ('val'):
      return `$('${elementId}').val(${newValue});`;

    case ('toggleClass'):
      if (typeof toggleCriterion === 'boolean')
        return `$('${elementId}').${toggleCriterion ? 'add' : 'remove'}Class('${effectData.className}');`;

      const toggleCriterionBool = toggleCriterion === '' ? '' : 'Boolean(' + toggleCriterion + ')';
      return toggleCriterion === ''
        ? `$('${elementId}').toggleClass('${effectData.className}');`
        : `$('${elementId}').toggleClass('${effectData.className}', ${toggleCriterionBool});`;

    case ('show'):
      return typeof toggleCriterion === 'boolean'
        ? `$('${elementId}').${toggleCriterion ? 'show' : 'hide'}();`
        : `$('${elementId}').toggle(${toggleCriterion});`;

    case ('hide'):
      return typeof toggleCriterion === 'boolean'
        ? `$('${elementId}').${toggleCriterion ? 'hide' : 'show'}();`
        : `$('${elementId}').toggle(!(${toggleCriterion}));`;

    case ('attr'):
      return `$('${elementId}').attr('${effectData.attributeName}', ${newValue});`;

    case ('prop'):
      return `$('${elementId}').prop('${effectData.attributeName}', ${newValue});`;

    case ('append'):
      return `$('${elementId}').append(templates[${effectData.transformIndex}](${newValue}));`;

    case ('filter'):
      return `var itemIsVisible = ${effectData.filter};\n`
      + `\t$('${elementId}').children().each((i, el) => $(el).toggle(itemIsVisible(extractDataFromTemplate[${effectData.transformIndex}](el))));\n`;
    }
  }).join('\n\t');
}
