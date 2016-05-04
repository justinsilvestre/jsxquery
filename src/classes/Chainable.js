import Proxy from 'harmony-proxy';

function getHandler(target, name) {
  return name in target
    ? target[name]
    : new Chainable(...target.chain.concat(name))
}

function Chainable(...chain) {
  var obj = {};
  obj.chain = chain;
  obj.initialValue = () => '${' + chain.join('.') + '}'
  return new Proxy(obj, {
    get: getHandler,
  });
}

function isChainable(val) {
  return val
    && typeof val === 'object'
    && 'chain' in val
    && 'initialValue' in val;
}

export default Object.assign(Chainable, { isChainable });
