import Prop from './classes/Prop';
import PropCall from './classes/PropCall';
import ConditionalValue from './classes/ConditionalValue'

export default function(test, consequent, alternate) {
  if (Prop.isProp(test) || PropCall.isPropCall(test))
    return new ConditionalValue(test, consequent, alternate);

  if (test)
    return consequent;
  else
    return alternate;
}