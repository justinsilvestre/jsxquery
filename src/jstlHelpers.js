import Element, { createElement } from './classes/Element';
import { escape, identity } from 'lodash';
const jsxQuery = { createElement };

export function cChoose(testValue, consequent, alternate, raw) {
  const consequentIsPresent = consequent != null;
  const alternateIsPresent = alternate != null;
  const loneOption = consequentIsPresent && alternateIsPresent ? null : (consequentIsPresent ? consequent : alternate);
  if (Element.isElement(consequentIsPresent ? consequent : alternate)) {
    const testInBrackets = '${'
      + (loneOption && alternateIsPresent ? '!(' : '')
      + testValue
      + (loneOption && alternateIsPresent ? ')' : '')
      + '}';

    return loneOption ?
      (<c:if test={testInBrackets} dangerouslySetInnerHTML={{ __html: loneOption }}>
      </c:if>)
      :
      (<c:choose>
        <c:when test={testInBrackets}>{consequent}</c:when>
        <c:otherwise>{alternate}</c:otherwise>
      </c:choose>);
  } else {
    const escapeOrNot = raw ? identity : escape;
    const consequentDisplay = consequentIsPresent ? JSON.stringify(escapeOrNot(consequent)) : `''`;
    const alternateDisplay = alternateIsPresent ? JSON.stringify(escapeOrNot(alternate)) : `''`;
    return '${' + `${testValue} ? ${consequentDisplay} : ${alternateDisplay}` + '}';
  }
}
