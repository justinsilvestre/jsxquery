module.exports = function(b) {
  return {
    // visitor: {}
    visitor: {
      JSXNamespacedName(path) {
        const newName = path.node.namespace.name + ':' + path.node.name.name;
        path.replaceWith(b.types.JSXIdentifier(newName));
      },
    },
  };
};
