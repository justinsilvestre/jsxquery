import Proxy from 'harmony-proxy';

function getHandler(target, name) {
  return name in target
    ? target[name]
    : chainable(...target.chain.concat(name))
}

function chainable(...chain) {
  var obj = {};
  obj.chain = chain;
  obj.initialValue = () => '${' + chain.join('.') + '}'
  return new Proxy(obj, {
    get: getHandler,
  });
}

export default class PropListTransform {
  constructor(transform) {
    this.transformType = transform.type;
    const { callback, parent, initialName, value, wasLoaded } = transform;
    Object.assign(this, { callback, parent, initialName, value, wasLoaded })
  }

  initialValue() {
    const loopVar = this.initialName + 'Item';
    const varStatus = this.callback.length > 1 ? this.initialName + 'Index' : false;
    return (
      <c:forEach var={loopVar} items={this.value} varStatus={varStatus}>
        {this.callback(chainable(loopVar), chainable(varStatus).loop)}
      </c:forEach>
    );
  }
}
