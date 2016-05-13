function isCreateElementCall(path) {
  return path.isCallExpression() &&
    ((path.node.callee.type === 'Identifier' && path.node.callee.name === 'createElement')
    || path.node.callee.type === 'MemberExpression' && path.node.callee.property.name === 'createElement');
}

function isWithinCreateElementCall(path) {
  const parentPath = path && path.parentPath;
  if (!parentPath) return false;

  if (isCreateElementCall(parentPath))
    return true;

  return isWithinCreateElementCall(parentPath);
}

module.exports = function(b) {
  return {
    visitor: {
      ConditionalExpression(conditionalExpressionPath) {
        if(!isWithinCreateElementCall(conditionalExpressionPath))
          return;

        const funcTemplate = b.template(`jsxQuery.ternary(TEST, CONSEQUENT, ALTERNATE)`);

        conditionalExpressionPath.replaceWith(funcTemplate({
          TEST: conditionalExpressionPath.node.test,
          CONSEQUENT: conditionalExpressionPath.node.consequent,
          ALTERNATE: conditionalExpressionPath.node.alternate,
        }));
      },
    },
  };
}
