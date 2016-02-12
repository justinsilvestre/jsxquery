function isClassNamesCall(path) {
    ((path.node.callee.type ==='Identifier' && path.node.callee.name === 'classNames')
    || path.node.callee.type === 'MemberExpression' && path.node.callee.property.name === 'classNames');
}

module.exports = function(b) {
  return {
    visitor: {
      CallExpression(path) {
        if (!isClassNamesCall(path))
          return;

        const funcTemplate = b.template(`jsxQuery.classNames(OBJ, this.loadedProps, this.mutableProps)`);

        path.replaceWith(funcTemplate({ OBJ: path.node.arguments[0]}))
      },
    },
  };
};

// if i make props getters,
// then i can use predicate functions (like in conditional nodes' 'test' properties)
// to keep track of which props are dependencies.
// perhaps this could work by switching logical operators/order of logical operands?

// OK:
// say a list should have a "RED" class if the list has more than 5 items.
// the call would be written like:
//    A) className={classNames({ red: this.props.itemList.length > 5 })}
//    B) className={classNames({ red: tooMany })}
// so with each addItem call,
//    with each click on addItemButton,
//       A) addItem(itemData)
//       B) addItem(itemData)
//          setTooMany(itemList.length > 5)
// option A requires that we transform className calls

// it seems having classnames identical to their linked prop names is ideal
// not only for not requiring a transform,
// but also because it would enforce semantic class names, instead of things like 'red.'

// in any case, 