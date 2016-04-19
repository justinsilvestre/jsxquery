function isCreateElementCall(path) {
  return path.isCallExpression() &&
    ((path.node.callee.type ==='Identifier' && path.node.callee.name === 'createElement')
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

            var identifiersExceptPropertyNames = [];
            conditionalExpressionPath.traverse({
              Identifier(identifierPath) {
                if (identifierPath.node.end > conditionalExpressionPath.node.test.end || identifierPath.node === identifierPath.parent.property)
                  return;
                identifiersExceptPropertyNames.push(JSON.stringify(identifierPath.node.name));
              },
            });
            const commaJoinedIdentifiers = identifiersExceptPropertyNames.join(', ');

            const funcTemplate = b.template(`
              jsxQuery.ternary(TEST, CONSEQUENT, ALTERNATE)
              `);

        conditionalExpressionPath.replaceWith
           (funcTemplate
            ({
              TEST: conditionalExpressionPath.node.test,
              CONSEQUENT: conditionalExpressionPath.node.consequent,
              ALTERNATE: conditionalExpressionPath.node.alternate,
            })
          );


            // // // SHOULD ONLY REPLACE WITHIN CREATEELEMENT CALLS.
            // // // or rather, should only replace when either the consequent, alternate,
            // // // or entire expression is in a createelement call's arguments??
            // // // ok: either the ternary expression is right int he createelemnt call
            // // // or it was assigned to a variable that is in that place.

            // conditionalExpressionPath.replaceWith(
            //   funcTemplate({
            //     TEST: conditionalExpressionPath.node.test,
            //     CONSEQUENT: conditionalExpressionPath.node.consequent,
            //     ALTERNATE: conditionalExpressionPath.node.alternate,
            //   })
            // );


      }
    },
  };
}
