export default function jQueryCall(dependenciesOnProp) {
  return dependenciesOnProp.map((obj) => {
    const { elementId, method, newValue, toggleCriterion } = obj;
    switch (method) {
    case ('text'):
      return `$('#${elementId}').text(${newValue});`;

    case ('html'):
      return `$('#${elementId}').html(${newValue});`;

    case ('val'):
      return `$('#${elementId}').val(${newValue});`;

    case ('toggleClass'):
      if (typeof toggleCriterion === 'boolean')
        return `$('#${elementId}').${toggleCriterion ? 'add' : 'remove'}Class('${obj.className}');`;

      const toggleCriterionBool = toggleCriterion === '' ? '' : 'Boolean(' + toggleCriterion + ')';
      return toggleCriterion === ''
        ? `$('#${elementId}').toggleClass('${obj.className}');`
        : `$('#${elementId}').toggleClass('${obj.className}', ${toggleCriterionBool});`;

    case ('show'):
      return typeof toggleCriterion === 'boolean'
        ? `$('#${elementId}').${toggleCriterion ? 'show' : 'hide'}();`
        : `$('#${elementId}').toggle(${toggleCriterion});`;

    case ('hide'):
      return typeof toggleCriterion === 'boolean'
        ? `$('#${elementId}').${toggleCriterion ? 'hide' : 'show'}();`
        : `$('#${elementId}').toggle(!(${toggleCriterion}));`;

    case ('attr'):
      return `$('#${elementId}').prop('${obj.attributeName}', ${newValue});`;
    }
  }).join('\n\t');
}
