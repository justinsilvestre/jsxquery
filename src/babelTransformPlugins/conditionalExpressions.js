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
      // Identifier(path) {
      //   if (path.node.name !== 'component') return;
      //   path.replaceWith(b.types.identifier('bloop'))
      // },
      ConditionalExpression(conditionalExpressionPath) {
        // if (conditionalExpressionPath.node.test.name !== 'thing')
        //   return;
        // if (conditionalExpressionPath.node.test.type === 'LogicalExpression')
        //   return;
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
            const LOADED_PROPS = `[${commaJoinedIdentifiers}].find(prop => ~this.loadedProps.indexOf(prop))`;
            const MUTABLE_PROPS = `[${commaJoinedIdentifiers}].find(prop => ~this.mutableProps.indexOf(prop))`;


            const funcTemplate = b.template(`
              jsxQuery.ternary(TEST, CONSEQUENT, ALTERNATE)
              `);

        conditionalExpressionPath.replaceWith
           (
          // b.template(
          //   `jsxQuery.ternary(() => TEST, CONSEQUENT, ALTERNATE)`
          //   // `((TEST) && (TEST)) ? CONSEQUENT : ALTERNATE`
          // )
          funcTemplate
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

// module.exports = function(b) {
//   console.log('TRANSFORMIN CONDITITONAL AEPJASDFJASDLKFJLASDKFJAJSKSJDAFLK')
//   return {
//     visitor: {
//       // CallExpression(path) {
//       //   // if (path.name !== 'createElement' && (path.property && path.property.name !== 'createElement'))
//       //   //   return;
//       //   path.traverse({
//           ConditionalExpression(conditionalExpressionPath) {
//             console.log(conditionalExpressionPath)

//             // if (!isWithinCreateElementCall(conditionalExpressionPath))
//             //   return;

//           //   var identifiersExceptPropertyNames = [];
//           //   conditionalExpressionPath.traverse({
//           //     Identifier(identifierPath) {
//           //       console.log(identifierPath)
//           //       if (identifierPath.node.end > conditionalExpressionPath.node.test.end || identifierPath.node === identifierPath.parent.property)
//           //         return;
//           //       identifiersExceptPropertyNames.push(identifierPath.node.name);
//           //     },
//           //   });
//           //   const commaJoinedIdentifiers = identifiersExceptPropertyNames.join(', ');
//           //   const LOADED_PROPS = `[${commaJoinedIdentifiers}].any(prop => ~this.loadedProps.indexOf(prop))`;
//           //   const MUTABLE_PROPS = `[${commaJoinedIdentifiers}].any(prop => ~this.mutableProps.indexOf(prop))`;
//           //   console.log('===================================LOADEDPROPS')
//           //   console.log(LOADED_PROPS)
//           //   console.log('===================================MUTABLEPROPS')
//           //   console.log(MUTABLE_PROPS)


//           //   const funcTemplate = b.template(`
//           //     jsxQuery.ternary(() => TEST, CONSEQUENT, ALTERNATE, ${LOADED_PROPS}, ${MUTABLE_PROPS})
//           //     `);

//           //   // // SHOULD ONLY REPLACE WITHIN CREATEELEMENT CALLS.
//           //   // // or rather, should only replace when either the consequent, alternate,
//           //   // // or entire expression is in a createelement call's arguments??
//           //   // // ok: either the ternary expression is right int he createelemnt call
//           //   // // or it was assigned to a variable that is in that place.

//           //   conditionalExpressionPath.replaceWith(
//           //     funcTemplate({
//           //       TEST: conditionalExpressionPath.node.test,
//           //       CONSEQUENT: conditionalExpressionPath.node.consequent,
//           //       ALTERNATE: conditionalExpressionPath.node.alternate,
//           //     })
//           //   );
//           // },
//       //   });
//       },

     
//     },

//   };
  
