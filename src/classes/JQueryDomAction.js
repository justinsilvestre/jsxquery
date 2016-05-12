export default function jQueryDomAction(domActionData, propDeclarations, propCallDeclarations) {
  const { elementId, method, dynamicValue } = domActionData;

  switch (method) {
  case 'text':
  case 'html':
  case 'val':
  case 'addClass':
  case 'removeClass':
    return `$(${elementId}).${method}(${domActionData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue)});`;

  case 'attr':
  case 'prop':
    return `$(${elementId}).${method}(${domActionData.args[0].jQuery(propDeclarations, propCallDeclarations)}, ${domActionData.args[1].jQuery(propDeclarations, propCallDeclarations, dynamicValue)});`;

  case 'toggleClass':
    const toggleCriterion = domActionData.args[1] ? `, ${domActionData.args[1].jQuery(propDeclarations, propCallDeclarations, dynamicValue)}` : '';
    return `$(${elementId}).${method}(${domActionData.args[0].jQuery(propDeclarations, propCallDeclarations)}${toggleCriterion});`;

  case 'show':
    return typeof domActionData.args[0].value === 'boolean'
      ? `$(${elementId}).${domActionData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue) ? 'show' : 'hide'}();`
      : `$(${elementId}).toggle(${domActionData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue)});`;

  case 'hide':
    return typeof domActionData.args[0].value === 'boolean'
      ? `$(${elementId}).${domActionData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue) ? 'hide' : 'show'}();`
      : `$(${elementId}).toggle(!(${domActionData.args[0].jQuery(propDeclarations, propCallDeclarations, dynamicValue)}));`;

  case 'append':
    return `$(${elementId}).append(templates[${domActionData.transformIndex}](${domActionData.newValue}));`;

  case 'filter':
    return `var itemIsVisible = ${domActionData.filter.jQuery(propDeclarations, propCallDeclarations, dynamicValue)};\n`
    + `\t$(${elementId}).children().each((i, el) => $(el).toggle(itemIsVisible(extractDataFromTemplate[${domActionData.transformIndex}](el))));\n`;
  }
}